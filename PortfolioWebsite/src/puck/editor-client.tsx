"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";

import ComponentDesignProvider, {
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import type { ComponentLabNode } from "@/lib/component-lab-presets";
import type {
  CreatePageRequest,
  PageSummary,
} from "@/lib/editor-page-contract";
import {
  getLocalEditorAccessHeaders,
  setLocalEditorAccessToken,
} from "@/lib/local-editor-access";
import {
  normalizeEditorPathInputToSlugKey,
  toAdminPathFromSlugKey,
  toPublicPathFromSlugKey,
} from "@/lib/public-paths";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PUCK_PREVIEW_VIEWPORTS,
} from "@/lib/preview-viewports";
import config from "@/puck/config";
import { createDesignAwareEditorConfig } from "@/puck/editor/design-aware-config";
import {
  CreatePageDialog,
  LocalEditorTokenDialog,
  UnsavedChangesDialog,
} from "@/puck/editor/editor-dialogs";
import {
  EditorComponentOverlay,
  EditorDrawerItem,
  EditorFieldLabel,
  EditorFields,
  EditorWorkspace,
} from "@/puck/editor/editor-workspace";
import { useEditorUiState } from "@/puck/editor/editor-ui-state";
import { useFontLabEditorSync } from "@/puck/editor/font-lab-preview-sync";
import IframePreviewChrome from "@/puck/editor/iframe-preview-chrome";
import {
  loadPuckPageSlugs,
  PAGE_LIST_NETWORK_ERROR_MESSAGE,
} from "@/puck/editor/page-list-loader";
import {
  AUTO_SAVE_INTERVAL_MS,
  getApiSaveErrorMessage,
  getUnexpectedSaveErrorMessage,
  isEditorTokenRequired,
  type SaveState,
  type SaveTrigger,
} from "@/puck/editor/save-status";
import { ChineseTextInputField } from "@/puck/fields/ChineseTextField";
import { openDetachedWindow } from "@/puck/editor/open-detached-window";
import type { FontLabSyncState, PageListState } from "@/puck/editor/types";
import type { PuckComponentType } from "@/puck/component-manifest";
import editorEmptyStateData from "../../content/component-design/editor-empty-state.json";
import styles from "./editor-shell.module.css";

type PuckApiPayload = {
  data?: Data;
  pages?: PageSummary[];
  slug?: string;
  slugs?: string[];
  error?: {
    code: string;
    issues?: Array<{
      message: string;
      path: string;
    }>;
    message: string;
  };
};

type PuckEditorClientProps = {
  initialSlug: string;
  previewSamples: Record<PuckComponentType, ComponentLabNode>;
};

type SidebarTextFieldProps = {
  children?: ReactNode;
} & ComponentProps<typeof ChineseTextInputField>;

type EditorIframeWrapperProps = {
  children: ReactNode;
  componentDesignDocument: ComponentProps<typeof ComponentDesignProvider>["initialDocument"];
  document?: Document;
  onSaveShortcut: () => void;
};

const initialData = editorEmptyStateData as Data;
const editorConfig = createDesignAwareEditorConfig(config);
const EDITOR_IFRAME_PROP = {
  enabled: true,
  syncHostStyles: true,
  waitForStyles: true,
} as const;

const EDITOR_FIELD_TYPE_OVERRIDES = {
  text: (props: SidebarTextFieldProps) => (
    <ChineseTextInputField
      {...props}
      value={typeof props.value === "string" ? props.value : ""}
    />
  ),
  textarea: (props: SidebarTextFieldProps) => (
    <ChineseTextInputField
      {...props}
      multiline
      value={typeof props.value === "string" ? props.value : ""}
    />
  ),
};

function EditorIframeWrapper({
  children,
  componentDesignDocument,
  document: frameDocument,
  onSaveShortcut,
}: EditorIframeWrapperProps) {
  useEffect(() => {
    if (!frameDocument) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "s") {
        event.preventDefault();
        onSaveShortcut();
      }
    };
    frameDocument.addEventListener("keydown", handleKeyDown);
    return () => frameDocument.removeEventListener("keydown", handleKeyDown);
  }, [frameDocument, onSaveShortcut]);

  return (
    <IframePreviewChrome document={frameDocument}>
      <ComponentDesignProvider
        initialDocument={componentDesignDocument}
        listenToGlobalUpdates={false}
      >
        {children}
      </ComponentDesignProvider>
    </IframePreviewChrome>
  );
}

function slugQueryValue(slugKey: string) {
  return slugKey === "index" ? "" : slugKey;
}

export default function PuckEditorClient({
  initialSlug,
  previewSamples,
}: PuckEditorClientProps) {
  const componentDesignDocument = useComponentDesignDocument();
  const router = useRouter();
  const publicPath = toPublicPathFromSlugKey(initialSlug);
  const currentAdminPath = toAdminPathFromSlugKey(initialSlug);
  const [data, setData] = useState<Data>(initialData);
  const [editorInstanceRevision, setEditorInstanceRevision] = useState(0);
  const [pageSummaries, setPageSummaries] = useState<PageSummary[]>([]);
  const [pageListState, setPageListState] = useState<PageListState>({
    message: null,
    status: "loading",
  });
  const [pageListRequestRevision, setPageListRequestRevision] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveTrigger, setSaveTrigger] = useState<SaveTrigger>("manual");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [editorTokenRequired, setEditorTokenRequired] = useState(false);
  const [showEditorTokenDialog, setShowEditorTokenDialog] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSwitchingPage, startPageSwitchTransition] = useTransition();
  const [fontLabSyncState, setFontLabSyncState] = useState<FontLabSyncState>("idle");
  const {
    leftCollapsed,
    leftTab,
    rightCollapsed,
    setLeftCollapsed,
    setLeftTab,
    setRightCollapsed,
  } = useEditorUiState();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [createPageError, setCreatePageError] = useState<string | null>(null);

  const currentDataRef = useRef<Data>(initialData);
  const lastSavedDataRef = useRef<Data>(initialData);
  const hasUnsavedChangesRef = useRef(false);
  const dataRevisionRef = useRef(0);
  const activeSlugRef = useRef(initialSlug);
  const saveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const queuedAutoSaveKeyRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const savePageRef = useRef<(trigger: SaveTrigger, nextData?: Data) => Promise<boolean>>(
    async () => false,
  );

  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current !== null) return;
    autoSaveTimerRef.current = window.setTimeout(() => {
      autoSaveTimerRef.current = null;
      if (hasUnsavedChangesRef.current) {
        void savePageRef.current("auto");
      }
    }, AUTO_SAVE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    activeSlugRef.current = initialSlug;
  }, [initialSlug]);

  useFontLabEditorSync(setFontLabSyncState);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChangesRef.current) return;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    return clearAutoSaveTimer;
  }, [clearAutoSaveTimer]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPages() {
      setPageListState({ message: null, status: "loading" });
      try {
        const result = await loadPuckPageSlugs({ signal: controller.signal });
        if (!isMounted) return;
        if (result.status === "ready") {
          setPageSummaries(result.pages);
          setPageListState({ message: null, status: "ready" });
        } else {
          setPageListState(result);
        }
      } catch (error) {
        if (!isMounted || (error as { name?: string }).name === "AbortError") return;
        setPageListState({
          message: PAGE_LIST_NETWORK_ERROR_MESSAGE,
          status: "error",
        });
      }
    }

    void loadPages();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialSlug, pageListRequestRevision]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPage() {
      setLoadState("loading");
      clearAutoSaveTimer();
      try {
        const query = new URLSearchParams({
          slug: slugQueryValue(initialSlug),
        });
        const response = await fetch(`/api/puck?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!isMounted) return;

        if (response.status === 404) {
          currentDataRef.current = initialData;
          lastSavedDataRef.current = initialData;
          dataRevisionRef.current = 0;
          hasUnsavedChangesRef.current = false;
          setData(initialData);
          setSaveState("saved");
          setSaveErrorMessage(null);
          setLoadState("ready");
          return;
        }

        const payload = (await response.json()) as PuckApiPayload;
        if (!response.ok || !payload.data) {
          setLoadState("error");
          return;
        }

        currentDataRef.current = payload.data;
        lastSavedDataRef.current = payload.data;
        dataRevisionRef.current = 0;
        hasUnsavedChangesRef.current = false;
        setData(payload.data);
        setSaveState("saved");
        setSaveErrorMessage(null);
        setLastSavedAt(null);
        setEditorInstanceRevision((current) => current + 1);
        setLoadState("ready");
      } catch (error) {
        if (isMounted && (error as { name?: string }).name !== "AbortError") {
          setLoadState("error");
        }
      }
    }

    void loadPage();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [clearAutoSaveTimer, initialSlug]);

  const savePage = useCallback((trigger: SaveTrigger, nextData?: Data) => {
    const savePayload = nextData ?? currentDataRef.current;
    const revision = dataRevisionRef.current;
    const requestSlug = initialSlug;
    const autoSaveKey = `${requestSlug}:${revision}`;
    currentDataRef.current = savePayload;

    if (trigger === "auto") {
      if (
        !hasUnsavedChangesRef.current ||
        queuedAutoSaveKeyRef.current === autoSaveKey
      ) {
        return Promise.resolve(true);
      }
      queuedAutoSaveKeyRef.current = autoSaveKey;
    }

    clearAutoSaveTimer();

    const runSave = async () => {
      const isActivePage = () => activeSlugRef.current === requestSlug;
      if (isActivePage()) {
        setSaveTrigger(trigger);
        setSaveErrorMessage(null);
        setEditorTokenRequired(false);
        setSaveState("saving");
      }

      try {
        const response = await fetch("/api/puck", {
          body: JSON.stringify({
            data: savePayload,
            slug: slugQueryValue(requestSlug),
          }),
          headers: {
            "Content-Type": "application/json",
            ...getLocalEditorAccessHeaders(),
          },
          method: "POST",
        });
        let payload: PuckApiPayload;
        try {
          payload = (await response.json()) as PuckApiPayload;
        } catch {
          throw new Error(`保存接口返回了无法读取的响应（HTTP ${response.status}）。`);
        }
        if (!response.ok || payload.error) {
          const tokenRequired = isEditorTokenRequired(payload);
          if (isActivePage()) {
            setEditorTokenRequired(tokenRequired);
            if (tokenRequired && trigger === "manual") {
              setShowEditorTokenDialog(true);
            }
          }
          throw new Error(getApiSaveErrorMessage(payload, response.status));
        }

        if (!isActivePage()) return false;
        setEditorTokenRequired(false);
        setShowEditorTokenDialog(false);
        const savedLatestRevision = dataRevisionRef.current === revision;
        lastSavedDataRef.current = savePayload;
        setLastSavedAt(new Date());
        setPageSummaries((current) => current.map((page) => (
          page.slug === requestSlug
            ? {
              ...page,
              title: typeof savePayload.root?.props?.title === "string"
                ? savePayload.root.props.title || "未命名页面"
                : page.title,
            }
            : page
        )));

        if (savedLatestRevision) {
          hasUnsavedChangesRef.current = false;
          setSaveState("saved");
        } else {
          hasUnsavedChangesRef.current = true;
          setSaveState("dirty");
          scheduleAutoSave();
        }
        return savedLatestRevision;
      } catch (error) {
        if (isActivePage()) {
          hasUnsavedChangesRef.current = true;
          setSaveErrorMessage(getUnexpectedSaveErrorMessage(error));
          setSaveState("error");
          scheduleAutoSave();
        }
        return false;
      } finally {
        if (trigger === "auto" && queuedAutoSaveKeyRef.current === autoSaveKey) {
          queuedAutoSaveKeyRef.current = null;
        }
      }
    };

    const queuedSave = saveQueueRef.current.then(runSave, runSave);
    saveQueueRef.current = queuedSave;
    return queuedSave;
  }, [clearAutoSaveTimer, initialSlug, scheduleAutoSave]);

  useEffect(() => {
    savePageRef.current = savePage;
  }, [savePage]);

  const saveEditorTokenAndRetry = useCallback((token: string) => {
    try {
      if (!setLocalEditorAccessToken(token)) {
        setSaveErrorMessage("请输入非空的本地编辑 Token。");
        return;
      }
    } catch (error) {
      setSaveErrorMessage(getUnexpectedSaveErrorMessage(error));
      setSaveState("error");
      return;
    }

    setEditorTokenRequired(false);
    setShowEditorTokenDialog(false);
    void savePage("manual");
  }, [savePage]);

  const handleSaveShortcut = useCallback(() => {
    void savePageRef.current("manual");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "s") {
        event.preventDefault();
        handleSaveShortcut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveShortcut]);

  const navigateToPublicPath = useCallback((rawPath: string) => {
    const slugKey = normalizeEditorPathInputToSlugKey(rawPath);
    if (!slugKey) return;
    const nextAdminPath = toAdminPathFromSlugKey(slugKey);
    if (nextAdminPath === currentAdminPath) return;

    setLoadState("loading");
    setSaveErrorMessage(null);
    startPageSwitchTransition(() => {
      router.replace(nextAdminPath);
    });
  }, [currentAdminPath, router]);

  const requestProtectedAction = useCallback((action: () => void) => {
    if (!hasUnsavedChangesRef.current) {
      action();
      return;
    }
    pendingActionRef.current = action;
    setShowUnsavedDialog(true);
  }, []);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setShowUnsavedDialog(false);
    action?.();
  }, []);

  const discardCurrentChanges = useCallback(() => {
    clearAutoSaveTimer();
    currentDataRef.current = lastSavedDataRef.current;
    dataRevisionRef.current += 1;
    hasUnsavedChangesRef.current = false;
    setData(lastSavedDataRef.current);
    setSaveErrorMessage(null);
    setSaveState("saved");
    setEditorInstanceRevision((current) => current + 1);
    runPendingAction();
  }, [clearAutoSaveTimer, runPendingAction]);

  const saveAndRunPendingAction = useCallback(async () => {
    const didSaveLatest = await savePage("manual");
    if (didSaveLatest) runPendingAction();
  }, [runPendingAction, savePage]);

  const openCreateDialog = useCallback(() => {
    setCreatePageError(null);
    setShowCreateDialog(true);
  }, []);

  const createPage = useCallback(async (request: CreatePageRequest) => {
    setIsCreatingPage(true);
    setCreatePageError(null);
    try {
      const response = await fetch("/api/puck", {
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
          ...getLocalEditorAccessHeaders(),
        },
        method: "PUT",
      });
      const payload = (await response.json()) as PuckApiPayload;
      if (!response.ok || payload.error || !payload.slug) {
        const errorCode = payload.error?.code;
        if (response.status === 409 || errorCode === "CONTENT_ALREADY_EXISTS") {
          throw new Error("该路径已经存在页面，请换一个路径。");
        }
        if (response.status === 404 || errorCode === "CONTENT_NOT_FOUND") {
          throw new Error("要复制的来源页面不存在。");
        }
        if (response.status === 422 || errorCode === "INVALID_CONTENT") {
          throw new Error("页面内容校验失败，无法创建副本。");
        }
        throw new Error(payload.error?.message || `创建失败（HTTP ${response.status}）。`);
      }
      setShowCreateDialog(false);
      navigateToPublicPath(toPublicPathFromSlugKey(payload.slug));
    } catch (error) {
      setCreatePageError(getUnexpectedSaveErrorMessage(error));
    } finally {
      setIsCreatingPage(false);
    }
  }, [navigateToPublicPath]);

  const uiProp = useMemo(() => ({
    componentList: Object.fromEntries(
      Object.entries(config.categories ?? {}).map(([key, category]) => [
        key,
        {
          components: category.components,
          expanded: true,
          title: category.title,
          visible: category.visible,
        },
      ]),
    ),
    leftSideBarVisible: false,
    previewMode: "edit" as const,
    rightSideBarVisible: false,
    viewports: {
      controlsVisible: false,
      current: {
        height: DEFAULT_PREVIEW_VIEWPORT.height,
        width: DEFAULT_PREVIEW_VIEWPORT.width,
      },
      options: PUCK_PREVIEW_VIEWPORTS,
    },
  }), []);

  const overrides = useMemo(() => ({
    componentOverlay: EditorComponentOverlay,
    drawerItem: EditorDrawerItem,
    fields: EditorFields,
    fieldLabel: EditorFieldLabel,
    fieldTypes: EDITOR_FIELD_TYPE_OVERRIDES,
    iframe: ({
      children,
      document: frameDocument,
    }: {
      children: ReactNode;
      document?: Document;
    }) => (
      <EditorIframeWrapper
        componentDesignDocument={componentDesignDocument}
        document={frameDocument}
        onSaveShortcut={handleSaveShortcut}
      >
        {children}
      </EditorIframeWrapper>
    ),
  }), [componentDesignDocument, handleSaveShortcut]);

  const currentPageSummary = pageSummaries.find((page) => page.slug === initialSlug);

  return (
    <main className={styles.adminShell} data-admin-shell="true">
      {loadState === "loading" ? (
        <div className={styles.loadingState}>
          <span>正在连接编辑器</span>
          <i />
        </div>
      ) : loadState === "error" ? (
        <div className={styles.loadError} role="alert">
          <strong>页面内容加载失败</strong>
          <button onClick={() => router.refresh()} type="button">重新加载</button>
        </div>
      ) : (
        <Puck
          config={editorConfig}
          data={data}
          iframe={EDITOR_IFRAME_PROP}
          key={`${initialSlug}:${editorInstanceRevision}`}
          onChange={(nextData) => {
            currentDataRef.current = nextData;
            dataRevisionRef.current += 1;
            hasUnsavedChangesRef.current = true;
            setSaveState((current) => current === "saving" ? current : "dirty");
            scheduleAutoSave();
          }}
          onPublish={(nextData) => {
            void savePage("manual", nextData);
          }}
          overrides={overrides}
          ui={uiProp}
          viewports={PUCK_PREVIEW_VIEWPORTS}
        >
          <EditorWorkspace
            componentDesignDocument={componentDesignDocument}
            errorMessage={saveErrorMessage}
            fontLabSyncState={fontLabSyncState}
            isSwitchingPage={isSwitchingPage}
            lastSavedAt={lastSavedAt}
            leftCollapsed={leftCollapsed}
            leftTab={leftTab}
            onCreatePage={() => requestProtectedAction(openCreateDialog)}
            onLeftCollapsedChange={setLeftCollapsed}
            onLeftTabChange={setLeftTab}
            onOpenPublicPage={() => openDetachedWindow(publicPath)}
            onRetryPageList={() => setPageListRequestRevision((current) => current + 1)}
            onRightCollapsedChange={setRightCollapsed}
            onSave={() => void savePage("manual")}
            onSelectPage={(path) => requestProtectedAction(() => navigateToPublicPath(path))}
            pageListState={pageListState}
            pageSummaries={pageSummaries}
            previewSamples={previewSamples}
            rightCollapsed={rightCollapsed}
            saveState={saveState}
            selectedPath={publicPath}
          />
        </Puck>
      )}

      {showUnsavedDialog && (
        <UnsavedChangesDialog
          isSaving={saveState === "saving"}
          onCancel={() => {
            pendingActionRef.current = null;
            setShowUnsavedDialog(false);
          }}
          onDiscard={discardCurrentChanges}
          onSaveAndContinue={() => void saveAndRunPendingAction()}
        />
      )}
      {showCreateDialog && (
        <CreatePageDialog
          errorMessage={createPageError}
          isCreating={isCreatingPage}
          onClose={() => {
            if (!isCreatingPage) setShowCreateDialog(false);
          }}
          onSubmit={(request) => void createPage(request)}
          sourceSlug={initialSlug}
        />
      )}
      {showEditorTokenDialog && (
        <LocalEditorTokenDialog
          errorMessage={saveErrorMessage}
          onClose={() => setShowEditorTokenDialog(false)}
          onSubmit={saveEditorTokenAndRetry}
        />
      )}
      {saveState === "error" && saveErrorMessage && (
        <div className={styles.persistentSaveError} role="alert">
          <span>
            <strong>保存失败</strong>
            {saveErrorMessage}
          </span>
          <button
            onClick={() => {
              if (editorTokenRequired) {
                setShowEditorTokenDialog(true);
                return;
              }
              void savePage("manual");
            }}
            type="button"
          >
            {editorTokenRequired ? "设置 Token" : "立即重试"}
          </button>
        </div>
      )}
      <span className={styles.visuallyHidden} aria-live="polite">
        {saveTrigger === "auto" && saveState === "saved" ? "自动保存完成" : ""}
        {currentPageSummary?.title}
      </span>
    </main>
  );
}
