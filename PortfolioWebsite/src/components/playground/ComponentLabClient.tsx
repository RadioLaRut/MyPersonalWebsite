"use client";

import type { Data } from "@puckeditor/core";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ComponentElementNavigator, {
  type ComponentLabElementSelection,
} from "@/components/playground/component-lab/ComponentElementNavigator";
import ComponentLabInspector from "@/components/playground/component-lab/ComponentLabInspector";
import ComponentLabPreviewFrame from "@/components/playground/component-lab/ComponentLabPreviewFrame";
import ComponentLabTokenDialog from "@/components/playground/component-lab/ComponentLabTokenDialog";
import ComponentLabToolbar, {
  type ComponentLabSaveState,
} from "@/components/playground/component-lab/ComponentLabToolbar";
import ComponentVariantPicker, {
  type ComponentVariantSelection,
} from "@/components/playground/component-lab/ComponentVariantPicker";
import {
  dispatchComponentDesignUpdated,
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import {
  COMPONENT_DESIGN_COMMIT_CHANNEL,
  isCommittedComponentDesignMessage,
} from "@/lib/component-design-commit";
import {
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
  getComponentDesignNodePolicyFromComposition,
  getComponentDesignVariantDescriptor,
  type ComponentDesignAuthorComponent,
  type ComponentDesignCompositionDescriptor,
} from "@/lib/component-design-manifest";
import {
  constrainComponentLabPlacement,
} from "@/lib/component-lab-grid-interaction";
import type {
  ComponentDesignBreakpoint,
} from "@/lib/component-design-v2";
import {
  cloneComponentDesignDocument,
  enableComponentDesignDeviceOverride,
  migrateComponentDesignDocumentV2ToV4,
  normalizeComponentDesignDocument,
  resolveComponentDesignDeviceLayout,
  resolveComponentDesignRuntimeDocument,
  type ComponentDesignDeviceLayoutV4,
  type ComponentDesignDocumentV4,
  type ComponentDesignVariantV4,
} from "@/lib/component-design-v4";
import type { ComponentLabInstanceCatalog } from "@/lib/component-lab-presets";
import {
  createVariantSampleNode,
  extractVariantSampleText,
} from "@/lib/component-lab-sample-text";
import type {
  ComponentLabPreviewInteractionMessage,
  ComponentLabPreviewPlacementMessage,
  ComponentLabPreviewTextChangeMessage,
} from "@/lib/component-lab-preview-messages";
import {
  createComponentLabHistory,
  pushComponentLabHistory,
  redoComponentLabHistory,
  undoComponentLabHistory,
  type ComponentLabHistoryState,
} from "@/lib/component-lab-session-history";
import {
  classifyComponentLabSaveConflict,
  mergeComponentLabRemoteDocument,
  type ComponentLabSaveScope,
} from "@/lib/component-lab-save-conflict";
import { isComponentLabEditorTokenRequired } from "@/lib/component-lab-save-auth";
import type { FontLabDocument } from "@/lib/font-lab-config-schema";
import {
  getLocalEditorAccessHeaders,
  setLocalEditorAccessToken,
} from "@/lib/local-editor-access";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PREVIEW_VIEWPORTS,
} from "@/lib/preview-viewports";

type ComponentDesignApiPayload = {
  config?: ComponentDesignDocumentV4;
  error?: { code: string; message: string };
  operationId?: string;
  path?: string;
  revision?: string;
};

type FontLabApiPayload = {
  config?: FontLabDocument;
};

type SaveJob = {
  component: ComponentDesignAuthorComponent;
  operationId: string;
  submittedAgainst: ComponentDesignVariantV4;
  value: ComponentDesignVariantV4;
  variant: string;
};

type ConflictState = {
  job: SaveJob;
  revision: string;
  serverDocument: ComponentDesignDocumentV4;
};

type TextTransaction = {
  before: ComponentDesignVariantV4;
  component: ComponentDesignAuthorComponent;
  key: string;
  timer: ReturnType<typeof setTimeout>;
  variant: string;
};

const SAVE_RETRY_DELAY_MS = 1500;
const TEXT_SAVE_DELAY_MS = 400;

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function scopeKey(component: ComponentDesignAuthorComponent, variant: string) {
  return `${component}/${variant}`;
}

function cloneVariant(variant: ComponentDesignVariantV4) {
  return structuredClone(variant);
}

function variantsEqual(
  left: ComponentDesignVariantV4,
  right: ComponentDesignVariantV4,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function removeSaveJob(queue: SaveJob[], operationId: string) {
  const index = queue.findIndex((job) => job.operationId === operationId);
  if (index >= 0) queue.splice(index, 1);
}

function isSameSaveScope(
  left: ComponentLabSaveScope,
  right: ComponentLabSaveScope,
) {
  return left.component === right.component && left.variant === right.variant;
}

function createPreviewData(
  component: ComponentDesignAuthorComponent,
  node: ReturnType<typeof createVariantSampleNode>,
): Data {
  return {
    content: [{
      ...node,
      props: {
        ...node.props,
        id: `component-lab-v4-${component}`,
      },
    }],
    root: {
      props: {
        description: "",
        image: "",
        noIndex: true,
        title: "ComponentLab",
      },
    },
    zones: {},
  } as Data;
}

function updateVariantInDocument(
  document: ComponentDesignDocumentV4,
  component: ComponentDesignAuthorComponent,
  variant: string,
  value: ComponentDesignVariantV4,
) {
  const next = cloneComponentDesignDocument(document);
  next.components[component].variants[variant] = cloneVariant(value);
  return normalizeComponentDesignDocument(next);
}

function setDeviceLayout(
  variant: ComponentDesignVariantV4,
  device: ComponentDesignBreakpoint,
  layout: ComponentDesignDeviceLayoutV4,
) {
  const next = cloneVariant(variant);
  if (device === "desktop") {
    next.desktop = structuredClone(layout);
  } else if (next[device].mode === "custom") {
    next[device].custom = structuredClone(layout);
  }
  return next;
}

function applyPlacementInteraction(
  layout: ComponentDesignDeviceLayoutV4,
  message: ComponentLabPreviewPlacementMessage,
  composition: readonly ComponentDesignCompositionDescriptor[],
) {
  const next = structuredClone(layout);
  message.targets.forEach((target) => {
    const node = next.nodes[target.roleId];
    if (!node) return;
    const policy = getComponentDesignNodePolicyFromComposition(
      composition,
      target.roleId,
    );
    node.placement = constrainComponentLabPlacement({
      currentPlacement: node.placement,
      hostPlacement: policy.constrainToHost
        ? next.nodes[policy.constrainToHost]?.placement
        : undefined,
      lockPlacement: policy.lockPlacement,
      lockResize: policy.lockResize,
      operation: message.operation === "resize"
        ? message.resizeEdge === "left"
          ? "resize-left"
          : "resize-right"
        : "move",
      requestedPlacement: target.placement,
    });
    if (policy.lockPositioning) return;
    if (target.vertical?.mode === "flow") {
      node.positioning = {
        gapBefore: target.vertical.gapBefore,
        mode: "flow",
        order: target.vertical.order,
      };
    } else if (target.vertical?.mode === "overlay") {
      node.positioning = {
        anchor: target.vertical.anchor,
        anchored: true,
        mode: "overlay",
        offset: target.vertical.offset,
      };
    }
  });
  return next;
}

function updateSampleTextValue(
  variant: ComponentDesignVariantV4,
  effectiveSampleText: Record<string, string | string[]>,
  selection: ComponentLabElementSelection,
  value: string,
) {
  const next = cloneVariant(variant);
  const current = next.sampleText[selection.roleId] ??
    effectiveSampleText[selection.roleId] ??
    "";
  if (Array.isArray(current)) {
    const values = [...current];
    while (values.length <= selection.occurrenceId) values.push("");
    values[selection.occurrenceId] = value;
    next.sampleText[selection.roleId] = values;
  } else {
    next.sampleText[selection.roleId] = value;
  }
  return next;
}

export default function ComponentLabClient({
  catalog,
}: {
  catalog: ComponentLabInstanceCatalog;
}) {
  const router = useRouter();
  const providerDocument = useComponentDesignDocument();
  const initialDocument = useMemo(
    () => migrateComponentDesignDocumentV2ToV4(providerDocument),
    [providerDocument],
  );
  const [document, setDocument] = useState(initialDocument);
  const [selectionScope, setSelectionScope] =
    useState<ComponentVariantSelection>({
      component: "HeroSection",
      variant: COMPONENT_DESIGN_MANIFEST_BY_COMPONENT.HeroSection.defaultVariant,
    });
  const [elementSelection, setElementSelection] = useState<
    ComponentLabElementSelection[]
  >([]);
  const [activeDevice, setActiveDevice] =
    useState<ComponentDesignBreakpoint>("desktop");
  const [fontLabDocument, setFontLabDocument] =
    useState<FontLabDocument | null>(null);
  const [baseRevision, setBaseRevision] = useState<string | null>(null);
  const [saveState, setSaveState] =
    useState<ComponentLabSaveState>("saving");
  const [showGrid, setShowGrid] = useState(true);
  const [previewContentHeight, setPreviewContentHeight] = useState(0);
  const [previewFrameHeight, setPreviewFrameHeight] = useState(0);
  const [fitScale, setFitScale] = useState(1);
  const [manualScale, setManualScale] = useState<number | null>(null);
  const [renderSessionId, setRenderSessionId] = useState(createId);
  const [historyRevision, setHistoryRevision] = useState(0);
  const [historyAvailability, setHistoryAvailability] = useState({
    canRedo: false,
    canUndo: false,
  });
  const [conflict, setConflict] = useState<ConflictState | null>(null);
  const [editorTokenRequired, setEditorTokenRequired] = useState(false);
  const [showEditorTokenDialog, setShowEditorTokenDialog] = useState(false);
  const [tokenDialogError, setTokenDialogError] = useState<string | null>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef(document);
  const committedDocumentRef = useRef(document);
  const baseRevisionRef = useRef<string | null>(null);
  const saveQueueRef = useRef<SaveJob[]>([]);
  const saveRunningRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processSaveQueueRef = useRef<() => void>(() => undefined);
  const historiesRef = useRef(
    new Map<string, ComponentLabHistoryState<ComponentDesignVariantV4>>(),
  );
  const lastSelectionRef = useRef(
    new Map<string, ComponentLabElementSelection[]>(),
  );
  const textTransactionRef = useRef<TextTransaction | null>(null);
  const ignoreNextBroadcastRef = useRef(false);
  const conflictRef = useRef<ConflictState | null>(null);
  const editorTokenRequiredRef = useRef(false);

  const { component, variant } = selectionScope;
  const currentVariant = document.components[component].variants[variant];
  const variantDescriptor = getComponentDesignVariantDescriptor(
    component,
    variant,
  );
  const currentLayout = resolveComponentDesignDeviceLayout(
    currentVariant,
    activeDevice,
  );
  const editingEnabled = Boolean(baseRevision) &&
    !conflict &&
    (
      activeDevice === "desktop" ||
      currentVariant[activeDevice].mode === "custom"
    );
  const presetNode = useMemo(
    () => createVariantSampleNode(catalog.components[component], variant),
    [catalog, component, variant],
  );
  const fallbackSampleText = useMemo(
    () => extractVariantSampleText(component, variant, presetNode),
    [component, presetNode, variant],
  );
  const effectiveSampleText = useMemo(
    () => ({
      ...fallbackSampleText,
      ...currentVariant.sampleText,
    }),
    [currentVariant.sampleText, fallbackSampleText],
  );
  const previewNode = useMemo(
    () => createVariantSampleNode(
      catalog.components[component],
      variant,
      currentVariant.sampleText,
    ),
    [catalog, component, currentVariant.sampleText, variant],
  );
  const previewData = useMemo(
    () => createPreviewData(component, previewNode),
    [component, previewNode],
  );
  const runtimeDocument = useMemo(
    () => resolveComponentDesignRuntimeDocument(document),
    [document],
  );
  const viewport = PREVIEW_VIEWPORTS.find(
    (candidate) => candidate.key === activeDevice,
  ) ?? DEFAULT_PREVIEW_VIEWPORT;
  const canvasHeight = Math.max(viewport.height, previewContentHeight);
  const previewScale = manualScale ?? fitScale;
  const scaledWidth = viewport.width * previewScale;
  const scaledHeight = canvasHeight * previewScale;

  const setCurrentDocument = useCallback((next: ComponentDesignDocumentV4) => {
    documentRef.current = next;
    setDocument(next);
  }, []);

  const mergeRemoteDocument = useCallback((
    remoteDocument: ComponentDesignDocumentV4,
    conflictScope?: ComponentLabSaveScope | null,
  ) => {
    const activeConflictScope = conflictScope === undefined
      ? conflictRef.current?.job ?? null
      : conflictScope;
    const next = mergeComponentLabRemoteDocument({
      conflictScope: activeConflictScope,
      localDocument: documentRef.current,
      pendingScopes: saveQueueRef.current,
      remoteDocument,
      textTransactionScope: textTransactionRef.current,
    });
    setCurrentDocument(next);
    return next;
  }, [setCurrentDocument]);

  const publishCommittedDocument = useCallback(
    (nextDocument: ComponentDesignDocumentV4) => {
      ignoreNextBroadcastRef.current = true;
      dispatchComponentDesignUpdated(
        resolveComponentDesignRuntimeDocument(nextDocument),
      );
    },
    [],
  );

  const processSaveQueue = useCallback(async () => {
    if (
      saveRunningRef.current ||
      conflictRef.current ||
      editorTokenRequiredRef.current ||
      saveQueueRef.current.length === 0
    ) {
      return;
    }
    const revision = baseRevisionRef.current;
    if (!revision) {
      setSaveState("error");
      return;
    }

    saveRunningRef.current = true;
    let continueImmediately = true;
    setSaveState("saving");
    const job = saveQueueRef.current[0];
    try {
      const accessHeaders = getLocalEditorAccessHeaders();
      const response = await fetch("/api/component-design", {
        body: JSON.stringify({
          baseRevision: revision,
          componentKey: job.component,
          operationId: job.operationId,
          variantKey: job.variant,
          variantPatch: job.value,
        }),
        headers: {
          "Content-Type": "application/json",
          ...accessHeaders,
        },
        method: "POST",
      });
      const payload = await response.json() as ComponentDesignApiPayload;
      if (isComponentLabEditorTokenRequired(payload)) {
        editorTokenRequiredRef.current = true;
        setEditorTokenRequired(true);
        setTokenDialogError(
          Object.keys(accessHeaders).length > 0
            ? "当前浏览器的 Token 与 .env.local 不匹配，请重新输入。"
            : null,
        );
        setShowEditorTokenDialog(true);
        setSaveState("error");
        continueImmediately = false;
        return;
      }
      editorTokenRequiredRef.current = false;
      setEditorTokenRequired(false);
      if (
        response.status === 409 &&
        payload.config &&
        payload.revision
      ) {
        const serverDocument = normalizeComponentDesignDocument(payload.config);
        const serverVariant =
          serverDocument.components[job.component].variants[job.variant];
        const resolution = classifyComponentLabSaveConflict({
          isEqual: variantsEqual,
          localValue: job.value,
          serverValue: serverVariant,
          submittedAgainst: job.submittedAgainst,
        });
        if (resolution === "already-committed") {
          committedDocumentRef.current = serverDocument;
          baseRevisionRef.current = payload.revision;
          setBaseRevision(payload.revision);
          removeSaveJob(saveQueueRef.current, job.operationId);
          mergeRemoteDocument(serverDocument, null);
          publishCommittedDocument(serverDocument);
          setSaveState(
            saveQueueRef.current.length > 0 ? "saving" : "saved",
          );
          return;
        }
        if (resolution === "rebase") {
          committedDocumentRef.current = serverDocument;
          baseRevisionRef.current = payload.revision;
          setBaseRevision(payload.revision);
          job.submittedAgainst = cloneVariant(serverVariant);
          mergeRemoteDocument(serverDocument, null);
          publishCommittedDocument(serverDocument);
          return;
        }
        const nextConflict: ConflictState = {
          job,
          revision: payload.revision,
          serverDocument,
        };
        committedDocumentRef.current = serverDocument;
        baseRevisionRef.current = payload.revision;
        setBaseRevision(payload.revision);
        conflictRef.current = nextConflict;
        mergeRemoteDocument(serverDocument, nextConflict.job);
        publishCommittedDocument(serverDocument);
        setConflict(nextConflict);
        setSaveState("error");
        continueImmediately = false;
        return;
      }
      if (!response.ok || !payload.config || !payload.revision) {
        throw new Error(payload.error?.message ?? "保存失败");
      }

      const committed = normalizeComponentDesignDocument(payload.config);
      committedDocumentRef.current = committed;
      baseRevisionRef.current = payload.revision;
      setBaseRevision(payload.revision);
      removeSaveJob(saveQueueRef.current, job.operationId);
      mergeRemoteDocument(committed, null);
      publishCommittedDocument(committed);
      setSaveState(saveQueueRef.current.length > 0 ? "saving" : "saved");
    } catch {
      continueImmediately = false;
      setSaveState("error");
      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          processSaveQueueRef.current();
        }, SAVE_RETRY_DELAY_MS);
      }
    } finally {
      saveRunningRef.current = false;
      if (
        continueImmediately &&
        !conflictRef.current &&
        saveQueueRef.current.length > 0
      ) {
        queueMicrotask(processSaveQueueRef.current);
      }
    }
  }, [mergeRemoteDocument, publishCommittedDocument]);

  useEffect(() => {
    processSaveQueueRef.current = () => {
      void processSaveQueue();
    };
    return () => {
      processSaveQueueRef.current = () => undefined;
    };
  }, [processSaveQueue]);

  const saveEditorTokenAndRetry = useCallback((token: string) => {
    try {
      if (!setLocalEditorAccessToken(token)) {
        setTokenDialogError("请输入非空的本机编辑 Token。");
        return;
      }
    } catch {
      setTokenDialogError("无法保存 Token，请检查浏览器是否允许本机存储。");
      setSaveState("error");
      return;
    }

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    editorTokenRequiredRef.current = false;
    setEditorTokenRequired(false);
    setTokenDialogError(null);
    setShowEditorTokenDialog(false);
    setSaveState("saving");
    queueMicrotask(() => processSaveQueueRef.current());
  }, []);

  const enqueueSave = useCallback((
    targetComponent: ComponentDesignAuthorComponent,
    targetVariant: string,
    value: ComponentDesignVariantV4,
    submittedAgainst: ComponentDesignVariantV4,
  ) => {
    saveQueueRef.current.push({
      component: targetComponent,
      operationId: createId(),
      submittedAgainst: cloneVariant(submittedAgainst),
      value: cloneVariant(value),
      variant: targetVariant,
    });
    setSaveState("saving");
    queueMicrotask(() => void processSaveQueue());
  }, [processSaveQueue]);

  const recordHistory = useCallback((
    targetComponent: ComponentDesignAuthorComponent,
    targetVariant: string,
    before: ComponentDesignVariantV4,
    after: ComponentDesignVariantV4,
  ) => {
    const key = scopeKey(targetComponent, targetVariant);
    const current = historiesRef.current.get(key) ??
      createComponentLabHistory<ComponentDesignVariantV4>();
    historiesRef.current.set(
      key,
      pushComponentLabHistory({
        after: cloneVariant(after),
        before: cloneVariant(before),
        history: current,
        isEqual: variantsEqual,
      }),
    );
    setHistoryRevision((value) => value + 1);
  }, []);

  const flushTextTransaction = useCallback(() => {
    const transaction = textTransactionRef.current;
    if (!transaction) return;
    clearTimeout(transaction.timer);
    textTransactionRef.current = null;
    const after = documentRef.current.components[transaction.component]
      .variants[transaction.variant];
    if (variantsEqual(transaction.before, after)) {
      if (
        !saveRunningRef.current &&
        saveQueueRef.current.length === 0 &&
        !conflictRef.current
      ) {
        setSaveState("saved");
      }
      return;
    }
    recordHistory(
      transaction.component,
      transaction.variant,
      transaction.before,
      after,
    );
    enqueueSave(
      transaction.component,
      transaction.variant,
      after,
      transaction.before,
    );
  }, [enqueueSave, recordHistory]);

  const commitVariant = useCallback((
    targetComponent: ComponentDesignAuthorComponent,
    targetVariant: string,
    updater: (value: ComponentDesignVariantV4) => ComponentDesignVariantV4,
  ) => {
    flushTextTransaction();
    const before = documentRef.current.components[targetComponent]
      .variants[targetVariant];
    const after = updater(cloneVariant(before));
    if (variantsEqual(before, after)) return;
    setCurrentDocument(
      updateVariantInDocument(
        documentRef.current,
        targetComponent,
        targetVariant,
        after,
      ),
    );
    recordHistory(targetComponent, targetVariant, before, after);
    enqueueSave(targetComponent, targetVariant, after, before);
  }, [
    enqueueSave,
    flushTextTransaction,
    recordHistory,
    setCurrentDocument,
  ]);

  const updateSampleText = useCallback((
    target: ComponentLabElementSelection,
    value: string,
  ) => {
    const key = `${scopeKey(component, variant)}:${target.roleId}:${target.occurrenceId}`;
    const current = documentRef.current.components[component].variants[variant];
    const transaction = textTransactionRef.current;
    if (transaction && transaction.key !== key) flushTextTransaction();
    const before = textTransactionRef.current?.before ?? cloneVariant(current);
    const next = updateSampleTextValue(
      current,
      effectiveSampleText,
      target,
      value,
    );
    if (variantsEqual(current, next)) return;
    setCurrentDocument(
      updateVariantInDocument(
        documentRef.current,
        component,
        variant,
        next,
      ),
    );
    if (textTransactionRef.current) {
      clearTimeout(textTransactionRef.current.timer);
    }
    const timer = setTimeout(flushTextTransaction, TEXT_SAVE_DELAY_MS);
    textTransactionRef.current = {
      before,
      component,
      key,
      timer,
      variant,
    };
    setSaveState("saving");
  }, [
    component,
    effectiveSampleText,
    flushTextTransaction,
    setCurrentDocument,
    variant,
  ]);

  const selectVariant = useCallback((next: ComponentVariantSelection) => {
    flushTextTransaction();
    lastSelectionRef.current.set(
      scopeKey(component, variant),
      elementSelection,
    );
    setSelectionScope(next);
    setElementSelection(
      lastSelectionRef.current.get(scopeKey(next.component, next.variant)) ?? [],
    );
    setPreviewContentHeight(0);
    setRenderSessionId(createId());
  }, [
    component,
    elementSelection,
    flushTextTransaction,
    variant,
  ]);

  const selectElement = useCallback((
    target: ComponentLabElementSelection,
    additive: boolean,
  ) => {
    setElementSelection((current) => {
      if (!additive) return [target];
      const exists = current.some(
        (candidate) =>
          candidate.roleId === target.roleId &&
          candidate.occurrenceId === target.occurrenceId,
      );
      return exists
        ? current.filter(
          (candidate) =>
            candidate.roleId !== target.roleId ||
            candidate.occurrenceId !== target.occurrenceId,
        )
        : [...current, target];
    });
  }, []);

  const updateDeviceLayout = useCallback((
    layout: ComponentDesignDeviceLayoutV4,
  ) => {
    commitVariant(component, variant, (value) =>
      setDeviceLayout(value, activeDevice, layout));
  }, [activeDevice, commitVariant, component, variant]);

  const handlePreviewInteraction = useCallback((
    message: ComponentLabPreviewInteractionMessage,
  ) => {
    if (message.operation === "text") {
      const textMessage = message as ComponentLabPreviewTextChangeMessage;
      updateSampleText(
        {
          occurrenceId: Number.parseInt(textMessage.occurrenceId, 10) || 0,
          roleId: textMessage.roleId,
        },
        textMessage.text,
      );
      if (message.phase === "commit" || message.phase === "cancel") {
        flushTextTransaction();
      }
      return;
    }
    if (message.phase === "cancel" || message.phase === "start") return;
    if (message.phase !== "commit") return;
    const placementMessage = message as ComponentLabPreviewPlacementMessage;
    commitVariant(component, variant, (value) => {
      const layout = resolveComponentDesignDeviceLayout(value, activeDevice);
      return setDeviceLayout(
        value,
        activeDevice,
        applyPlacementInteraction(
          layout,
          placementMessage,
          value.composition,
        ),
      );
    });
  }, [
    activeDevice,
    commitVariant,
    component,
    flushTextTransaction,
    updateSampleText,
    variant,
  ]);

  const handleUndo = useCallback(() => {
    flushTextTransaction();
    const key = scopeKey(component, variant);
    const currentHistory = historiesRef.current.get(key) ??
      createComponentLabHistory<ComponentDesignVariantV4>();
    const result = undoComponentLabHistory(currentHistory);
    if (!result.value) return;
    historiesRef.current.set(key, result.history);
    const before = documentRef.current.components[component].variants[variant];
    setCurrentDocument(
      updateVariantInDocument(
        documentRef.current,
        component,
        variant,
        result.value,
      ),
    );
    enqueueSave(component, variant, result.value, before);
    setHistoryRevision((value) => value + 1);
  }, [
    component,
    enqueueSave,
    flushTextTransaction,
    setCurrentDocument,
    variant,
  ]);

  const handleRedo = useCallback(() => {
    flushTextTransaction();
    const key = scopeKey(component, variant);
    const currentHistory = historiesRef.current.get(key) ??
      createComponentLabHistory<ComponentDesignVariantV4>();
    const result = redoComponentLabHistory(currentHistory);
    if (!result.value) return;
    historiesRef.current.set(key, result.history);
    const before = documentRef.current.components[component].variants[variant];
    setCurrentDocument(
      updateVariantInDocument(
        documentRef.current,
        component,
        variant,
        result.value,
      ),
    );
    enqueueSave(component, variant, result.value, before);
    setHistoryRevision((value) => value + 1);
  }, [
    component,
    enqueueSave,
    flushTextTransaction,
    setCurrentDocument,
    variant,
  ]);

  useEffect(() => {
    void router.prefetch("/playground");
    const controller = new AbortController();
    const headers = getLocalEditorAccessHeaders();
    void Promise.all([
      fetch("/api/component-design", {
        cache: "no-store",
        headers,
        signal: controller.signal,
      }).then(async (response) => {
        if (!response.ok) throw new Error("ComponentLab 配置读取失败");
        return response.json() as Promise<ComponentDesignApiPayload>;
      }),
      fetch("/api/font-lab", {
        cache: "no-store",
        headers,
        signal: controller.signal,
      }).then(async (response) =>
        response.ok ? response.json() as Promise<FontLabApiPayload> : null
      ),
    ]).then(([componentPayload, fontPayload]) => {
      if (componentPayload.config && componentPayload.revision) {
        const next = normalizeComponentDesignDocument(componentPayload.config);
        committedDocumentRef.current = next;
        setCurrentDocument(next);
        baseRevisionRef.current = componentPayload.revision;
        setBaseRevision(componentPayload.revision);
        setSaveState("saved");
      }
      if (fontPayload?.config) setFontLabDocument(fontPayload.config);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setSaveState("error");
    });
    return () => controller.abort();
  }, [router, setCurrentDocument]);

  useEffect(() => {
    if (baseRevision) {
      queueMicrotask(() => processSaveQueueRef.current());
    }
  }, [baseRevision]);

  useEffect(() => {
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(COMPONENT_DESIGN_COMMIT_CHANNEL);
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (!isCommittedComponentDesignMessage(event.data)) return;
      if (ignoreNextBroadcastRef.current) {
        ignoreNextBroadcastRef.current = false;
        return;
      }
      if (
        saveQueueRef.current.length > 0 ||
        textTransactionRef.current ||
        saveRunningRef.current
      ) {
        return;
      }
      void fetch("/api/component-design", {
        cache: "no-store",
        headers: getLocalEditorAccessHeaders(),
      }).then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json() as ComponentDesignApiPayload;
        if (!payload.config || !payload.revision) return;
        const next = normalizeComponentDesignDocument(payload.config);
        committedDocumentRef.current = next;
        setCurrentDocument(next);
        baseRevisionRef.current = payload.revision;
        setBaseRevision(payload.revision);
      }).catch(() => undefined);
    };
    channel?.addEventListener("message", handleMessage);
    return () => {
      channel?.removeEventListener("message", handleMessage);
      channel?.close();
    };
  }, [setCurrentDocument]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        saveQueueRef.current.length === 0 &&
        !textTransactionRef.current &&
        !saveRunningRef.current
      ) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (textTransactionRef.current) {
      clearTimeout(textTransactionRef.current.timer);
    }
  }, []);

  useLayoutEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;
    const updateFit = () => {
      setPreviewFrameHeight(frame.clientHeight);
      const widthScale = Math.max(0.2, (frame.clientWidth - 48) / viewport.width);
      const heightScale = Math.max(0.2, (frame.clientHeight - 48) / canvasHeight);
      setFitScale(Math.min(1, widthScale, heightScale));
    };
    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [canvasHeight, viewport.width]);

  useEffect(() => {
    const current = historiesRef.current.get(scopeKey(component, variant)) ??
      createComponentLabHistory<ComponentDesignVariantV4>();
    setHistoryAvailability({
      canRedo: current.future.length > 0,
      canUndo: current.past.length > 0,
    });
  }, [component, historyRevision, variant]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLocaleLowerCase() !== "z") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (event.shiftKey) handleRedo();
      else handleUndo();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleRedo, handleUndo]);

  const resolveConflictWithLocal = useCallback(() => {
    if (!conflict) return;
    flushTextTransaction();
    const latest = documentRef.current.components[conflict.job.component]
      .variants[conflict.job.variant];
    const remainingJobs = saveQueueRef.current.filter(
      (job) => !isSameSaveScope(job, conflict.job),
    );
    saveQueueRef.current = [{
      ...conflict.job,
      operationId: createId(),
      submittedAgainst: cloneVariant(
        conflict.serverDocument.components[conflict.job.component]
          .variants[conflict.job.variant],
      ),
      value: cloneVariant(latest),
    }, ...remainingJobs];
    committedDocumentRef.current = conflict.serverDocument;
    baseRevisionRef.current = conflict.revision;
    setBaseRevision(conflict.revision);
    mergeRemoteDocument(conflict.serverDocument, null);
    publishCommittedDocument(conflict.serverDocument);
    conflictRef.current = null;
    setConflict(null);
    setSaveState("saving");
    queueMicrotask(() => void processSaveQueue());
  }, [
    conflict,
    flushTextTransaction,
    mergeRemoteDocument,
    processSaveQueue,
    publishCommittedDocument,
  ]);

  const resolveConflictWithServer = useCallback(() => {
    if (!conflict) return;
    const textTransaction = textTransactionRef.current;
    if (textTransaction && isSameSaveScope(textTransaction, conflict.job)) {
      clearTimeout(textTransaction.timer);
      textTransactionRef.current = null;
    }
    saveQueueRef.current = saveQueueRef.current.filter(
      (job) => !isSameSaveScope(job, conflict.job),
    );
    historiesRef.current.set(
      scopeKey(conflict.job.component, conflict.job.variant),
      createComponentLabHistory<ComponentDesignVariantV4>(),
    );
    setHistoryRevision((value) => value + 1);
    committedDocumentRef.current = conflict.serverDocument;
    baseRevisionRef.current = conflict.revision;
    setBaseRevision(conflict.revision);
    mergeRemoteDocument(conflict.serverDocument, null);
    publishCommittedDocument(conflict.serverDocument);
    conflictRef.current = null;
    setConflict(null);
    setSaveState(saveQueueRef.current.length > 0 ? "saving" : "saved");
    queueMicrotask(() => void processSaveQueue());
  }, [
    conflict,
    mergeRemoteDocument,
    processSaveQueue,
    publishCommittedDocument,
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white min-[1100px]:h-screen min-[1100px]:overflow-hidden">
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="text-sm font-medium tracking-tight text-white">
            ComponentLab
          </h1>
          <p className="hidden truncate text-[11px] text-white/35 sm:block">
            直接编辑组件内部文字、图片与按钮的共享版式
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/playground")}
          className="flex min-h-8 shrink-0 items-center gap-2 border border-white/12 px-3 text-xs text-white/65 hover:border-white/30 hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          返回 Playground
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] min-[1100px]:h-[calc(100vh-3.5rem)] min-[1100px]:min-h-0 min-[1100px]:grid-cols-[260px_minmax(0,1fr)_300px]">
        <nav
          aria-label="组件版式与元素"
          data-component-lab-region="navigation"
          className="grid h-[640px] min-w-0 grid-rows-[minmax(230px,42%)_minmax(0,1fr)] border-b border-white/10 bg-black md:col-start-1 md:row-start-1 md:h-[720px] md:border-b-0 md:border-r min-[1100px]:h-auto min-[1100px]:min-h-0"
        >
          <ComponentVariantPicker
            selection={selectionScope}
            onSelect={selectVariant}
          />
          <ComponentElementNavigator
            variant={variantDescriptor}
            selection={elementSelection}
            onSelectSection={() => setElementSelection([])}
            onSelectGroup={(roleIds) =>
              setElementSelection(
                roleIds.map((roleId) => ({ occurrenceId: 0, roleId })),
              )}
            onSelectElement={selectElement}
          />
        </nav>

        <section
          aria-label="ComponentLab 实际页面预览"
          data-component-lab-region="canvas"
          className="grid h-[720px] min-w-0 grid-rows-[auto_minmax(0,1fr)] border-b border-white/10 bg-[#050505] md:col-start-2 md:row-start-1 min-[1100px]:h-auto min-[1100px]:min-h-0 min-[1100px]:border-b-0"
        >
          <ComponentLabToolbar
            activeDevice={activeDevice}
            canRedo={historyAvailability.canRedo}
            canUndo={historyAvailability.canUndo}
            onDeviceChange={(device) => {
              flushTextTransaction();
              setActiveDevice(device);
              setPreviewContentHeight(0);
              setRenderSessionId(createId());
            }}
            onFit={() => setManualScale(null)}
            onRedo={handleRedo}
            onSaveErrorClick={editorTokenRequired
              ? () => {
                setTokenDialogError(null);
                setShowEditorTokenDialog(true);
              }
              : undefined}
            onToggleGrid={() => setShowGrid((value) => !value)}
            onUndo={handleUndo}
            onZoomIn={() =>
              setManualScale(Math.min(1.5, (manualScale ?? fitScale) + 0.1))}
            onZoomOut={() =>
              setManualScale(Math.max(0.2, (manualScale ?? fitScale) - 0.1))}
            saveState={saveState}
            showGrid={showGrid}
            zoomPercent={Math.round(previewScale * 100)}
          />

          <div
            ref={previewFrameRef}
            className="component-lab-scroll relative min-h-0 overflow-auto"
          >
            {conflict ? (
              <div className="sticky left-4 top-4 z-40 mx-auto flex w-[min(620px,calc(100%-32px))] items-center gap-3 border border-amber-200/35 bg-black/95 p-3 shadow-2xl backdrop-blur">
                <AlertTriangle
                  aria-hidden="true"
                  className="size-4 shrink-0 text-amber-200"
                />
                <p className="min-w-0 flex-1 text-xs leading-5 text-white/65">
                  另一窗口修改了当前版式。本地结果仍然保留。
                </p>
                <button
                  type="button"
                  onClick={resolveConflictWithServer}
                  className="min-h-8 border border-white/15 px-2.5 text-[11px] text-white/65"
                >
                  加载最新版本
                </button>
                <button
                  type="button"
                  onClick={resolveConflictWithLocal}
                  className="min-h-8 bg-white px-2.5 text-[11px] text-black"
                >
                  保留本地修改
                </button>
              </div>
            ) : null}
            <div
              className="grid place-items-center"
              style={{
                height: `${Math.max(
                  previewFrameHeight,
                  scaledHeight + 48,
                )}px`,
                minWidth: `${scaledWidth + 48}px`,
              }}
            >
              <div
                className="origin-top-left border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.75)]"
                style={{
                  height: `${scaledHeight}px`,
                  width: `${scaledWidth}px`,
                }}
              >
                <div
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ComponentLabPreviewFrame
                    component={component}
                    composition={currentVariant.composition}
                    data={previewData}
                    device={activeDevice}
                    editingEnabled={editingEnabled}
                    height={canvasHeight}
                    layout={currentLayout}
                    onContentHeight={setPreviewContentHeight}
                    onInteraction={handlePreviewInteraction}
                    onSelection={(nextSelection) =>
                      setElementSelection(nextSelection)}
                    renderSessionId={renderSessionId}
                    runtimeDocument={runtimeDocument}
                    selection={elementSelection}
                    showGrid={showGrid}
                    variant={variant}
                    viewportHeight={viewport.height}
                    viewportWidth={viewport.width}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ComponentLabInspector
          activeDevice={activeDevice}
          editingEnabled={Boolean(baseRevision) && !conflict}
          effectiveSampleText={effectiveSampleText}
          fontLabDocument={fontLabDocument}
          onEnableDevice={() =>
            commitVariant(component, variant, (value) => {
              if (activeDevice === "desktop") return value;
              return enableComponentDesignDeviceOverride(
                value,
                activeDevice,
              );
            })}
          onLayoutChange={updateDeviceLayout}
          onRestoreDevice={() =>
            commitVariant(component, variant, (value) => {
              if (activeDevice === "desktop") return value;
              const next = cloneVariant(value);
              next[activeDevice].mode = "linked";
              return next;
            })}
          onSampleTextCommit={flushTextTransaction}
          onSampleTextChange={updateSampleText}
          selection={elementSelection}
          variant={currentVariant}
          variantDescriptor={variantDescriptor}
        />
      </div>
      <span className="sr-only" aria-live="polite">
        {historyRevision}
      </span>
      {showEditorTokenDialog ? (
        <ComponentLabTokenDialog
          errorMessage={tokenDialogError}
          onClose={() => {
            setTokenDialogError(null);
            setShowEditorTokenDialog(false);
          }}
          onSubmit={saveEditorTokenAndRetry}
        />
      ) : null}
    </main>
  );
}
