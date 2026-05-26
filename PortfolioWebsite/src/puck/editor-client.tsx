"use client";

import { type ComponentProps, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";

import ComponentDesignProvider, { useComponentDesignDocument } from "@/components/layout/ComponentDesignProvider";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PUCK_PREVIEW_VIEWPORTS,
} from "@/lib/preview-viewports";
import config from "@/puck/config";
import { normalizeEditorPathInputToSlugKey, toAdminPathFromSlugKey, toPublicPathFromSlugKey } from "@/lib/public-paths";
import { ChineseTextInputField } from "@/puck/fields/ChineseTextField";
import { EditorHeaderChrome, HeaderActionsWithOpenPage } from "@/puck/editor/editor-header-chrome";
import { useFontLabEditorSync } from "@/puck/editor/font-lab-preview-sync";
import IframePreviewChrome from "@/puck/editor/iframe-preview-chrome";
import type { FontLabSyncState } from "@/puck/editor/types";
import editorEmptyStateData from "../../content/component-design/editor-empty-state.json";
import styles from "./editor-shell.module.css";

type PuckApiPayload = {
  data?: Data;
  slugs?: string[];
  error?: {
    code: string;
    message: string;
  };
};

const initialData = editorEmptyStateData as Data;

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

export default function PuckEditorClient({ initialSlug }: PuckEditorClientProps) {
  const componentDesignDocument = useComponentDesignDocument();
  const router = useRouter();
  const [data, setData] = useState<Data>(initialData);
  const [pageSlugs, setPageSlugs] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("loading");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const [selectedPagePath, setSelectedPagePath] = useState("/");
  const [isSwitchingPage, startPageSwitchTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fontLabSyncState, setFontLabSyncState] = useState<FontLabSyncState>("idle");
  const currentDataRef = useRef<Data>(initialData);
  const hasUnsavedChangesRef = useRef(false);
  const prefetchedSlugsRef = useRef<Set<string>>(new Set());
  const slugValue = slugQueryValue(initialSlug);
  const headerPath = slugValue ? `/${slugValue}` : "/";
  const publicPath = toPublicPathFromSlugKey(initialSlug);
  const availablePages = useMemo(() => {
    const merged = new Set<string>(["index", ...pageSlugs, initialSlug]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [pageSlugs, initialSlug]);
  const availablePublicPaths = useMemo(() => availablePages.map((slug) => toPublicPathFromSlugKey(slug)), [availablePages]);

  useEffect(() => {
    setSelectedPagePath(headerPath);
  }, [headerPath]);

  const currentAdminPath = toAdminPathFromSlugKey(initialSlug);

  const openAdminPath = useCallback((rawValue: string) => {
    const slugKey = normalizeEditorPathInputToSlugKey(rawValue);
    if (!slugKey) {
      return;
    }

    const nextAdminPath = toAdminPathFromSlugKey(slugKey);
    if (nextAdminPath === currentAdminPath) {
      return;
    }

    currentDataRef.current = initialData;
    setData(initialData);
    setLoadState("loading");
    setPublishState("idle");

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
          setData(initialData);
          setLoadState("idle");
          return;
        }

        const payload = (await response.json()) as PuckApiPayload;
        if (!response.ok || !payload.data) {
          setLoadState("error");
          return;
        }

        currentDataRef.current = payload.data;
        setData(payload.data);
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
  ]);

  async function handlePublish(nextData?: Data) {
    const publishPayload = nextData ?? currentDataRef.current;
    setPublishState("publishing");
    currentDataRef.current = publishPayload;

    try {
      const response = await fetch("/api/puck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: publishPayload,
          slug: slugQueryValue(initialSlug),
        }),
      });

      const payload = (await response.json()) as PuckApiPayload;
      if (!response.ok || payload.error) {
        setPublishState("error");
        return;
      }

      setPublishState("published");
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChanges(false);
      if (Array.isArray(payload.slugs)) {
        setPageSlugs(payload.slugs);
      }
    } catch {
      setPublishState("error");
    }
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
            config={config}
            data={data}
            headerTitle="Puck Local Editor"
            headerPath={headerPath}
            iframe={EDITOR_IFRAME_PROP}
            ui={uiProp}
            viewports={PUCK_PREVIEW_VIEWPORTS}
            onChange={(nextData) => {
              currentDataRef.current = nextData;
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
      </div>
    </main>
  );
}
