"use client";

import { Render } from "@puckeditor/core";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
  COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
  isComponentLabPreviewRenderMessage,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";
import {
  getComponentLabDraggedPlacement,
  getComponentLabKeyboardPlacement,
  type ComponentLabGridOperation,
} from "@/lib/component-lab-grid-interaction";
import {
  isGridPlacement,
  normalizeComponentDesignDocument,
  type ComponentGridPlacement,
} from "@/lib/component-design-v2";
import {
  getLogicalViewportUnit,
  SITE_VIEWPORT_UNIT_CSS_VAR,
} from "@/lib/preview-viewports";
import config from "@/puck/config";
import { createStaticSurfaceConfig } from "@/puck/render-adapter";

type NodeRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type DragState = {
  gridGap: number;
  gridWidth: number;
  mode: ComponentLabGridOperation;
  originClientX: number;
  originPlacement: ComponentGridPlacement;
};

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

function NodeOverlay({
  message,
}: {
  message: ComponentLabPreviewRenderMessage;
}) {
  const activeBreakpoint = message.activeBreakpoint!;
  const component = message.component!;
  const selectedNodeId = message.selectedNodeId!;
  const variant = message.variant!;
  const [rects, setRects] = useState<NodeRect[]>([]);
  const dragStateRef = useRef<DragState | null>(null);
  const lastPlacementRef = useRef<ComponentGridPlacement | null>(null);
  const selectedNode = message.designDocument.components[component]
    .variants[variant]?.nodes[selectedNodeId];
  const placement = selectedNode?.placement[activeBreakpoint];
  const placementLocked = selectedNode?.bleed === "viewport";

  const reportSelection = useCallback((nodeId: string) => {
    window.parent.postMessage(
      {
        nodeId,
        type: COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
      },
      window.location.origin,
    );
  }, []);

  const reportPlacement = useCallback((
    nextPlacement: ComponentGridPlacement,
  ) => {
    if (
      lastPlacementRef.current?.start === nextPlacement.start &&
      lastPlacementRef.current?.span === nextPlacement.span
    ) {
      return;
    }
    lastPlacementRef.current = nextPlacement;
    window.parent.postMessage(
      {
        breakpoint: activeBreakpoint,
        nodeId: selectedNodeId,
        placement: nextPlacement,
        type: COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
      },
      window.location.origin,
    );
  }, [activeBreakpoint, selectedNodeId]);

  const measure = useCallback(() => {
    if (!selectedNodeId) {
      setRects([]);
      return;
    }
    const selector = `[data-component-lab-node="${CSS.escape(selectedNodeId)}"]`;
    const nextRects = [...document.querySelectorAll<HTMLElement>(selector)].map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        height: rect.height,
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
      };
    });
    setRects(nextRects);
  }, [selectedNodeId]);

  useEffect(() => {
    let frameId = 0;
    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };
    requestMeasure();
    const observer = new ResizeObserver(requestMeasure);
    document.querySelectorAll<HTMLElement>("[data-component-lab-node]")
      .forEach((node) => observer.observe(node));
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("scroll", requestMeasure, true);
    void document.fonts.ready.then(requestMeasure).catch(() => undefined);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("scroll", requestMeasure, true);
    };
  }, [measure, message.designDocument]);

  useEffect(() => {
    lastPlacementRef.current = placement ?? null;
  }, [placement]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      const nextPlacement = getComponentLabDraggedPlacement({
        clientX: event.clientX,
        gridGap: dragState.gridGap,
        gridWidth: dragState.gridWidth,
        operation: dragState.mode,
        originClientX: dragState.originClientX,
        originPlacement: dragState.originPlacement,
      });
      reportPlacement(nextPlacement);
    };
    const handlePointerUp = () => {
      dragStateRef.current = null;
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [reportPlacement]);

  function beginDrag(
    event: ReactPointerEvent,
    mode: ComponentLabGridOperation,
  ) {
    if (!placement || placementLocked) return;
    event.preventDefault();
    event.stopPropagation();
    const target = document.querySelector<HTMLElement>(
      `[data-component-lab-node="${CSS.escape(selectedNodeId)}"]`,
    );
    const grid = target?.closest<HTMLElement>(".grid-container") ??
      document.querySelector<HTMLElement>(".grid-container");
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const gridStyles = getComputedStyle(grid);
    const gridGap = Number.parseFloat(gridStyles.columnGap) || 0;
    dragStateRef.current = {
      gridGap,
      gridWidth: gridRect.width,
      mode,
      originClientX: event.clientX,
      originPlacement: placement,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleShieldPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const node = document.elementsFromPoint(event.clientX, event.clientY)
      .find((candidate) =>
        candidate instanceof HTMLElement &&
        candidate.dataset.componentLabNode
      ) as HTMLElement | undefined;
    const nodeId = node?.dataset.componentLabNode;
    if (!nodeId) return;
    if (nodeId !== selectedNodeId) {
      reportSelection(nodeId);
      return;
    }
    beginDrag(event, "move");
  }

  function handleKeyboard(
    event: React.KeyboardEvent,
    operation: ComponentLabGridOperation,
  ) {
    if (!placement || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const nextPlacement = getComponentLabKeyboardPlacement({
      key: event.key,
      operation,
      placement,
    });
    if (isGridPlacement(nextPlacement)) reportPlacement(nextPlacement);
  }

  return (
    <div
      className="absolute inset-0 z-50 cursor-default touch-none"
      aria-label="ComponentLab 排版操作层"
      onPointerDown={handleShieldPointerDown}
    >
      {rects.map((rect, index) => (
        <div
          key={`${rect.left}-${rect.top}-${index}`}
          className="pointer-events-none absolute border border-cyan-300/90 bg-cyan-300/[0.04]"
          style={rect}
        />
      ))}
      {rects[0] && placement ? (
        <div
          className="absolute"
          style={{
            height: `${Math.max(24, rects[0].height)}px`,
            left: `${rects[0].left}px`,
            top: `${rects[0].top}px`,
            width: `${Math.max(24, rects[0].width)}px`,
          }}
        >
          <button
            type="button"
            aria-label={placementLocked
              ? `${selectedNodeId} 延伸至视口，锚定页面第 1 至 12 格`
              : `移动 ${selectedNodeId}，方向键移动一格，Shift 加方向键改变跨度`}
            className={`absolute inset-0 border border-cyan-200 bg-black/65 text-[10px] text-cyan-100 backdrop-blur-sm ${
              placementLocked
                ? "cursor-default"
                : "cursor-grab active:cursor-grabbing"
            }`}
            onKeyDown={placementLocked
              ? undefined
              : (event) => handleKeyboard(
                event,
                event.shiftKey ? "resize-right" : "move",
              )}
            onPointerDown={placementLocked
              ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
              : (event) => beginDrag(event, "move")}
          >
            <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 bg-black/80 px-1.5 py-0.5">
              {placementLocked
                ? "VIEWPORT · 1–12"
                : `${placement.start}–${placement.start + placement.span - 1}`}
            </span>
          </button>
          {placementLocked ? null : (
            <>
              <button
                type="button"
                aria-label="拖动左边缘调整起始格"
                className="absolute inset-y-0 -left-2 w-4 cursor-ew-resize border-x border-cyan-200 bg-cyan-200/25"
                onKeyDown={(event) => handleKeyboard(event, "resize-left")}
                onPointerDown={(event) => beginDrag(event, "resize-left")}
              />
              <button
                type="button"
                aria-label="拖动右边缘调整占据格"
                className="absolute inset-y-0 -right-2 w-4 cursor-ew-resize border-x border-cyan-200 bg-cyan-200/25"
                onKeyDown={(event) => handleKeyboard(event, "resize-right")}
                onPointerDown={(event) => beginDrag(event, "resize-right")}
              />
            </>
          )}
        </div>
      ) : null}
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
      {message?.layoutMode &&
      message.activeBreakpoint &&
      message.component &&
      message.selectedNodeId &&
      message.variant
        ? <NodeOverlay message={message} />
        : null}
    </div>
  );
}
