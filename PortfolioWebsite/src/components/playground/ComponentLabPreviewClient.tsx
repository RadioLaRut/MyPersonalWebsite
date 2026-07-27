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
  COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
  COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE,
  guardComponentLabPreviewRenderMessage,
  hasComponentLabPreviewV3RenderContext,
  isComponentLabPreviewRenderMessage,
  type ComponentLabPreviewFlowPosition,
  type ComponentLabPreviewInteractionPhase,
  type ComponentLabPreviewInteractionTarget,
  type ComponentLabPreviewPosition,
  type ComponentLabPreviewRenderGuardState,
  type ComponentLabPreviewRenderMessage,
  type ComponentLabPreviewSelectionTarget,
  type ComponentLabPreviewVerticalOperation,
} from "@/lib/component-lab-preview-messages";
import {
  getComponentLabDraggedPlacement,
  getComponentLabFlowVerticalOperation,
  getComponentLabKeyboardPlacement,
  getComponentLabOverlayVerticalOperation,
  getComponentLabReorderedFlowOrders,
  hasComponentLabDragThresholdBeenCrossed,
  type ComponentLabFlowCandidate,
  type ComponentLabGridOperation,
} from "@/lib/component-lab-grid-interaction";
import {
  areComponentLabSelectionTargetsEqual,
  getComponentLabOccurrenceId,
  pickComponentLabHitCandidate,
  resolveComponentLabPointerCoordinates,
  updateComponentLabSelection,
  type ComponentLabHitCandidate,
} from "@/lib/component-lab-preview-interaction";
import {
  getComponentLabRepeatedOccurrenceCounts,
} from "@/lib/component-lab-repeated-occurrences";
import {
  isGridPlacement,
  normalizeComponentDesignDocument,
  type ComponentGridPlacement,
} from "@/lib/component-design-v2";
import {
  getComponentDesignNodeDescriptor,
  getComponentDesignVariantDescriptor,
} from "@/lib/component-design-manifest";
import type { ComponentLabNode } from "@/lib/component-lab-presets";
import {
  createVariantSamplePlaceholders,
  extractVariantSampleText,
} from "@/lib/component-lab-sample-text";
import {
  getLogicalViewportUnit,
  SITE_VIEWPORT_UNIT_CSS_VAR,
} from "@/lib/preview-viewports";
import config from "@/puck/config";
import { createStaticSurfaceConfig } from "@/puck/render-adapter";

type NodeRect = {
  height: number;
  left: number;
  occurrenceId: string;
  roleId: string;
  top: number;
  width: number;
};

type DragOrigin = {
  element: HTMLElement;
  placement: ComponentGridPlacement;
  position: ComponentLabPreviewPosition;
  rect: NodeRect;
  rootHeight: number;
  rootTop: number;
  target: ComponentLabPreviewSelectionTarget;
};

type DragState = {
  coordinateScaleX: number;
  coordinateScaleY: number;
  flowCandidates: ComponentLabFlowCandidate[];
  gridGap: number;
  gridWidth: number;
  lastPreviewSignature: string;
  mode: ComponentLabGridOperation;
  originClientX: number;
  originClientY: number;
  origins: DragOrigin[];
  pointerId: number;
  primary: ComponentLabPreviewSelectionTarget;
  started: boolean;
};

type InlineTextEdit = {
  originalText: string;
  rect: NodeRect;
  target: ComponentLabPreviewSelectionTarget;
  text: string;
};

type GeneratedPlaceholder = {
  rect: NodeRect;
  text: string;
};

type DragPreviewGuide = {
  insertion?: {
    label: string;
    left: number;
    top: number;
    width: number;
  };
  placementLabel: string;
};

const DEFAULT_FLOW_POSITION: ComponentLabPreviewFlowPosition = {
  gapBefore: 0,
  mode: "flow",
  order: 0,
};

function GridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
      <div className="grid-container h-full">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className="h-full border-x border-white/15 bg-white/[0.025]"
          />
        ))}
      </div>
    </div>
  );
}

function getElementDepth(element: HTMLElement) {
  let depth = 0;
  let current: HTMLElement | null = element;
  while (current?.parentElement) {
    depth += 1;
    current = current.parentElement;
  }
  return depth;
}

function getElementText(element: HTMLElement) {
  if (element.dataset.componentLabGeneratedPlaceholder) return "";
  const candidates = [
    ...element.querySelectorAll<HTMLElement>(
      "[data-component-lab-text-target],h1,h2,h3,h4,h5,h6,p,a,button",
    ),
  ];
  const target = candidates.find((candidate) =>
    (candidate.innerText || candidate.textContent || "").trim().length > 0
  ) ?? element;
  return (target.innerText || target.textContent || "")
    .replace(/\u00a0/g, " ")
    .trim();
}

function replaceLongestVisibleTextNode(
  element: HTMLElement,
  text: string,
  withinResponsiveVariant = false,
): boolean {
  if (!withinResponsiveVariant) {
    const responsiveVariants = element.matches(
        ".typography-responsive-variant"
      )
      ? [element]
      : [
        ...element.querySelectorAll<HTMLElement>(
          ".typography-responsive-variant",
        ),
      ];
    if (responsiveVariants.length > 0) {
      return responsiveVariants
        .map((variant): boolean =>
          replaceLongestVisibleTextNode(variant, text, true)
        )
        .some(Boolean);
    }
  }

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );
  const candidates: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    if (
      current instanceof Text &&
      current.data.trim() &&
      current.parentElement &&
      !current.parentElement.closest(
        "script,style,[data-component-lab-generated-placeholder]",
      )
    ) {
      candidates.push(current);
    }
    current = walker.nextNode();
  }
  const target = candidates.sort(
    (left, right) => right.data.trim().length - left.data.trim().length,
  )[0];
  if (!target) return false;
  const leading = target.data.match(/^\s*/)?.[0] ?? "";
  const trailing = target.data.match(/\s*$/)?.[0] ?? "";
  target.data = `${leading}${text}${trailing}`;
  return true;
}

function selectionSignature(
  selection: readonly ComponentLabPreviewSelectionTarget[],
) {
  return selection
    .map(({ roleId, occurrenceId }) => `${roleId}\u0000${occurrenceId}`)
    .join("\u0001");
}

function getInitialSelection(
  message: ComponentLabPreviewRenderMessage,
): ComponentLabPreviewSelectionTarget[] {
  if (message.selectedTargets) return message.selectedTargets;
  const roleId = message.roleId ?? message.selectedNodeId;
  if (!roleId) return [];
  return [{
    occurrenceId: message.occurrenceId ??
      getComponentLabOccurrenceId(roleId, 0),
    roleId,
  }];
}

function getNodeRect(
  element: HTMLElement,
  target: ComponentLabPreviewSelectionTarget,
): NodeRect {
  const rect = element.getBoundingClientRect();
  return {
    height: rect.height,
    left: rect.left + window.scrollX,
    occurrenceId: target.occurrenceId,
    roleId: target.roleId,
    top: rect.top + window.scrollY,
    width: rect.width,
  };
}

function getClosestGridRoot(element: HTMLElement) {
  const grid = element.closest<HTMLElement>(".grid-container") ??
    document.querySelector<HTMLElement>(".grid-container");
  if (!grid) return null;
  const rect = grid.getBoundingClientRect();
  return {
    element: grid,
    height: rect.height,
    top: rect.top + window.scrollY,
  };
}

function indexAnnotatedElements() {
  const roleCounts = new Map<string, number>();
  document.querySelectorAll<HTMLElement>("[data-component-lab-node]")
    .forEach((element) => {
      const roleId = element.dataset.componentLabNode;
      if (!roleId) return;
      const index = roleCounts.get(roleId) ?? 0;
      roleCounts.set(roleId, index + 1);
      if (!element.dataset.componentLabOccurrence) {
        element.dataset.componentLabOccurrence =
          getComponentLabOccurrenceId(roleId, index);
      }
    });
}

function resolveTargetElement(
  target: ComponentLabPreviewSelectionTarget,
) {
  indexAnnotatedElements();
  const selector = `[data-component-lab-node="${CSS.escape(target.roleId)}"]`;
  const matches = [...document.querySelectorAll<HTMLElement>(selector)]
    .filter((element) =>
      element.dataset.componentLabOccurrence === target.occurrenceId
    );
  return matches.find((element) =>
    Boolean(element.dataset.componentLabGeneratedPlaceholder)
  ) ?? matches[0] ?? null;
}

function inferPositionMode(element: HTMLElement) {
  if (element.dataset.componentLabPositioning === "overlay") return "overlay";
  if (element.dataset.componentLabPositioning === "flow") return "flow";
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const position = getComputedStyle(current).position;
    if (position === "absolute" || position === "fixed") return "overlay";
    current = current.parentElement;
  }
  return "flow";
}

function NodeOverlay({
  message,
  nextResponseSeq,
}: {
  message: ComponentLabPreviewRenderMessage;
  nextResponseSeq: () => number;
}) {
  const activeDevice = message.device ?? message.activeBreakpoint!;
  const component = message.component!;
  const editingEnabled = message.editingEnabled ?? true;
  const variant = message.variant!;
  const [selection, setSelection] =
    useState<ComponentLabPreviewSelectionTarget[]>(
      () => getInitialSelection(message),
    );
  const [rects, setRects] = useState<NodeRect[]>([]);
  const [inlineTextEdit, setInlineTextEdit] =
    useState<InlineTextEdit | null>(null);
  const [generatedPlaceholders, setGeneratedPlaceholders] =
    useState<GeneratedPlaceholder[]>([]);
  const [dragPreviewRects, setDragPreviewRects] =
    useState<NodeRect[] | null>(null);
  const [dragPreviewGuide, setDragPreviewGuide] =
    useState<DragPreviewGuide | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const selectionRef = useRef(selection);
  const inlineTextEditRef = useRef(inlineTextEdit);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    inlineTextEditRef.current = inlineTextEdit;
  }, [inlineTextEdit]);

  const getResponseContext = useCallback((
    target: ComponentLabPreviewSelectionTarget,
  ) => ({
    component,
    device: activeDevice,
    occurrenceId: target.occurrenceId,
    protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
    renderSessionId: message.renderSessionId ??
      `legacy:${component}:${variant}`,
    roleId: target.roleId,
    seq: nextResponseSeq(),
    variant,
  }), [
    activeDevice,
    component,
    message.renderSessionId,
    nextResponseSeq,
    variant,
  ]);

  const reportSelection = useCallback((
    target: ComponentLabPreviewSelectionTarget,
    nextSelection: ComponentLabPreviewSelectionTarget[],
    additive: boolean,
  ) => {
    window.parent.postMessage(
      {
        ...getResponseContext(target),
        additive,
        nodeId: target.roleId,
        operation: "select",
        phase: "commit",
        selection: nextSelection,
        type: COMPONENT_LAB_PREVIEW_SELECT_NODE_MESSAGE,
      },
      window.location.origin,
    );
  }, [getResponseContext]);

  const reportText = useCallback((
    edit: InlineTextEdit,
    phase: "preview" | "commit" | "cancel",
    text: string,
  ) => {
    window.parent.postMessage(
      {
        ...getResponseContext(edit.target),
        nodeId: edit.target.roleId,
        operation: "text",
        phase,
        text,
        type: COMPONENT_LAB_PREVIEW_TEXT_CHANGE_MESSAGE,
      },
      window.location.origin,
    );
  }, [getResponseContext]);

  const getPlacement = useCallback((roleId: string) =>
    message.designDocument.components[component]
      .variants[variant]?.nodes[roleId]?.placement[activeDevice], [
    activeDevice,
    component,
    message.designDocument,
    variant,
  ]);

  const getPosition = useCallback((
    roleId: string,
    element: HTMLElement,
  ): ComponentLabPreviewPosition => {
    const explicit = message.positioningByRole?.[roleId];
    if (explicit) return explicit;
    if (inferPositionMode(element) === "overlay") {
      return { anchor: "center", mode: "overlay", offset: 0 };
    }
    const descriptor = getComponentDesignVariantDescriptor(component, variant);
    return {
      ...DEFAULT_FLOW_POSITION,
      order: Math.max(
        0,
        descriptor.nodes.findIndex((node) => node.id === roleId),
      ),
    };
  }, [component, message.positioningByRole, variant]);

  const applyVirtualSampleText = useCallback(() => {
    const sampleNode = message.data.content[0] as ComponentLabNode | undefined;
    if (!sampleNode) return;
    const descriptor = getComponentDesignVariantDescriptor(component, variant);
    const effectiveText = extractVariantSampleText(
      component,
      variant,
      sampleNode,
    );
    descriptor.nodes
      .filter((node) => node.sampleBinding?.kind === "virtual")
      .forEach((node) => {
        const values = effectiveText[node.id];
        const elements = [
          ...document.querySelectorAll<HTMLElement>(
            `[data-component-lab-node="${CSS.escape(node.id)}"]:not([data-component-lab-generated-placeholder])`,
          ),
        ];
        elements.forEach((element, occurrence) => {
          const value = Array.isArray(values)
            ? values[occurrence] ?? ""
            : values ?? "";
          replaceLongestVisibleTextNode(element, value);
        });
      });
  }, [component, message.data, variant]);

  const refreshGeneratedPlaceholders = useCallback(() => {
    const sampleNode = message.data.content[0] as ComponentLabNode | undefined;
    if (!sampleNode) {
      setGeneratedPlaceholders([]);
      return;
    }
    indexAnnotatedElements();
    const descriptor = getComponentDesignVariantDescriptor(component, variant);
    const emptyPlaceholders = createVariantSamplePlaceholders(
      component,
      variant,
      sampleNode,
    );
    const effectiveText = extractVariantSampleText(
      component,
      variant,
      sampleNode,
    );
    const grid = document.querySelector<HTMLElement>(".grid-container");
    if (!grid) {
      setGeneratedPlaceholders([]);
      return;
    }
    const actualElements = [
      ...document.querySelectorAll<HTMLElement>(
        "[data-component-lab-node]:not([data-component-lab-generated-placeholder])",
      ),
    ];
    const actualByRole = new Map<string, HTMLElement[]>();
    actualElements.forEach((element) => {
      const roleId = element.dataset.componentLabNode;
      if (!roleId) return;
      const current = actualByRole.get(roleId) ?? [];
      current.push(element);
      actualByRole.set(roleId, current);
    });
    const repeatedOccurrenceCounts = getComponentLabRepeatedOccurrenceCounts({
      actualCounts: Object.fromEntries(
        [...actualByRole].map(([roleId, elements]) => [
          roleId,
          elements.length,
        ]),
      ),
      descriptor,
      sampleText: effectiveText,
    });

    const next: GeneratedPlaceholder[] = [];
    descriptor.nodes.forEach((node, descriptorIndex) => {
      const sampleBinding = node.sampleBinding;
      const actual = actualByRole.get(node.id) ?? [];
      const emptyForRole = emptyPlaceholders.filter(
        (placeholder) => placeholder.roleId === node.id,
      );
      const value = effectiveText[node.id];
      const expectedOccurrences = node.repeated
        ? repeatedOccurrenceCounts[node.id] ?? 1
        : Array.isArray(value)
          ? Math.max(1, value.length)
          : 1;
      const missingOccurrences = new Set<number>(
        emptyForRole.map(({ occurrence }) => occurrence),
      );
      if (actual.length < expectedOccurrences) {
        for (
          let occurrence = actual.length;
          occurrence < expectedOccurrences;
          occurrence += 1
        ) {
          missingOccurrences.add(occurrence);
        }
      }
      missingOccurrences.forEach((occurrence) => {
        const empty = emptyForRole.find(
          (placeholder) => placeholder.occurrence === occurrence,
        );
        if (actual[occurrence] && !empty) return;
        const placement = getPlacement(node.id);
        if (!placement) return;
        const previousActual = descriptor.nodes
          .slice(0, descriptorIndex)
          .reverse()
          .flatMap((candidate) => actualByRole.get(candidate.id) ?? [])[0];
        const nextActual = descriptor.nodes
          .slice(descriptorIndex + 1)
          .flatMap((candidate) => actualByRole.get(candidate.id) ?? [])[0];
        const correspondingGrid = (
          actual[occurrence] ??
          previousActual ??
          nextActual
        )?.closest<HTMLElement>(".grid-container") ?? grid;
        const gridRect = correspondingGrid.getBoundingClientRect();
        const gridStyles = getComputedStyle(correspondingGrid);
        const gridGap = Number.parseFloat(gridStyles.columnGap) || 0;
        const columnWidth = Math.max(
          1,
          (gridRect.width - gridGap * 11) / 12,
        );
        const pitch = columnWidth + gridGap;
        const rootTop = gridRect.top + window.scrollY;
        const rootHeight = gridRect.height;
        let width = placement.span * columnWidth +
          (placement.span - 1) * gridGap;
        let left = gridRect.left + window.scrollX +
          (placement.start - 1) * pitch;
        const position = message.positioningByRole?.[node.id];
        const placeholderHeight = node.kind === "media"
          ? 120
          : node.kind === "container" || node.kind === "repeater"
            ? 56
            : 34;
        let top: number;
        const existingRect = actual[occurrence]?.getBoundingClientRect();
        if (existingRect) {
          left = existingRect.left + window.scrollX;
          top = existingRect.top + window.scrollY;
          width = Math.max(120, existingRect.width);
        } else if (position?.mode === "overlay") {
          const anchorTop = position.anchor === "top"
            ? rootTop + 24
            : position.anchor === "center"
              ? rootTop + (rootHeight - placeholderHeight) / 2
              : rootTop + rootHeight - placeholderHeight - 24;
          top = anchorTop + position.offset;
        } else {
          if (previousActual) {
            const previousRect = previousActual.getBoundingClientRect();
            top = previousRect.bottom + window.scrollY + 8;
          } else if (nextActual) {
            const nextRect = nextActual.getBoundingClientRect();
            top = nextRect.top + window.scrollY - placeholderHeight - 8;
          } else {
            top = 24 + descriptorIndex * 44;
          }
          top += occurrence * (placeholderHeight + 8);
        }
        const currentText = Array.isArray(value)
          ? value[occurrence]
          : value;
        const minimumTop = position?.mode === "overlay"
          ? rootTop + 8
          : 8;
        const maximumTop = position?.mode === "overlay"
          ? Math.max(
            minimumTop,
            rootTop + rootHeight - placeholderHeight - 8,
          )
          : message.viewportHeight - placeholderHeight - 8;
        next.push({
          rect: {
            height: placeholderHeight,
            left,
            occurrenceId: getComponentLabOccurrenceId(node.id, occurrence),
            roleId: node.id,
            top: Math.max(
              minimumTop,
              Math.min(
                maximumTop,
                top,
              ),
            ),
            width,
          },
          text: currentText?.trim() ||
            empty?.text ||
            sampleBinding?.placeholder ||
            node.label,
        });
      });
    });
    setGeneratedPlaceholders((current) =>
      JSON.stringify(current) === JSON.stringify(next) ? current : next
    );
  }, [
    component,
    getPlacement,
    message.data,
    message.positioningByRole,
    message.viewportHeight,
    variant,
  ]);

  const measure = useCallback(() => {
    indexAnnotatedElements();
    const nextRects = selectionRef.current.flatMap((target) => {
      const element = resolveTargetElement(target);
      return element ? [getNodeRect(element, target)] : [];
    });
    setRects((current) => {
      const currentSignature = JSON.stringify(current);
      const nextSignature = JSON.stringify(nextRects);
      return currentSignature === nextSignature ? current : nextRects;
    });
  }, []);

  useEffect(() => {
    let frameId = 0;
    const requestMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };
    requestMeasure();
    const observer = new ResizeObserver(requestMeasure);
    indexAnnotatedElements();
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
  }, [
    generatedPlaceholders,
    measure,
    message.designDocument,
    message.data,
  ]);

  useEffect(() => {
    const frameId = requestAnimationFrame(applyVirtualSampleText);
    return () => cancelAnimationFrame(frameId);
  }, [applyVirtualSampleText]);

  useEffect(() => {
    let frameId = requestAnimationFrame(refreshGeneratedPlaceholders);
    const handleResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(refreshGeneratedPlaceholders);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [refreshGeneratedPlaceholders]);

  const getLogicalPointerCoordinates = useCallback((
    clientX: number,
    clientY: number,
    referenceElement?: HTMLElement | null,
  ) => {
    const frame = window.frameElement as HTMLElement | null;
    if (!frame) {
      return { clientX, clientY, scaleX: 1, scaleY: 1 };
    }
    const renderedRect = frame.getBoundingClientRect();
    const referenceRect = referenceElement?.getBoundingClientRect();
    return resolveComponentLabPointerCoordinates({
      clientX,
      clientY,
      layoutHeight: frame.clientHeight,
      layoutWidth: frame.clientWidth,
      ...(referenceRect
        ? {
          referenceRect: {
            bottom: referenceRect.bottom,
            left: referenceRect.left,
            right: referenceRect.right,
            top: referenceRect.top,
          },
        }
        : {}),
      renderedHeight: renderedRect.height,
      renderedWidth: renderedRect.width,
    });
  }, []);

  const getHitTarget = useCallback((
    clientX: number,
    clientY: number,
    eventTarget?: EventTarget | null,
  ) => {
    const directElement = eventTarget instanceof HTMLElement
      ? eventTarget.closest<HTMLElement>("[data-component-lab-node]")
      : null;
    const logicalPoint = getLogicalPointerCoordinates(
      clientX,
      clientY,
      directElement,
    );
    clientX = logicalPoint.clientX;
    clientY = logicalPoint.clientY;
    indexAnnotatedElements();
    const seen = new Set<HTMLElement>();
    const candidates: Array<{
      element: HTMLElement;
      hit: ComponentLabHitCandidate;
    }> = [];
    const visualStack = document.elementsFromPoint(clientX, clientY);
    const geometricTargets = [
      ...document.querySelectorAll<HTMLElement>("[data-component-lab-node]"),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      return clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
    });
    [directElement, ...visualStack, ...geometricTargets]
      .forEach((candidate, visualOrder) => {
        if (!(candidate instanceof HTMLElement)) return;
        const element = candidate.closest<HTMLElement>(
          "[data-component-lab-node]",
        );
        if (!element || seen.has(element)) return;
        seen.add(element);
        const roleId = element.dataset.componentLabNode;
        const occurrenceId = element.dataset.componentLabOccurrence;
        if (!roleId || !occurrenceId) return;
        const descriptor = getComponentDesignNodeDescriptor(
          component,
          variant,
          roleId,
        );
        const rect = element.getBoundingClientRect();
        candidates.push({
          element,
          hit: {
            area: Math.max(0, rect.width * rect.height),
            bleed: descriptor?.bleed ?? "none",
            depth: getElementDepth(element),
            kind: descriptor?.kind ?? "container",
            occurrenceId,
            roleId,
            visualOrder,
          },
        });
      });
    const hit = pickComponentLabHitCandidate(
      candidates.map((candidate) => candidate.hit),
    );
    return hit
      ? candidates.find((candidate) =>
        candidate.hit.roleId === hit.roleId &&
        candidate.hit.occurrenceId === hit.occurrenceId
      ) ?? null
      : null;
  }, [component, getLogicalPointerCoordinates, variant]);

  const getFlowCandidates = useCallback((
    excluded: readonly ComponentLabPreviewSelectionTarget[],
  ) => {
    const excludedRoleIds = new Set(excluded.map(({ roleId }) => roleId));
    const seenRoleIds = new Set<string>();
    const candidates: ComponentLabFlowCandidate[] = [];
    indexAnnotatedElements();
    document.querySelectorAll<HTMLElement>("[data-component-lab-node]")
      .forEach((element) => {
        const roleId = element.dataset.componentLabNode;
        const occurrenceId = element.dataset.componentLabOccurrence;
        if (
          !roleId ||
          !occurrenceId ||
          excludedRoleIds.has(roleId) ||
          seenRoleIds.has(roleId)
        ) {
          return;
        }
        seenRoleIds.add(roleId);
        const position = getPosition(roleId, element);
        if (position.mode !== "flow") return;
        const rect = element.getBoundingClientRect();
        candidates.push({
          height: rect.height,
          occurrenceId,
          order: position.order,
          roleId,
          top: rect.top + window.scrollY,
        });
      });
    return candidates;
  }, [getPosition]);

  const createInteractionTargets = useCallback((
    dragState: DragState,
    clientX: number,
    clientY: number,
    useOrigin = false,
  ): ComponentLabPreviewInteractionTarget[] => {
    const movedTargets = dragState.origins.map((origin) => {
      const placement = useOrigin
        ? origin.placement
        : getComponentLabDraggedPlacement({
          clientX,
          gridGap: dragState.gridGap,
          gridWidth: dragState.gridWidth,
          operation: dragState.mode,
          originClientX: dragState.originClientX,
          originPlacement: origin.placement,
        });
      let vertical: ComponentLabPreviewVerticalOperation | undefined;
      if (dragState.mode === "move") {
        if (useOrigin) {
          vertical = origin.position;
        } else if (origin.position.mode === "overlay") {
          vertical = getComponentLabOverlayVerticalOperation({
            clientY,
            originClientY: dragState.originClientY,
            originRect: origin.rect,
            rootHeight: origin.rootHeight,
            rootTop: origin.rootTop,
          });
        } else {
          vertical = getComponentLabFlowVerticalOperation({
            candidates: dragState.flowCandidates,
            clientY,
            originClientY: dragState.originClientY,
            originGapBefore: origin.position.gapBefore,
            originOrder: origin.position.order,
            originRect: origin.rect,
          });
        }
      }
      return {
        ...origin.target,
        placement,
        ...(vertical ? { vertical } : {}),
      };
    });
    if (useOrigin || dragState.mode !== "move") return movedTargets;
    const movedFlowTargets = movedTargets.filter((target) =>
      target.vertical?.mode === "flow"
    );
    const primaryFlow = movedFlowTargets.find((target) =>
      areComponentLabSelectionTargetsEqual(target, dragState.primary)
    );
    if (primaryFlow?.vertical?.mode !== "flow") return movedTargets;

    const orders = getComponentLabReorderedFlowOrders({
      insertionIndex: primaryFlow.vertical.order,
      items: [
        ...dragState.origins.flatMap((origin) =>
          origin.position.mode === "flow"
            ? [{
              ...origin.target,
              order: origin.position.order,
            }]
            : []
        ),
        ...dragState.flowCandidates,
      ],
      movingRoleIds: movedFlowTargets.map(({ roleId }) => roleId),
    });
    const movedRoleIds = new Set(movedTargets.map(({ roleId }) => roleId));
    const normalizedMovedTargets = movedTargets.map((target) => {
      if (target.vertical?.mode !== "flow") return target;
      return {
        ...target,
        vertical: {
          ...target.vertical,
          order: orders[target.roleId] ?? target.vertical.order,
        },
      };
    });
    const shiftedTargets = dragState.flowCandidates.flatMap((candidate) => {
      if (movedRoleIds.has(candidate.roleId)) return [];
      const placement = getPlacement(candidate.roleId);
      const element = resolveTargetElement(candidate);
      if (!placement || !element) return [];
      const position = getPosition(candidate.roleId, element);
      if (position.mode !== "flow") return [];
      const order = orders[candidate.roleId];
      if (order === undefined || order === position.order) return [];
      return [{
        occurrenceId: candidate.occurrenceId,
        placement,
        roleId: candidate.roleId,
        vertical: {
          ...position,
          order,
        },
      }];
    });
    return [...normalizedMovedTargets, ...shiftedTargets];
  }, [
    getPlacement,
    getPosition,
  ]);

  const createDragPreviewRects = useCallback((
    dragState: DragState,
    targets: readonly ComponentLabPreviewInteractionTarget[],
  ) => {
    const columnWidth = Math.max(
      1,
      (dragState.gridWidth - dragState.gridGap * 11) / 12,
    );
    const pitch = columnWidth + dragState.gridGap;
    return targets.flatMap((target) => {
      const origin = dragState.origins.find((candidate) =>
        areComponentLabSelectionTargetsEqual(candidate.target, target)
      );
      if (!origin) return [];
      let top = origin.rect.top;
      if (target.vertical?.mode === "overlay") {
        const anchorTop = target.vertical.anchor === "top"
          ? origin.rootTop
          : target.vertical.anchor === "center"
            ? origin.rootTop +
              (origin.rootHeight - origin.rect.height) / 2
            : origin.rootTop + origin.rootHeight - origin.rect.height;
        top = anchorTop + target.vertical.offset;
      } else if (target.vertical?.mode === "flow") {
        const vertical = target.vertical;
        if (
          origin.position.mode === "flow" &&
          vertical.order === origin.position.order
        ) {
          top += vertical.gapBefore - origin.position.gapBefore;
        } else {
          const flowTarget = dragState.flowCandidates.find((candidate) =>
            candidate.roleId === vertical.targetRoleId &&
            candidate.occurrenceId === vertical.targetOccurrenceId
          );
          if (flowTarget) {
            top = vertical.insert === "after"
              ? flowTarget.top + flowTarget.height + vertical.gapBefore
              : flowTarget.top -
                origin.rect.height -
                vertical.gapBefore;
          }
        }
      }
      return [{
        ...origin.rect,
        left: origin.rect.left +
          (target.placement.start - origin.placement.start) * pitch,
        top,
        width: target.placement.span * columnWidth +
          (target.placement.span - 1) * dragState.gridGap,
      }];
    });
  }, []);

  const createDragPreviewGuide = useCallback((
    dragState: DragState,
    targets: readonly ComponentLabPreviewInteractionTarget[],
    previewRects: readonly NodeRect[],
  ): DragPreviewGuide | null => {
    const primaryTarget = targets.find((target) =>
      areComponentLabSelectionTargetsEqual(target, dragState.primary)
    ) ?? targets[0];
    if (!primaryTarget) return null;
    const end = primaryTarget.placement.start +
      primaryTarget.placement.span -
      1;
    const placementLabel = `第 ${primaryTarget.placement.start}–${end} 栏`;
    if (primaryTarget.vertical?.mode !== "flow") {
      return { placementLabel };
    }
    const vertical = primaryTarget.vertical;
    const primaryRect = previewRects.find((rect) =>
      rect.roleId === primaryTarget.roleId &&
      rect.occurrenceId === primaryTarget.occurrenceId
    );
    if (!primaryRect) return { placementLabel };
    const flowTarget = dragState.flowCandidates.find((candidate) =>
      candidate.roleId === vertical.targetRoleId &&
      candidate.occurrenceId === vertical.targetOccurrenceId
    );
    if (!flowTarget) {
      return {
        insertion: {
          label: "当前位置",
          left: primaryRect.left,
          top: primaryRect.top,
          width: primaryRect.width,
        },
        placementLabel,
      };
    }
    const descriptor = getComponentDesignNodeDescriptor(
      component,
      variant,
      flowTarget.roleId,
    );
    const occurrence = Number.parseInt(flowTarget.occurrenceId, 10);
    const repeatedLabel = descriptor?.repeated && Number.isFinite(occurrence)
      ? `第 ${occurrence + 1} 项`
      : "";
    const direction = vertical.insert === "after"
      ? "后"
      : "前";
    return {
      insertion: {
        label: `插入到${descriptor?.label ?? "元素"}${repeatedLabel}${direction}`,
        left: primaryRect.left,
        top: vertical.insert === "after"
          ? flowTarget.top + flowTarget.height
          : flowTarget.top,
        width: primaryRect.width,
      },
      placementLabel,
    };
  }, [component, variant]);

  const reportInteraction = useCallback((
    dragState: DragState,
    phase: ComponentLabPreviewInteractionPhase,
    targets: ComponentLabPreviewInteractionTarget[],
  ) => {
    const primary = targets.find((target) =>
      areComponentLabSelectionTargetsEqual(target, dragState.primary)
    ) ?? targets[0];
    if (!primary) return;
    const operation = dragState.mode !== "move"
      ? "resize"
      : primary.vertical?.mode === "overlay"
        ? "overlay"
        : primary.vertical?.mode === "flow"
          ? "flow"
          : "move";
    window.parent.postMessage(
      {
        ...getResponseContext(primary),
        breakpoint: activeDevice,
        nodeId: primary.roleId,
        operation,
        phase,
        placement: primary.placement,
        ...(dragState.mode === "resize-left"
          ? { resizeEdge: "left" as const }
          : dragState.mode === "resize-right"
            ? { resizeEdge: "right" as const }
            : {}),
        targets,
        type: COMPONENT_LAB_PREVIEW_PLACEMENT_MESSAGE,
        ...(primary.vertical ? { vertical: primary.vertical } : {}),
      },
      window.location.origin,
    );
  }, [activeDevice, getResponseContext]);

  const beginDrag = useCallback((
    event: Pick<
      PointerEvent,
      | "button"
      | "clientX"
      | "clientY"
      | "pointerId"
      | "preventDefault"
      | "target"
    >,
    mode: ComponentLabGridOperation,
    primary: ComponentLabPreviewSelectionTarget,
    selectedTargets: readonly ComponentLabPreviewSelectionTarget[],
  ) => {
    if (event.button !== 0 || !editingEnabled) return;
    const primaryDescriptor = getComponentDesignNodeDescriptor(
      component,
      variant,
      primary.roleId,
    );
    const primaryPlacement = getPlacement(primary.roleId);
    if (!primaryPlacement || primaryDescriptor?.bleed === "viewport") return;

    event.preventDefault();
    const effectiveTargets = mode === "move"
      ? selectedTargets
      : [primary];
    const origins = effectiveTargets.flatMap((target) => {
      const element = resolveTargetElement(target);
      const placement = getPlacement(target.roleId);
      const descriptor = getComponentDesignNodeDescriptor(
        component,
        variant,
        target.roleId,
      );
      if (
        !element ||
        !placement ||
        descriptor?.bleed === "viewport"
      ) {
        return [];
      }
      const root = getClosestGridRoot(element);
      if (!root) return [];
      return [{
        element,
        placement,
        position: getPosition(target.roleId, element),
        rect: getNodeRect(element, target),
        rootHeight: root.height,
        rootTop: root.top,
        target,
      }];
    });
    if (origins.length === 0) return;
    const primaryElement = resolveTargetElement(primary);
    const eventElement = event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>(
        "[data-component-lab-node], [data-component-lab-handle]",
      )
      : null;
    const logicalPoint = getLogicalPointerCoordinates(
      event.clientX,
      event.clientY,
      eventElement ?? primaryElement,
    );
    const grid = primaryElement?.closest<HTMLElement>(".grid-container") ??
      document.querySelector<HTMLElement>(".grid-container");
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const gridStyles = getComputedStyle(grid);
    dragStateRef.current = {
      coordinateScaleX: logicalPoint.scaleX,
      coordinateScaleY: logicalPoint.scaleY,
      flowCandidates: getFlowCandidates(effectiveTargets),
      gridGap: Number.parseFloat(gridStyles.columnGap) || 0,
      gridWidth: gridRect.width,
      lastPreviewSignature: "",
      mode,
      originClientX: logicalPoint.clientX,
      originClientY: logicalPoint.clientY,
      origins,
      pointerId: event.pointerId,
      primary,
      started: false,
    };
  }, [
    component,
    editingEnabled,
    getFlowCandidates,
    getLogicalPointerCoordinates,
    getPlacement,
    getPosition,
    variant,
  ]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        (event.target instanceof HTMLElement &&
          event.target.closest("[data-component-lab-handle]")) ||
        (event.target instanceof HTMLElement &&
          event.target.closest("[data-component-lab-inline-editor]"))
      ) {
        return;
      }
      const hit = getHitTarget(event.clientX, event.clientY, event.target);
      if (!hit) return;
      event.preventDefault();
      const target = {
        occurrenceId: hit.hit.occurrenceId,
        roleId: hit.hit.roleId,
      };
      const currentSelection = selectionRef.current;
      const nextSelection = updateComponentLabSelection({
        additive: event.shiftKey,
        current: currentSelection,
        target,
      });
      const targetStillSelected = nextSelection.some((candidate) =>
        areComponentLabSelectionTargetsEqual(candidate, target)
      );
      setSelection(nextSelection);
      reportSelection(target, nextSelection, event.shiftKey);
      if (!targetStillSelected) return;
      beginDrag(event, "move", target, nextSelection);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const logicalPoint = {
        clientX: event.clientX * dragState.coordinateScaleX,
        clientY: event.clientY * dragState.coordinateScaleY,
      };
      if (
        !dragState.started &&
        !hasComponentLabDragThresholdBeenCrossed({
          clientX: logicalPoint.clientX,
          clientY: logicalPoint.clientY,
          originClientX: dragState.originClientX,
          originClientY: dragState.originClientY,
        })
      ) {
        return;
      }
      event.preventDefault();
      if (!dragState.started) {
        dragState.started = true;
        reportInteraction(
          dragState,
          "start",
          createInteractionTargets(
            dragState,
            dragState.originClientX,
            dragState.originClientY,
            true,
          ),
        );
      }
      const targets = createInteractionTargets(
        dragState,
        logicalPoint.clientX,
        logicalPoint.clientY,
      );
      const previewRects = createDragPreviewRects(dragState, targets);
      setDragPreviewRects(previewRects);
      setDragPreviewGuide(
        createDragPreviewGuide(dragState, targets, previewRects),
      );
      const signature = JSON.stringify(targets);
      if (signature === dragState.lastPreviewSignature) return;
      dragState.lastPreviewSignature = signature;
      reportInteraction(dragState, "preview", targets);
    };

    const finishDrag = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const logicalPoint = {
        clientX: event.clientX * dragState.coordinateScaleX,
        clientY: event.clientY * dragState.coordinateScaleY,
      };
      dragStateRef.current = null;
      if (!dragState.started) return;
      event.preventDefault();
      const targets = createInteractionTargets(
        dragState,
        logicalPoint.clientX,
        logicalPoint.clientY,
      );
      const previewRects = createDragPreviewRects(dragState, targets);
      setDragPreviewRects(previewRects);
      setDragPreviewGuide(
        createDragPreviewGuide(dragState, targets, previewRects),
      );
      reportInteraction(
        dragState,
        "commit",
        targets,
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDragPreviewRects(null);
          setDragPreviewGuide(null);
          measure();
        });
      });
    };

    const cancelDrag = () => {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      dragStateRef.current = null;
      setDragPreviewRects(null);
      setDragPreviewGuide(null);
      if (!dragState.started) return;
      reportInteraction(
        dragState,
        "cancel",
        createInteractionTargets(
          dragState,
          dragState.originClientX,
          dragState.originClientY,
          true,
        ),
      );
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("[data-component-lab-node]") ||
          target.closest("[data-component-lab-handle]"))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleDoubleClick = (event: MouseEvent) => {
      if (!editingEnabled) return;
      const hit = getHitTarget(event.clientX, event.clientY, event.target);
      if (!hit) return;
      const descriptor = getComponentDesignNodeDescriptor(
        component,
        variant,
        hit.hit.roleId,
      );
      if (descriptor?.kind !== "text" && descriptor?.kind !== "action") return;
      event.preventDefault();
      event.stopPropagation();
      const target = {
        occurrenceId: hit.hit.occurrenceId,
        roleId: hit.hit.roleId,
      };
      const rect = getNodeRect(hit.element, target);
      setSelection([target]);
      reportSelection(target, [target], false);
      setInlineTextEdit({
        originalText: getElementText(hit.element),
        rect,
        target,
        text: getElementText(hit.element),
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (dragStateRef.current) {
        event.preventDefault();
        cancelDrag();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerup", finishDrag, true);
    window.addEventListener("pointercancel", cancelDrag, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("dblclick", handleDoubleClick, true);
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerup", finishDrag, true);
      window.removeEventListener("pointercancel", cancelDrag, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("dblclick", handleDoubleClick, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    beginDrag,
    component,
    createInteractionTargets,
    createDragPreviewGuide,
    createDragPreviewRects,
    editingEnabled,
    getHitTarget,
    measure,
    reportInteraction,
    reportSelection,
    variant,
  ]);

  function handleKeyboard(
    event: React.KeyboardEvent,
    operation: ComponentLabGridOperation,
    target: ComponentLabPreviewSelectionTarget,
  ) {
    if (!editingEnabled) return;
    const placement = getPlacement(target.roleId);
    if (
      !placement ||
      (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const nextPlacement = getComponentLabKeyboardPlacement({
      key: event.key,
      operation,
      placement,
    });
    if (!isGridPlacement(nextPlacement)) return;
    const element = resolveTargetElement(target);
    if (!element) return;
    const origin: DragOrigin = {
      element,
      placement,
      position: getPosition(target.roleId, element),
      rect: getNodeRect(element, target),
      rootHeight: 0,
      rootTop: 0,
      target,
    };
    const root = getClosestGridRoot(element);
    if (!root) return;
    origin.rootHeight = root.height;
    origin.rootTop = root.top;
    const dragState: DragState = {
      coordinateScaleX: 1,
      coordinateScaleY: 1,
      flowCandidates: [],
      gridGap: 0,
      gridWidth: 1,
      lastPreviewSignature: "",
      mode: operation,
      originClientX: 0,
      originClientY: 0,
      origins: [origin],
      pointerId: -1,
      primary: target,
      started: true,
    };
    reportInteraction(dragState, "commit", [{
      ...target,
      placement: nextPlacement,
      ...(operation === "move" ? { vertical: origin.position } : {}),
    }]);
  }

  function getElementLabel(
    target: ComponentLabPreviewSelectionTarget,
  ) {
    const descriptor = getComponentDesignNodeDescriptor(
      component,
      variant,
      target.roleId,
    );
    const occurrence = Number.parseInt(target.occurrenceId, 10);
    return descriptor?.repeated && Number.isFinite(occurrence)
      ? `${descriptor.label} · 第 ${occurrence + 1} 项`
      : descriptor?.label ?? "可编辑元素";
  }

  const primary = selection.at(-1);
  const visibleRects = dragPreviewRects ?? rects;
  const primaryRect = primary
    ? visibleRects.find((rect) =>
      rect.roleId === primary.roleId &&
      rect.occurrenceId === primary.occurrenceId
    )
    : undefined;
  const primaryDescriptor = primary
    ? getComponentDesignNodeDescriptor(component, variant, primary.roleId)
    : undefined;
  const primaryPlacement = primary ? getPlacement(primary.roleId) : undefined;
  const placementLocked = primaryDescriptor?.bleed === "viewport";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 touch-none"
      aria-label="ComponentLab 版式操作层"
    >
      {generatedPlaceholders.map(({ rect, text }) => (
        <button
          key={`placeholder-${rect.roleId}-${rect.occurrenceId}`}
          type="button"
          data-component-lab-generated-placeholder="true"
          data-component-lab-node={rect.roleId}
          data-component-lab-occurrence={rect.occurrenceId}
          className="pointer-events-auto absolute overflow-hidden border border-dashed border-white/35 bg-black/75 px-2 text-left text-[11px] text-white/45"
          style={{
            height: rect.height,
            left: rect.left,
            top: rect.top,
            width: rect.width,
          }}
        >
          {text}
        </button>
      ))}
      {visibleRects.map((rect) => {
        const target = {
          occurrenceId: rect.occurrenceId,
          roleId: rect.roleId,
        };
        return (
          <div
            key={`${rect.roleId}-${rect.occurrenceId}`}
            className="pointer-events-none absolute border border-cyan-300/90"
            style={{
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            }}
          >
            <span className="absolute -top-5 left-0 whitespace-nowrap bg-black/85 px-1.5 py-0.5 text-[10px] text-cyan-100">
              {getElementLabel(target)}
            </span>
          </div>
        );
      })}
      {dragPreviewGuide?.insertion ? (
        <div
          className="pointer-events-none absolute z-20 border-t-2 border-cyan-200"
          style={{
            left: dragPreviewGuide.insertion.left,
            top: dragPreviewGuide.insertion.top,
            width: dragPreviewGuide.insertion.width,
          }}
        >
          <span className="absolute bottom-1 left-0 whitespace-nowrap bg-cyan-100 px-1.5 py-0.5 text-[10px] text-black">
            {dragPreviewGuide.insertion.label}
          </span>
        </div>
      ) : null}
      {dragPreviewGuide && primaryRect ? (
        <span
          className="pointer-events-none absolute z-20 whitespace-nowrap bg-cyan-100 px-1.5 py-0.5 text-[10px] text-black"
          style={{
            left: primaryRect.left,
            top: primaryRect.top + primaryRect.height + 4,
          }}
        >
          {dragPreviewGuide.placementLabel}
        </span>
      ) : null}
      {selection.length === 1 &&
      primary &&
      primaryRect &&
      primaryPlacement &&
      !placementLocked ? (
        <div
          className="pointer-events-none absolute"
          style={{
            height: Math.max(24, primaryRect.height),
            left: primaryRect.left,
            top: primaryRect.top,
            width: Math.max(24, primaryRect.width),
          }}
        >
          <button
            type="button"
            disabled={!editingEnabled}
            data-component-lab-handle="left"
            aria-label={editingEnabled
              ? "拖动左边缘调整起始栏"
              : "当前设备跟随桌面，需先单独调整"}
            className="pointer-events-auto absolute inset-y-0 -left-2 w-4 cursor-ew-resize border-x border-cyan-200 bg-cyan-200/25 disabled:cursor-not-allowed disabled:opacity-40"
            onKeyDown={(event) =>
              handleKeyboard(event, "resize-left", primary)}
            onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture?.(event.pointerId);
              beginDrag(
                event.nativeEvent,
                "resize-left",
                primary,
                [primary],
              );
            }}
          />
          <button
            type="button"
            disabled={!editingEnabled}
            data-component-lab-handle="right"
            aria-label={editingEnabled
              ? "拖动右边缘调整占据栏"
              : "当前设备跟随桌面，需先单独调整"}
            className="pointer-events-auto absolute inset-y-0 -right-2 w-4 cursor-ew-resize border-x border-cyan-200 bg-cyan-200/25 disabled:cursor-not-allowed disabled:opacity-40"
            onKeyDown={(event) =>
              handleKeyboard(event, "resize-right", primary)}
            onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture?.(event.pointerId);
              beginDrag(
                event.nativeEvent,
                "resize-right",
                primary,
                [primary],
              );
            }}
          />
        </div>
      ) : null}
      {inlineTextEdit ? (
        <textarea
          data-component-lab-inline-editor
          aria-label={`编辑${getElementLabel(inlineTextEdit.target)}样例文字`}
          autoFocus
          className="pointer-events-auto absolute z-10 resize-none border border-cyan-200 bg-black/90 p-2 text-sm leading-relaxed text-white outline-none"
          style={{
            height: Math.max(40, inlineTextEdit.rect.height),
            left: inlineTextEdit.rect.left,
            top: inlineTextEdit.rect.top,
            width: Math.max(120, inlineTextEdit.rect.width),
          }}
          value={inlineTextEdit.text}
          onBlur={() => {
            const edit = inlineTextEditRef.current;
            if (!edit) return;
            reportText(edit, "commit", edit.text);
            setInlineTextEdit(null);
          }}
          onChange={(event) => {
            const text = event.target.value;
            setInlineTextEdit((current) =>
              current ? { ...current, text } : current
            );
            reportText(inlineTextEdit, "preview", text);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              reportText(
                inlineTextEdit,
                "preview",
                inlineTextEdit.originalText,
              );
              reportText(
                inlineTextEdit,
                "cancel",
                inlineTextEdit.originalText,
              );
              setInlineTextEdit(null);
            } else if (
              event.key === "Enter" &&
              (event.ctrlKey || event.metaKey)
            ) {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      ) : null}
    </div>
  );
}

export default function ComponentLabPreviewClient() {
  const [message, setMessage] =
    useState<ComponentLabPreviewRenderMessage | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const responseSeqRef = useRef(0);
  const renderGuardRef = useRef<ComponentLabPreviewRenderGuardState>({
    activeRenderSessionId: null,
    lastSeq: -1,
    retiredRenderSessionIds: [],
  });
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
  const nextResponseSeq = useCallback(() => {
    responseSeqRef.current += 1;
    return responseSeqRef.current;
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        !isComponentLabPreviewRenderMessage(event.data)
      ) {
        return;
      }
      const guarded = guardComponentLabPreviewRenderMessage(
        event.data,
        renderGuardRef.current,
      );
      if (!guarded.accepted) return;
      renderGuardRef.current = guarded.state;
      setMessage(event.data);
    };
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      {
        protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
        type: COMPONENT_LAB_PREVIEW_READY_MESSAGE,
      },
      window.location.origin,
    );
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (!viewportHeight) return;
    const previousUnit = htmlElement.style.getPropertyValue(
      SITE_VIEWPORT_UNIT_CSS_VAR,
    );
    const previousHtmlOverflow = htmlElement.style.overflow;
    const previousBodyMargin = document.body.style.margin;
    const previousBodyMinHeight = document.body.style.minHeight;
    const previousBodyOverflow = document.body.style.overflow;
    htmlElement.style.setProperty(
      SITE_VIEWPORT_UNIT_CSS_VAR,
      getLogicalViewportUnit({ height: viewportHeight }),
    );
    htmlElement.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.minHeight = `${viewportHeight}px`;
    document.body.style.overflow = "hidden";
    return () => {
      if (previousUnit) {
        htmlElement.style.setProperty(
          SITE_VIEWPORT_UNIT_CSS_VAR,
          previousUnit,
        );
      } else {
        htmlElement.style.removeProperty(SITE_VIEWPORT_UNIT_CSS_VAR);
      }
      htmlElement.style.overflow = previousHtmlOverflow;
      document.body.style.margin = previousBodyMargin;
      document.body.style.minHeight = previousBodyMinHeight;
      document.body.style.overflow = previousBodyOverflow;
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
        const base = {
          height: Math.max(message.viewportHeight, node.scrollHeight),
          type: COMPONENT_LAB_PREVIEW_HEIGHT_MESSAGE,
        };
        window.parent.postMessage(
          hasComponentLabPreviewV3RenderContext(message)
            ? {
              ...base,
              component: message.component,
              device: message.device,
              protocolVersion: COMPONENT_LAB_PREVIEW_PROTOCOL_VERSION,
              renderSessionId: message.renderSessionId,
              seq: nextResponseSeq(),
              variant: message.variant,
            }
            : base,
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
  }, [message, nextResponseSeq]);

  const activeDevice = message?.device ?? message?.activeBreakpoint;

  return (
    <div
      ref={contentRef}
      className="relative overflow-hidden bg-black"
      style={{ minHeight: `${message?.viewportHeight ?? 1}px` }}
    >
      {message?.showGrid ? <GridOverlay /> : null}
      {message && previewConfig
        ? <Render config={previewConfig} data={message.data} />
        : null}
      {message?.layoutMode &&
      activeDevice &&
      message.component &&
      message.variant
        ? (
          <NodeOverlay
            key={[
              message.renderSessionId ?? "legacy",
              message.component,
              message.variant,
              selectionSignature(getInitialSelection(message)),
            ].join(":")}
            message={message}
            nextResponseSeq={nextResponseSeq}
          />
        )
        : null}
    </div>
  );
}
