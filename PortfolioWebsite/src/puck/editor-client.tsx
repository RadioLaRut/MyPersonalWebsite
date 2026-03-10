"use client";

import { type ComponentProps, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";

import config from "@/puck/config";
import { toAdminPathFromSlugKey, toPublicPathFromSlugKey } from "@/lib/public-paths";
import { ChineseTextInputField } from "@/puck/fields/ChineseTextField";
import styles from "./editor-shell.module.css";

type PuckApiPayload = {
  data?: Data;
  slugs?: string[];
  error?: {
    code: string;
    message: string;
  };
};

const initialData: Data = {
  root: {
    props: {
      title: "Puck Local Editor",
    },
  },
  content: [
    {
      type: "HeroHeadline",
      props: {
        id: "HeroHeadline-123",
        eyebrow: "Portfolio",
        title: "Local Puck Editor",
        subtitle: "Phase 3 is active with disk persistence.",
      },
    },
    {
      type: "RichParagraph",
      props: {
        id: "RichParagraph-456",
        content: "Publish writes JSON to content/pages using tmp -> rename atomic persistence.",
      },
    },
  ],
};

type PuckEditorClientProps = {
  initialSlug: string;
};

type HeaderActionsOverrideProps = {
  children: ReactNode;
};

type HeaderOverrideProps = {
  children: ReactNode;
  actions?: ReactNode;
};

type SidebarTextFieldProps = {
  children?: ReactNode;
} & ComponentProps<typeof ChineseTextInputField>;

function IframePreviewChrome({
  children,
  document: frameDocument,
}: {
  children: ReactNode;
  document?: Document;
}) {
  useEffect(() => {
    if (!frameDocument) {
      return;
    }

    const htmlElement = frameDocument.documentElement;
    const bodyElement = frameDocument.body;
    const previousHtmlOverflow = htmlElement.style.overflow;
    const previousHtmlHeight = htmlElement.style.height;
    const previousHtmlOverscrollBehavior = htmlElement.style.overscrollBehavior;
    const previousBodyOverflow = bodyElement.style.overflow;
    const previousBodyHeight = bodyElement.style.height;
    const previousBodyOverscrollBehavior = bodyElement.style.overscrollBehavior;
    const previousAdminMode = htmlElement.getAttribute("data-admin-mode");
    const previousAdminRoot = htmlElement.getAttribute("data-admin-root");

    htmlElement.setAttribute("data-admin-mode", "true");
    htmlElement.removeAttribute("data-admin-root");
    htmlElement.style.overflow = "";
    htmlElement.style.height = "";
    htmlElement.style.overscrollBehavior = "";
    bodyElement.style.overflow = "";
    bodyElement.style.height = "";
    bodyElement.style.overscrollBehavior = "";

    return () => {
      if (previousAdminMode === null) {
        htmlElement.removeAttribute("data-admin-mode");
      } else {
        htmlElement.setAttribute("data-admin-mode", previousAdminMode);
      }

      if (previousAdminRoot === null) {
        htmlElement.removeAttribute("data-admin-root");
      } else {
        htmlElement.setAttribute("data-admin-root", previousAdminRoot);
      }

      htmlElement.style.overflow = previousHtmlOverflow;
      htmlElement.style.height = previousHtmlHeight;
      htmlElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      bodyElement.style.overflow = previousBodyOverflow;
      bodyElement.style.height = previousBodyHeight;
      bodyElement.style.overscrollBehavior = previousBodyOverscrollBehavior;
    };
  }, [frameDocument]);

  return <>{children}</>;
}

function slugQueryValue(slugKey: string) {
  return slugKey === "index" ? "" : slugKey;
}

function toAdminPath(slugKey: string) {
  return toAdminPathFromSlugKey(slugKey);
}

function toPublicPath(slugKey: string) {
  return toPublicPathFromSlugKey(slugKey);
}

function toSlugKeyFromPathInput(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed || trimmed === "/") {
    return "index";
  }

  let normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  normalized = normalized.replace(/\/+/g, "/");

  if (normalized === "/p" || normalized === "/p/") {
    return "index";
  }

  if (normalized.startsWith("/p/")) {
    normalized = normalized.slice(2);
  }

  if (normalized === "/admin" || normalized === "/admin/") {
    return "index";
  }

  if (normalized.startsWith("/admin/")) {
    normalized = normalized.slice("/admin".length);
  }

  const withoutSlashes = normalized.replace(/^\/+|\/+$/g, "");
  if (!withoutSlashes) {
    return "index";
  }

  return withoutSlashes
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment).trim().toLowerCase();
      } catch {
        return segment.trim().toLowerCase();
      }
    })
    .join("/");
}

function PreviewEffectsToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-md border px-3 py-1.5 text-[10px] font-mono font-semibold tracking-[0.16em] transition-colors ${enabled
        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
        : "border-white/10 bg-transparent text-textMuted hover:text-textPrimary"
        }`}
      title="Toggle preview effects and custom cursor"
    >
      {enabled ? "EFFECTS ON" : "EFFECTS OFF"}
    </button>
  );
}

function HeaderActionsWithModeToggle({
  children,
  previewEffectsEnabled,
  onTogglePreviewEffects,
  onOpenPublicPage,
}: HeaderActionsOverrideProps & {
  previewEffectsEnabled: boolean;
  onTogglePreviewEffects: () => void;
  onOpenPublicPage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {children}
      <button
        type="button"
        onClick={onOpenPublicPage}
        className="rounded-sm border border-slate-200 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950"
      >
        OPEN PAGE
      </button>
      <PreviewEffectsToggle enabled={previewEffectsEnabled} onToggle={onTogglePreviewEffects} />
    </div>
  );
}

type TreeNode = {
  path: string;
  name: string;
  children: TreeNode[];
  isExactMatch: boolean;
};

function buildTree(paths: string[]) {
  const root: TreeNode = { path: "/", name: "Root (/)", children: [], isExactMatch: paths.includes("/") };
  const sorted = [...paths].filter(p => p !== "/").sort((a, b) => a.localeCompare(b));

  for (const p of sorted) {
    const segments = p.split("/").filter(Boolean);
    let current = root;
    let currentPath = "";

    for (const segment of segments) {
      currentPath += "/" + segment;
      let child = current.children.find(c => c.name === segment);
      if (!child) {
        child = { path: currentPath, name: segment, children: [], isExactMatch: false };
        current.children.push(child);
      }
      current = child;
    }
    current.isExactMatch = true;
  }
  return root;
}

function TreeRender({ node, level, selected, onSelect }: { node: TreeNode, level: number, selected: string, onSelect: (p: string) => void }) {
  return (
    <div className="flex flex-col">
      {node.isExactMatch && (
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          style={{ paddingLeft: `${level === 0 ? 1 : level * 1.5 + 1}rem` }}
          className={`flex w-full items-center pr-4 py-2 text-xs font-mono tracking-[0.05em] text-left transition-colors hover:bg-slate-50 ${node.path === selected ? 'text-black font-semibold bg-slate-50 relative' : 'text-slate-600'}`}
        >
          {node.path === selected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800" />}
          {level > 0 && <span className="mr-2 text-slate-300">└─</span>}
          {node.name}
        </button>
      )}
      {!node.isExactMatch && level > 0 && (
        <div style={{ paddingLeft: `${level * 1.5 + 1}rem` }} className="flex w-full items-center pr-4 py-2 text-xs font-mono tracking-[0.05em] text-left text-slate-400">
          <span className="mr-2 text-slate-200">└─</span> {node.name}
        </div>
      )}
      {node.children.map(child => (
        <TreeRender key={child.path} node={child} level={level + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

function CustomPageSelector({
  paths,
  selected,
  onSelect,
  disabled
}: {
  paths: string[];
  selected: string;
  onSelect: (path: string) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tree = useMemo(() => buildTree(paths), [paths]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative min-w-[260px]" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        className={`flex w-full items-center justify-between bg-transparent px-3 py-2 text-xs font-mono tracking-[0.14em] outline-none transition-colors ${disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:text-slate-900'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch page"
      >
        <span>{selected}</span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 flex w-full min-w-[320px] max-h-[60vh] flex-col overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl py-2">
          <TreeRender node={tree} level={0} selected={selected} onSelect={(p) => { onSelect(p); setIsOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function EditorHeaderChrome({
  children,
  selectedPagePath,
  availablePublicPaths,
  newPageInputValue,
  isSwitchingPage,
  onSelectPagePath,
  onNewPageInputValueChange,
  onCreatePage,
}: HeaderOverrideProps & {
  selectedPagePath: string;
  availablePublicPaths: string[];
  newPageInputValue: string;
  isSwitchingPage: boolean;
  onSelectPagePath: (nextPath: string) => void;
  onNewPageInputValueChange: (value: string) => void;
  onCreatePage: () => void;
}) {
  return (
    <div className="editor-header-shell">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-[#fbfcfe] px-4 py-3 text-xs text-slate-600 md:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-sm border border-slate-200 bg-white transition-colors focus-within:border-slate-400">
            <div className="border-r border-slate-200 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
              当前页面
            </div>
            <CustomPageSelector
              paths={availablePublicPaths}
              selected={selectedPagePath}
              onSelect={onSelectPagePath}
              disabled={isSwitchingPage}
            />
          </div>

          <div className="flex items-center rounded-sm border border-slate-200 bg-white focus-within:border-slate-400 transition-colors">
            <input
              value={newPageInputValue}
              onChange={(event) => onNewPageInputValueChange(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onCreatePage();
                }
              }}
              disabled={isSwitchingPage}
              className="min-w-[220px] bg-transparent px-3 py-2 text-xs font-mono tracking-[0.14em] text-slate-700 outline-none placeholder-slate-300"
              placeholder="/new-page"
              aria-label="Create page"
            />
            <button
              type="button"
              disabled={isSwitchingPage}
              className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.24em] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              onClick={onCreatePage}
            >
              CREATE
            </button>
          </div>
        </div>


      </div>

      {children}
    </div>
  );
}

export default function PuckEditorClient({ initialSlug }: PuckEditorClientProps) {
  const router = useRouter();
  const [data, setData] = useState<Data>(initialData);
  const [pageSlugs, setPageSlugs] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("loading");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const [selectedPagePath, setSelectedPagePath] = useState("/");
  const [newPageInputValue, setNewPageInputValue] = useState("");
  const [previewEffectsEnabled, setPreviewEffectsEnabled] = useState(true);
  const [isSwitchingPage, startPageSwitchTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const currentDataRef = useRef<Data>(initialData);
  const slugValue = slugQueryValue(initialSlug);
  const headerPath = slugValue ? `/${slugValue}` : "/";
  const publicPath = toPublicPath(initialSlug);
  const availablePages = useMemo(() => {
    const merged = new Set<string>(["index", ...pageSlugs, initialSlug]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [pageSlugs, initialSlug]);
  const availablePublicPaths = useMemo(() => availablePages.map((slug) => toPublicPath(slug)), [availablePages]);

  useEffect(() => {
    setSelectedPagePath(headerPath);
    setNewPageInputValue("");
  }, [headerPath]);

  const currentAdminPath = toAdminPath(initialSlug);

  const openAdminPath = useCallback((rawValue: string) => {
    const slugKey = toSlugKeyFromPathInput(rawValue);
    const nextAdminPath = toAdminPath(slugKey);
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

  useEffect(() => {
    for (const slug of availablePages) {
      router.prefetch(toAdminPath(slug));
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
      } catch {
        // keep editor usable even when slug list fetch fails
      }
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

        // Auto-inject missing structural IDs to prevent core layer panel crashes with old hardcoded JS
        const migratedData = { ...payload.data };
        if (Array.isArray(migratedData.content)) {
          migratedData.content = migratedData.content.map(item => {
            if (!item.props) item.props = {};
            if (!item.props.id) {
              item.props.id = `${item.type}-${Math.random().toString(36).substring(2, 9)}`;
            }
            return item;
          });
        }

        currentDataRef.current = migratedData;
        setData(migratedData);
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

  const overrides = {
    header: (props: HeaderOverrideProps) => (
      <EditorHeaderChrome
        {...props}
        selectedPagePath={selectedPagePath}
        availablePublicPaths={availablePublicPaths}
        newPageInputValue={newPageInputValue}
        isSwitchingPage={isSwitchingPage}
        onSelectPagePath={(nextPath) => {
          setSelectedPagePath(nextPath);
          if (nextPath !== headerPath) {
            openAdminPath(nextPath);
          }
        }}
        onNewPageInputValueChange={setNewPageInputValue}
        onCreatePage={() => openAdminPath(newPageInputValue)}
      />
    ),
    headerActions: (props: HeaderActionsOverrideProps) => (
      <HeaderActionsWithModeToggle
        {...props}
        previewEffectsEnabled={previewEffectsEnabled}
        onOpenPublicPage={openPublicPage}
        onTogglePreviewEffects={() => setPreviewEffectsEnabled((current) => !current)}
      />
    ),
    iframe: ({ children, document: frameDocument }: { children: ReactNode; document?: Document }) => (
      <IframePreviewChrome document={frameDocument}>{children}</IframePreviewChrome>
    ),
    fieldTypes: {
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
    },
  };

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
      setHasUnsavedChanges(false);

      try {
        const listResponse = await fetch("/api/puck?list=1", { cache: "no-store" });
        const listPayload = (await listResponse.json()) as PuckApiPayload;
        if (listResponse.ok && Array.isArray(listPayload.slugs)) {
          setPageSlugs(listPayload.slugs);
        }
      } catch {
        // noop
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
        <style dangerouslySetInnerHTML={{
          __html: `
          #puck, [data-puck-editor="true"] { 
            height: 100% !important; 
            max-height: 100% !important; 
          }
        `}} />
        {loadState === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#eef3f8]">
            <span className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Connecting to engine...</span>
            <div className="relative h-[1px] w-12 overflow-hidden bg-slate-300">
              <div className="absolute left-0 top-0 h-full w-1/3 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-slate-700"></div>
            </div>
          </div>
        ) : (
          <MotionConfig reducedMotion={previewEffectsEnabled ? "never" : "always"}>
            <Puck
              key={initialSlug}
              config={config}
              data={data}
              headerTitle="Puck Local Editor"
              headerPath={headerPath}
              iframe={{ enabled: true, waitForStyles: true }}
              viewports={[
                { width: 390, height: 844, icon: "Smartphone", label: "Mobile" },
                { width: 820, height: 1180, icon: "Tablet", label: "Tablet" },
                { width: 1280, height: 720, icon: "Monitor", label: "Desktop" },
              ]}
              onChange={(nextData) => {
                currentDataRef.current = nextData;
                setHasUnsavedChanges(true);
                if (publishState === "published") {
                  setPublishState("idle");
                }
              }}
              onPublish={handlePublish}
              overrides={overrides}
            />
          </MotionConfig>
        )}
      </div>
    </main>
  );
}
