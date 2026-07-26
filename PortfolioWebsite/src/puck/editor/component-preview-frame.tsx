"use client";

import type { Data } from "@puckeditor/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ComponentDesignDocument } from "@/lib/component-design-v2";
import {
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";
import type { ComponentLabNode } from "@/lib/component-lab-presets";
import {
  getEditorComponentMeta,
} from "@/puck/editor/component-metadata";
import { formatEditorTechnicalName } from "@/puck/editor/editor-data";
import type { PuckComponentType } from "@/puck/component-manifest";

import styles from "../editor-shell.module.css";

export type ComponentPreviewRequest = {
  anchorTop: number;
  type: PuckComponentType;
} | null;

function createPreviewData(node: ComponentLabNode): Data {
  return {
    content: [node],
    root: {
      props: {
        title: node.type,
      },
    },
    zones: {},
  } as Data;
}

export function ComponentPreviewFrame({
  designDocument,
  preview,
  samples,
}: {
  designDocument: ComponentDesignDocument;
  preview: ComponentPreviewRequest;
  samples: Record<PuckComponentType, ComponentLabNode>;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const meta = preview ? getEditorComponentMeta(preview.type) : null;
  const sample = preview ? samples[preview.type] : null;
  const message = useMemo<ComponentLabPreviewRenderMessage | null>(() => {
    if (!sample) return null;
    return {
      data: createPreviewData(sample),
      designDocument,
      showGrid: false,
      type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
      viewportHeight: 900,
    };
  }, [designDocument, sample]);

  const postRenderMessage = useCallback(() => {
    if (!isReady || !message || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage(message, window.location.origin);
  }, [isReady, message]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin === window.location.origin &&
        event.source === frameRef.current?.contentWindow &&
        event.data &&
        typeof event.data === "object" &&
        "type" in event.data &&
        event.data.type === COMPONENT_LAB_PREVIEW_READY_MESSAGE
      ) {
        setIsReady(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    postRenderMessage();
  }, [postRenderMessage]);

  const viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight;
  const top = preview
    ? Math.max(68, Math.min(viewportHeight - 382, preview.anchorTop - 48))
    : 68;

  return (
    <aside
      aria-hidden={!preview}
      className={styles.componentPreviewPopover}
      data-visible={Boolean(preview)}
      style={{ top }}
    >
      <div className={styles.componentPreviewHeader}>
        <span>{meta?.label ?? "组件预览"}</span>
        <code title={meta?.type}>
          {meta ? formatEditorTechnicalName(meta.type) : ""}
        </code>
      </div>
      <p className={styles.componentPreviewDescription}>
        {meta?.description ?? "将鼠标停留在组件上查看真实效果。"}
      </p>
      <div className={styles.componentPreviewViewport}>
        <iframe
          ref={frameRef}
          className={styles.componentPreviewIframe}
          onLoad={() => setIsReady(false)}
          src="/component-lab-preview"
          tabIndex={-1}
          title="组件真实效果预览"
        />
        {!message && (
          <div className={styles.componentPreviewFallback}>等待选择组件</div>
        )}
      </div>
    </aside>
  );
}
