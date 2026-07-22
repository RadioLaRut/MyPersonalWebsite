"use client";

import { type ComponentProps, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useRouter } from "next/navigation";

import ComponentDesignProvider, { useComponentDesignDocument } from "@/components/layout/ComponentDesignProvider";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PUCK_PREVIEW_VIEWPORTS,
} from "@/lib/preview-viewports";
import { getLocalEditorAccessHeaders } from "@/lib/local-editor-access";
import config from "@/puck/config";
import { createDesignAwareEditorConfig } from "@/puck/editor/design-aware-config";
import { normalizeEditorPathInputToSlugKey, toAdminPathFromSlugKey, toPublicPathFromSlugKey } from "@/lib/public-paths";
import { ChineseTextInputField } from "@/puck/fields/ChineseTextField";
import { EditorHeaderChrome, HeaderActionsWithOpenPage } from "@/puck/editor/editor-header-chrome";
import { useFontLabEditorSync } from "@/puck/editor/font-lab-preview-sync";
import {
  AUTO_SAVE_INTERVAL_MS,
  getApiSaveErrorMessage,
  getSaveStatusNotice,
  getUnexpectedSaveErrorMessage,
  type PublishState,
  type SaveTrigger,
} from "@/puck/editor/save-status";
import IframePreviewChrome from "@/puck/editor/iframe-preview-chrome";
import type { FontLabSyncState } from "@/puck/editor/types";
import editorEmptyStateData from "../../content/component-design/editor-empty-state.json";
import styles from "./editor-shell.module.css";

type PuckApiPayload = {
  data?: Data;
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

type SaveStatusNoticeProps = {
  errorMessage: string | null;
  hasUnsavedChanges: boolean;
  publishState: PublishState;
  saveTrigger: SaveTrigger;
};

const initialData = editorEmptyStateData as Data;
const editorConfig = createDesignAwareEditorConfig(config);

type PuckEditorClientProps = {
  initialSlug: string;
};

type HeaderOverrideProps = {
  children: ReactNode;
};

type SidebarTextFieldProps = {
  children?: ReactNode;
} & ComponentProps<typeof ChineseTextInputField>;

type EditorIframeWrapperProps = {
  children: ReactNode;
  componentDesignDocument: ComponentProps<typeof ComponentDesignProvider>["initialDocument"];
  document?: Document;
};

const EDITOR_IFRAME_PROP = { enabled: true, waitForStyles: true } as const;

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
      value={typeof props.value === "string" ? props.value : ""}
      multiline
    />
  ),
};

function EditorIframeWrapper({
  children,
  componentDesignDocument,
  document: frameDocument,
}: EditorIframeWrapperProps) {
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

function SaveStatusNotice({
  errorMessage,
  hasUnsavedChanges,
  publishState,
  saveTrigger,
}: SaveStatusNoticeProps) {
  const notice = getSaveStatusNotice({
    errorMessage,
    hasUnsavedChanges,
    publishState,
    saveTrigger,
  });

  if (!notice) {
    return null;
  }

  const { detail, title, tone } = notice;

  return (
    <div
      aria-atomic="true"
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={styles.saveStatusNotice}
      data-save-state={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <span aria-hidden="true" className={styles.saveStatusIndicator} />
      <span className={styles.saveStatusCopy}>
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>
    </div>
  );
}

export default function PuckEditorClient({ initialSlug }: PuckEditorClientProps) {
  const componentDesignDocument = useComponentDesignDocument();
  const router = useRouter();
  const slugValue = slugQueryValue(initialSlug);
  const headerPath = slugValue ? `/${slugValue}` : "/";
  const [data, setData] = useState<Data>(initialData);
  const [pageSlugs, setPageSlugs] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("loading");
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [saveTrigger, setSaveTrigger] = useState<SaveTrigger>("manual");
  const [publishErrorMessage, setPublishErrorMessage] = useState<string | null>(null);
  const [selectedPageState, setSelectedPageState] = useState(() => ({
    path: headerPath,
    slug: initialSlug,
  }));
  const selectedPagePath = selectedPageState.slug === initialSlug
    ? selectedPageState.path
    : headerPath;
  const setSelectedPagePath = useCallback((path: string) => {
    setSelectedPageState({ path, slug: initialSlug });
  }, [initialSlug]);
  const [isSwitchingPage, startPageSwitchTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fontLabSyncState, setFontLabSyncState] = useState<FontLabSyncState>("idle");
  const currentDataRef = useRef<Data>(initialData);
  const hasUnsavedChangesRef = useRef(false);
  const dataRevisionRef = useRef(0);
  const activeSlugRef = useRef(initialSlug);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const queuedAutoSaveKeyRef = useRef<string | null>(null);
  const prefetchedSlugsRef = useRef<Set<string>>(new Set());
  const publicPath = toPublicPathFromSlugKey(initialSlug);
  const availablePages = useMemo(() => {
    const merged = new Set<string>(["index", ...pageSlugs, initialSlug]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [pageSlugs, initialSlug]);
  const availablePublicPaths = useMemo(() => availablePages.map((slug) => toPublicPathFromSlugKey(slug)), [availablePages]);

  const currentAdminPath = toAdminPathFromSlugKey(initialSlug);

  useEffect(() => {
    activeSlugRef.current = initialSlug;
  }, [initialSlug]);

  const openAdminPath = useCallback((rawValue: string) => {
    const slugKey = normalizeEditorPathInputToSlugKey(rawValue);
    if (!slugKey) {
      return;
    }

    const nextAdminPath = toAdminPathFromSlugKey(slugKey);
    if (nextAdminPath === currentAdminPath) {
      return;
    }

    setLoadState("loading");
    setPublishState("idle");
    setPublishErrorMessage(null);

    startPageSwitchTransition(() => {
      router.replace(nextAdminPath);
    });
  }, [currentAdminPath, router]);

  const openPublicPage = useCallback(() => {
    window.open(publicPath, "_blank");
  }, [publicPath]);

  useFontLabEditorSync(setFontLabSyncState);

  useEffect(() => {
    for (const slug of availablePages) {
      if (prefetchedSlugsRef.current.has(slug)) {
        continue;
      }

      router.prefetch(toAdminPathFromSlugKey(slug));
      prefetchedSlugsRef.current.add(slug);
    }
  }, [availablePages, router]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPageSlugs() {
      try {
        const response = await fetch("/api/puck?list=1", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!isMounted) {
          return;
        }
        const payload = (await response.json()) as PuckApiPayload;
        if (response.ok && Array.isArray(payload.slugs)) {
          setPageSlugs(payload.slugs);
        }
      } catch {}
    }

    loadPageSlugs();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialSlug]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoadState("loading");

      try {
        const query = new URLSearchParams();
        query.set("slug", slugQueryValue(initialSlug));

        const response = await fetch(`/api/puck?${query.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        if (response.status === 404) {
          currentDataRef.current = initialData;
          dataRevisionRef.current = 0;
          hasUnsavedChangesRef.current = false;
          setData(initialData);
          setHasUnsavedChanges(false);
          setPublishState("idle");
          setPublishErrorMessage(null);
          setLoadState("idle");
          return;
        }

        const payload = (await response.json()) as PuckApiPayload;
        if (!response.ok || !payload.data) {
          setLoadState("error");
          return;
        }

        currentDataRef.current = payload.data;
        dataRevisionRef.current = 0;
        hasUnsavedChangesRef.current = false;
        setData(payload.data);
        setHasUnsavedChanges(false);
        setPublishState("idle");
        setPublishErrorMessage(null);
        setLoadState("idle");
      } catch {
        if (isMounted) {
          setLoadState("error");
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialSlug]);

  const savePage = useCallback((trigger: SaveTrigger, nextData?: Data) => {
    const publishPayload = nextData ?? currentDataRef.current;
    const revision = dataRevisionRef.current;
    const requestSlug = initialSlug;
    const autoSaveKey = `${requestSlug}:${revision}`;

    currentDataRef.current = publishPayload;

    if (trigger === "auto") {
      if (!hasUnsavedChangesRef.current || queuedAutoSaveKeyRef.current === autoSaveKey) {
        return Promise.resolve();
      }
      queuedAutoSaveKeyRef.current = autoSaveKey;
    }

    const runSave = async () => {
      const isActivePage = () => activeSlugRef.current === requestSlug;

      if (isActivePage()) {
        setSaveTrigger(trigger);
        setPublishErrorMessage(null);
        setPublishState("publishing");
      }

      console.info("[puck-editor] save started", {
        revision,
        slug: requestSlug,
        trigger,
      });

      try {
        const response = await fetch("/api/puck", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getLocalEditorAccessHeaders(),
          },
          body: JSON.stringify({
            data: publishPayload,
            slug: slugQueryValue(requestSlug),
          }),
        });

        let payload: PuckApiPayload;
        try {
          payload = (await response.json()) as PuckApiPayload;
        } catch {
          throw new Error(`保存接口返回了无法读取的响应（HTTP ${response.status}）。`);
        }

        if (!response.ok || payload.error) {
          throw new Error(getApiSaveErrorMessage(payload, response.status));
        }

        const savedLatestRevision = isActivePage() && dataRevisionRef.current === revision;
        if (isActivePage()) {
          if (savedLatestRevision) {
            hasUnsavedChangesRef.current = false;
            setHasUnsavedChanges(false);
            setPublishState("published");
          } else {
            hasUnsavedChangesRef.current = true;
            setHasUnsavedChanges(true);
            setPublishState("published");
          }

          if (Array.isArray(payload.slugs)) {
            setPageSlugs(payload.slugs);
          }
        }

        console.info("[puck-editor] save completed", {
          hasNewerChanges: !savedLatestRevision,
          revision,
          slug: requestSlug,
          trigger,
        });
      } catch (error) {
        const message = getUnexpectedSaveErrorMessage(error);

        console.error("[puck-editor] save failed", {
          error: message,
          revision,
          slug: requestSlug,
          trigger,
        });

        if (isActivePage()) {
          hasUnsavedChangesRef.current = true;
          setHasUnsavedChanges(true);
          setPublishErrorMessage(message);
          setPublishState("error");
        }
      } finally {
        if (trigger === "auto" && queuedAutoSaveKeyRef.current === autoSaveKey) {
          queuedAutoSaveKeyRef.current = null;
        }
      }
    };

    const queuedSave = saveQueueRef.current.then(runSave, runSave);
    saveQueueRef.current = queuedSave.catch(() => undefined);
    return queuedSave;
  }, [initialSlug]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (hasUnsavedChangesRef.current) {
        void savePage("auto");
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [savePage]);

  const uiProp = useMemo(() => ({
    viewports: {
      current: {
        height: DEFAULT_PREVIEW_VIEWPORT.height,
        width: DEFAULT_PREVIEW_VIEWPORT.width,
      },
      controlsVisible: true,
      options: PUCK_PREVIEW_VIEWPORTS,
    },
  }), []);

  const overrides = useMemo(() => ({
    header: (props: HeaderOverrideProps) => (
      <EditorHeaderChrome
        {...props}
        selectedPagePath={selectedPagePath}
        availablePublicPaths={availablePublicPaths}
        isSwitchingPage={isSwitchingPage}
        fontLabSyncState={fontLabSyncState}
        onSelectPagePath={(nextPath) => {
          setSelectedPagePath(nextPath);
          if (nextPath !== headerPath) {
            openAdminPath(nextPath);
          }
        }}
        onCreatePage={openAdminPath}
      />
    ),
    headerActions: (props: { children: ReactNode }) => (
      <HeaderActionsWithOpenPage
        {...props}
        onOpenPublicPage={openPublicPage}
      />
    ),
    iframe: ({ children, document: frameDocument }: { children: ReactNode; document?: Document }) => (
      <EditorIframeWrapper
        componentDesignDocument={componentDesignDocument}
        document={frameDocument}
      >
        {children}
      </EditorIframeWrapper>
    ),
    fieldTypes: EDITOR_FIELD_TYPE_OVERRIDES,
  }), [
    availablePublicPaths,
    componentDesignDocument,
    fontLabSyncState,
    headerPath,
    isSwitchingPage,
    openAdminPath,
    openPublicPage,
    selectedPagePath,
    setSelectedPagePath,
  ]);

  function handlePublish(nextData?: Data) {
    return savePage("manual", nextData);
  }

  return (
    <main
      data-admin-shell="true"
      className={`${styles.adminShell} h-[100dvh] max-h-[100dvh] w-screen bg-[#eef3f8] text-slate-900 flex flex-col overflow-hidden`}
    >
      <div className="h-full min-h-0 relative flex flex-col">
        {loadState === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#eef3f8]">
            <span className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Connecting to engine...</span>
            <div className="relative h-[1px] w-12 overflow-hidden bg-slate-300">
              <div className="absolute left-0 top-0 h-full w-1/3 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-slate-700"></div>
            </div>
          </div>
        ) : (
          <Puck
            key={initialSlug}
            config={editorConfig}
            data={data}
            headerTitle="Puck Local Editor"
            headerPath={headerPath}
            iframe={EDITOR_IFRAME_PROP}
            ui={uiProp}
            viewports={PUCK_PREVIEW_VIEWPORTS}
            onChange={(nextData) => {
              currentDataRef.current = nextData;
              dataRevisionRef.current += 1;
              if (!hasUnsavedChangesRef.current) {
                hasUnsavedChangesRef.current = true;
                setHasUnsavedChanges(true);
              }
              if (publishState === "published") {
                setPublishState("idle");
              }
            }}
            onPublish={handlePublish}
            overrides={overrides}
          />
        )}
        <SaveStatusNotice
          errorMessage={publishErrorMessage}
          hasUnsavedChanges={hasUnsavedChanges}
          publishState={publishState}
          saveTrigger={saveTrigger}
        />
      </div>
    </main>
  );
}
