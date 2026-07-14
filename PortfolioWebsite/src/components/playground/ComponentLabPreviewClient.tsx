"use client";

import { Render } from "@puckeditor/core";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  isComponentLabPreviewRenderMessage,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";
import { normalizeComponentDesignDocument } from "@/lib/component-design-schema";
import {
  getLogicalViewportUnit,
  SITE_VIEWPORT_UNIT_CSS_VAR,
} from "@/lib/preview-viewports";
import config from "@/puck/config";
import { createStaticSurfaceConfig } from "@/puck/render-adapter";

function GridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      <div className="grid-container h-full">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className="h-full border-x border-white/15 bg-white/[0.025]" />
        ))}
      </div>
    </div>
  );
}

export default function ComponentLabPreviewClient() {
  const [message, setMessage] = useState<ComponentLabPreviewRenderMessage | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const designDocument = message?.designDocument;
  const viewportHeight = message?.viewportHeight;
  const previewConfig = useMemo(
    () => designDocument
      ? createStaticSurfaceConfig(config, {
        designDocument: normalizeComponentDesignDocument(designDocument),
        surface: "lab",
      })
      : null,
    [designDocument],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (isComponentLabPreviewRenderMessage(event.data)) {
        setMessage(event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      { type: COMPONENT_LAB_PREVIEW_READY_MESSAGE },
      window.location.origin,
    );
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (!viewportHeight) return;
    const previousUnit = htmlElement.style.getPropertyValue(SITE_VIEWPORT_UNIT_CSS_VAR);
    const previousBodyMinHeight = document.body.style.minHeight;
    htmlElement.style.setProperty(
      SITE_VIEWPORT_UNIT_CSS_VAR,
      getLogicalViewportUnit({ height: viewportHeight }),
    );
    // 完整公开页天然存在纵向滚动条；单组件也保留 1px 自然溢出，确保 vw 与栅格可用宽度一致。
    document.body.style.minHeight = "calc(100vh + 1px)";
    return () => {
      if (previousUnit) {
        htmlElement.style.setProperty(SITE_VIEWPORT_UNIT_CSS_VAR, previousUnit);
      } else {
        htmlElement.style.removeProperty(SITE_VIEWPORT_UNIT_CSS_VAR);
      }
      document.body.style.minHeight = previousBodyMinHeight;
    };
  }, [viewportHeight]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node || !message) return;
    let frameId = 0;
    let cancelled = false;
    const reportHeight = () => {
      if (cancelled) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (cancelled) return;
        window.parent.postMessage(
          {
            height: Math.max(message.viewportHeight, node.scrollHeight),
            type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
          },
          window.location.origin,
        );
      });
    };
    reportHeight();
    const observer = new ResizeObserver(reportHeight);
    observer.observe(node);
    void document.fonts.ready.then(reportHeight).catch(() => undefined);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [message]);

  return (
    <div
      ref={contentRef}
      className="relative overflow-x-hidden bg-black"
      style={{ minHeight: `${message?.viewportHeight ?? 1}px` }}
    >
      {message?.showGrid ? <GridOverlay /> : null}
      {message && previewConfig ? <Render config={previewConfig} data={message.data} /> : null}
    </div>
  );
}
