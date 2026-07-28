"use client";

import type { Data } from "@puckeditor/core";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { ComponentLabElementSelection } from "./ComponentElementNavigator";
import type {
  ComponentDesignBreakpoint,
  ComponentDesignDocument as ComponentDesignRuntimeDocument,
} from "@/lib/component-design-v2";
import type {
  ComponentDesignDeviceLayoutV4,
} from "@/lib/component-design-v4";
import type {
  ComponentDesignAuthorComponent,
  ComponentDesignCompositionDescriptor,
} from "@/lib/component-design-manifest";
import {
  COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  isComponentLabPreviewHeightMessage,
  isComponentLabPreviewInteractionMessage,
  isComponentLabPreviewSelectNodeMessage,
  type ComponentLabPreviewInteractionMessage,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";

export default function ComponentLabPreviewFrame({
  component,
  composition,
  data,
  device,
  editingEnabled = true,
  height,
  layout,
  onContentHeight,
  onInteraction,
  onSelection,
  renderSessionId,
  runtimeDocument,
  selection,
  showGrid,
  variant,
  viewportHeight,
  viewportWidth,
}: {
  component: ComponentDesignAuthorComponent;
  composition: readonly ComponentDesignCompositionDescriptor[];
  data: Data;
  device: ComponentDesignBreakpoint;
  editingEnabled?: boolean;
  height: number;
  layout: ComponentDesignDeviceLayoutV4;
  onContentHeight: (height: number) => void;
  onInteraction: (message: ComponentLabPreviewInteractionMessage) => void;
  onSelection: (
    selection: ComponentLabElementSelection[],
    additive: boolean,
  ) => void;
  renderSessionId: string;
  runtimeDocument: ComponentDesignRuntimeDocument;
  selection: ComponentLabElementSelection[];
  showGrid: boolean;
  variant: string;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const seqRef = useRef(0);
  const selectedTargets = useMemo(
    () => selection.map((target) => ({
      occurrenceId: String(target.occurrenceId),
      roleId: target.roleId,
    })),
    [selection],
  );
  const positioningByRole = useMemo(
    () => Object.fromEntries(
      Object.entries(layout.nodes).map(([roleId, node]) => [
        roleId,
        node.positioning,
      ]),
    ),
    [layout.nodes],
  );
  const createRenderMessage =
    useCallback((): ComponentLabPreviewRenderMessage => {
    seqRef.current += 1;
    return {
      activeBreakpoint: device,
      component,
      composition,
      data,
      designDocument: runtimeDocument,
      device,
      editingEnabled,
      layoutMode: true,
      positioningByRole,
      protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
      renderSessionId,
      selectedTargets,
      seq: seqRef.current,
      showGrid,
      type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
      variant,
      viewportHeight,
    };
  }, [
    component,
    composition,
    data,
    device,
    editingEnabled,
    positioningByRole,
    renderSessionId,
    runtimeDocument,
    selectedTargets,
    showGrid,
    variant,
    viewportHeight,
  ]);

  const postRenderMessage = useCallback(() => {
    const renderMessage = createRenderMessage();
    iframeRef.current?.contentWindow?.postMessage(
      renderMessage,
      window.location.origin,
    );
  }, [createRenderMessage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }
      if (
        event.data &&
        typeof event.data === "object" &&
        "type" in event.data &&
        event.data.type === COMPONENT_LAB_PREVIEW_READY_MESSAGE
      ) {
        postRenderMessage();
        return;
      }
      if (isComponentLabPreviewHeightMessage(event.data)) {
        if (
          event.data.renderSessionId &&
          event.data.renderSessionId !== renderSessionId
        ) {
          return;
        }
        onContentHeight(Math.max(viewportHeight, event.data.height));
        return;
      }
      if (isComponentLabPreviewSelectNodeMessage(event.data)) {
        if (event.data.renderSessionId !== renderSessionId) return;
        onSelection(
          event.data.selection.map((target) => ({
            occurrenceId: Number.parseInt(target.occurrenceId, 10) || 0,
            roleId: target.roleId,
          })),
          event.data.additive,
        );
        return;
      }
      if (isComponentLabPreviewInteractionMessage(event.data)) {
        if (event.data.renderSessionId !== renderSessionId) return;
        onInteraction(event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    postRenderMessage();
    return () => window.removeEventListener("message", handleMessage);
  }, [
    onContentHeight,
    onInteraction,
    onSelection,
    postRenderMessage,
    renderSessionId,
    viewportHeight,
  ]);

  return (
    <div
      className="relative overflow-hidden bg-black"
      style={{ height: `${height}px`, width: `${viewportWidth}px` }}
    >
      <iframe
        ref={iframeRef}
        title="ComponentLab 实际页面预览"
        src="/component-lab-preview"
        scrolling="no"
        onLoad={postRenderMessage}
        className="block border-0 bg-black"
        style={{ height: `${height}px`, width: `${viewportWidth}px` }}
      />
    </div>
  );
}
