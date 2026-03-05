"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Puck, type Data, type PuckAction, usePuck } from "@measured/puck";
import "@measured/puck/puck.css";

import config from "@/puck/config";
import CustomCursor from "@/components/layout/CustomCursor";

const previewStylesheetId = "puck-preview-stylesheet";

type IframeOverrideProps = {
  children: ReactNode;
  document?: Document;
};

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

function PuckIframeOverride({ children, document }: IframeOverrideProps) {
  const { appState } = usePuck();
  const isEditMode = appState.ui.previewMode !== "interactive";

  useEffect(() => {
    if (!document) {
      return;
    }

    const existing = document.getElementById(previewStylesheetId) as HTMLLinkElement | null;
    if (!existing) {
      const link = document.createElement("link");
      link.id = previewStylesheetId;
      link.rel = "stylesheet";
      link.href = "/puck-preview.css";
      document.head.appendChild(link);
    }

    const sourceClasses = window.document.body.className
      .split(/\s+/)
      .filter(Boolean)
      .filter((className) => className === "antialiased" || className.startsWith("__variable_"));
    document.body.className = sourceClasses.join(" ");
  }, [document]);

  return (
    <>
      {isEditMode && <CustomCursor isWithinIframe={true} targetDocument={document} />}
      {children}
    </>
  );
}

type PuckEditorClientProps = {
  initialSlug: string;
};

type HeaderActionsOverrideProps = {
  children: ReactNode;
};

function slugQueryValue(slugKey: string) {
  return slugKey === "index" ? "" : slugKey;
}

function toAdminPath(slugKey: string) {
  return slugKey === "index" ? "/admin" : `/admin/${slugKey}`;
}

function toPPath(slugKey: string) {
  return slugKey === "index" ? "/p/" : `/p/${slugKey}`;
}

function PreviewModeToggle() {
  const { appState, dispatch } = usePuck();
  const previewMode = appState.ui.previewMode;
  const isInteractive = previewMode === "interactive";

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-white/15 bg-[#0f1115] p-1"
      style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.45)" }}
    >
      <button
        type="button"
        onClick={() => dispatch({ type: "setUi", ui: { previewMode: "edit" } })}
        aria-pressed={!isInteractive}
        className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-mono font-semibold tracking-[0.12em] transition-all ${!isInteractive
          ? "bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
          : "text-white/45 hover:text-white/80"
          }`}
        title="Switch to Edit mode"
      >
        {!isInteractive ? "EDIT" : "EDIT"}
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: "setUi", ui: { previewMode: "interactive" } })}
        aria-pressed={isInteractive}
        className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-mono font-semibold tracking-[0.12em] transition-all ${isInteractive
          ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.38)]"
          : "text-white/45 hover:text-white/80"
          }`}
        title="Switch to Preview mode (same as Cmd+I)"
      >
        {isInteractive ? "PREVIEW" : "PREVIEW"}
      </button>
      <span className="px-1 text-[10px] font-mono text-white/35">⌘I</span>
    </div>
  );
}

function HeaderActionsWithModeToggle({ children }: HeaderActionsOverrideProps) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <PreviewModeToggle />
    </div>
  );
}

export default function PuckEditorClient({ initialSlug }: PuckEditorClientProps) {
  const [data, setData] = useState<Data>(initialData);
  const [pageSlugs, setPageSlugs] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("loading"); // Fix: Start in loading state
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const slugValue = slugQueryValue(initialSlug);
  const headerPath = slugValue ? `/p/${slugValue}` : "/p/";
  const availablePages = useMemo(() => {
    const merged = new Set<string>(["index", ...pageSlugs, initialSlug]);
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [pageSlugs, initialSlug]);

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

  const overrides = useMemo(
    () => ({
      iframe: PuckIframeOverride,
      headerActions: HeaderActionsWithModeToggle,
    }),
    [],
  );

  async function handlePublish(nextData: Data) {
    setPublishState("publishing");

    try {
      const response = await fetch("/api/puck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: nextData,
          slug: slugQueryValue(initialSlug),
        }),
      });

      const payload = (await response.json()) as PuckApiPayload;
      if (!response.ok || payload.error) {
        setPublishState("error");
        return;
      }

      setPublishState("published");

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
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 text-xs text-white/70 md:px-8 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-mono tracking-[0.15em] uppercase text-white/50 select-none mr-1">/PAGE:</span>
          <div className="flex items-center rounded-sm border border-white/20 bg-[#0a0a0a] px-2">
            <select
              value={initialSlug}
              onChange={(event) => {
                window.location.href = toAdminPath(event.currentTarget.value);
              }}
              className="min-w-[180px] bg-transparent py-1.5 text-xs font-mono tracking-wider text-white outline-none"
              aria-label="Select page to edit"
            >
              {availablePages.map((slug) => (
                <option key={slug} value={slug} className="bg-black text-white">
                  {toPPath(slug)}
                </option>
              ))}
            </select>
          </div>
          <div className="h-4 w-px bg-white/20 mx-2" />

          <div className="flex items-center space-x-0 bg-[#0a0a0a] border border-white/20 rounded-sm focus-within:border-white/60 transition-colors">
            <span className="px-2 text-white/40 font-mono text-xs">/p/</span>
            <input
              type="text"
              id="puck-route-input"
              className="bg-transparent text-white outline-none font-mono tracking-wider w-32 placeholder-white/30 text-xs py-1.5 focus:bg-[#1a1a1a]"
              placeholder="new-path..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim().replace(/^\/+/, '');
                  if (val) {
                    window.location.href = toAdminPath(val);
                  }
                }
              }}
            />
            <button
              className="text-white/70 hover:text-white bg-white/5 hover:bg-white/20 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors h-full border-l border-white/10"
              onClick={() => {
                const input = document.getElementById("puck-route-input") as HTMLInputElement;
                const val = input?.value.trim().replace(/^\/+/, '') || '';
                if (val) {
                  window.location.href = toAdminPath(val);
                }
              }}
            >
              CREATE
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`font-mono tracking-[0.15em] uppercase ${loadState === "loading" ? "animate-pulse text-blue-400" : ""}`}>
            Load: {loadState}
          </span>
          <span className="ml-4 font-mono tracking-[0.15em] uppercase">
            Publish: {publishState}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        <style dangerouslySetInnerHTML={{
          __html: `
          #puck, [data-puck-editor="true"] { 
            height: 100% !important; 
            max-height: 100% !important; 
          }
        `}} />
        {loadState === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <span className="font-mono tracking-[0.3em] text-white/40 uppercase mb-4 text-xs">Connecting to engine...</span>
            <div className="w-12 h-[1px] bg-white/20 overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full w-1/3 bg-white animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
          </div>
        ) : (
          <Puck
            key={initialSlug}
            config={config}
            data={data}
            headerTitle="Puck Local Editor"
            headerPath={headerPath}
            iframe={{ enabled: true, waitForStyles: true }}
            onChange={setData}
            onPublish={handlePublish}
            overrides={overrides}
          />
        )}
      </div>
    </main>
  );
}
