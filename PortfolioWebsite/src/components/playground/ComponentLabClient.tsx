"use client";

import type { Data } from "@puckeditor/core";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import Typography from "@/components/common/Typography";
import {
  dispatchComponentDesignUpdated,
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import { MotionButton } from "@/components/motion";
import {
  COMPONENT_LAB_COMPONENT_KEYS,
  COMPONENT_LAB_REGISTRY,
  type ComponentLabFieldConfig,
} from "@/components/playground/component-lab-registry";
import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignComponentKey,
  type ComponentDesignDocument,
  type ComponentGridBounds,
  type ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";
import {
  areComponentDesignDocumentsEqual,
  reconcileComponentDesignDraftAfterSave,
} from "@/lib/component-design-commit";
import type {
  ComponentLabCatalogEntry,
  ComponentLabInstanceCatalog,
} from "@/lib/component-lab-presets";
import {
  COMPONENT_LAB_PREVIEW_READY_MESSAGE,
  COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
  isComponentLabPreviewHeightMessage,
  type ComponentLabPreviewRenderMessage,
} from "@/lib/component-lab-preview-messages";
import { getLocalEditorAccessHeaders } from "@/lib/local-editor-access";
import { DEFAULT_PREVIEW_VIEWPORT, PREVIEW_VIEWPORTS, type PreviewViewportKey } from "@/lib/preview-viewports";

type ComponentDesignApiPayload = {
  config?: ComponentDesignDocument;
  error?: { code: string; message: string };
  hasSaved?: boolean;
  path?: string;
};

function cloneDocument(document: ComponentDesignDocument) {
  return JSON.parse(JSON.stringify(document)) as ComponentDesignDocument;
}

function SmallText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Typography
      as="span"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="prose"
      className={className}
    >
      {children}
    </Typography>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <SmallText className="text-textMuted">{label}</SmallText>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-10 w-full border border-white/10 bg-black px-3 text-sm text-textPrimary outline-none transition-colors focus:border-white/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

const COLUMN_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  label: String(index + 1),
  value: String(index + 1),
}));

function BoundsRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: ComponentGridBounds) => void;
  value: ComponentGridBounds;
}) {
  return (
    <div className="grid gap-2 py-2">
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
        <SmallText className="text-textMuted">{label}</SmallText>
        <div className="grid grid-cols-12 gap-1" aria-label={`${label} 第 ${value.leftCol} 至 ${value.rightCol} 列`}>
          {Array.from({ length: 12 }, (_, index) => {
            const column = index + 1;
            const active = column >= value.leftCol && column <= value.rightCol;
            return (
              <span
                key={column}
                className={`h-3 ${active ? "bg-white/75" : "bg-white/10"}`}
              />
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pl-[5.25rem]">
        <SelectField
          label="起始列"
          value={String(value.leftCol)}
          options={COLUMN_OPTIONS}
          onChange={(next) => {
            const leftCol = Number(next);
            onChange({ leftCol, rightCol: Math.max(leftCol, value.rightCol) });
          }}
        />
        <SelectField
          label="结束列"
          value={String(value.rightCol)}
          options={COLUMN_OPTIONS.filter((option) => Number(option.value) >= value.leftCol)}
          onChange={(next) => {
            const rightCol = Number(next);
            onChange({ leftCol: Math.min(value.leftCol, rightCol), rightCol });
          }}
        />
      </div>
    </div>
  );
}

function BoundsField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: ComponentGridBounds) => void;
  value: ComponentGridBounds;
}) {
  return <BoundsRow label={label} onChange={onChange} value={value} />;
}

function ResponsiveBoundsField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: ComponentResponsiveGridBounds) => void;
  value: ComponentResponsiveGridBounds;
}) {
  return (
    <div className="divide-y divide-white/8">
      <SmallText className="mb-1 block text-textPrimary">{label}</SmallText>
      {([
        ["base", "移动"],
        ["md", "平板"],
        ["lg", "桌面"],
      ] as const).map(([breakpoint, breakpointLabel]) => (
        <BoundsRow
          key={breakpoint}
          label={breakpointLabel}
          value={value[breakpoint]}
          onChange={(next) => onChange({ ...value, [breakpoint]: next })}
        />
      ))}
    </div>
  );
}

function renderFieldControl(
  field: ComponentLabFieldConfig,
  document: ComponentDesignDocument,
  updateDocument: (updater: (next: ComponentDesignDocument) => void) => void,
) {
  if (field.type === "toggle") {
    return (
      <label className="grid min-h-10 grid-cols-[1fr_auto] items-center gap-4">
        <SmallText className="text-textPrimary">{field.label}</SmallText>
        <input
          type="checkbox"
          checked={field.getValue(document)}
          onChange={(event) => updateDocument((next) => field.setValue(next, event.target.checked))}
          className="h-4 w-4 accent-white"
        />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <SelectField
        label={field.label}
        value={field.getValue(document)}
        options={field.options}
        onChange={(value) => updateDocument((next) => field.setValue(next, value))}
      />
    );
  }
  if (field.type === "number-select") {
    return (
      <SelectField
        label={field.label}
        value={String(field.getValue(document))}
        options={field.options.map((option) => ({ label: option.label, value: String(option.value) }))}
        onChange={(value) => updateDocument((next) => field.setValue(next, Number(value)))}
      />
    );
  }
  if (field.type === "bounds") {
    return (
      <BoundsField
        label={field.label}
        value={field.getValue(document)}
        onChange={(value) => updateDocument((next) => field.setValue(next, value))}
      />
    );
  }
  return (
    <ResponsiveBoundsField
      label={field.label}
      value={field.getValue(document)}
      onChange={(value) => updateDocument((next) => field.setValue(next, value))}
    />
  );
}

function LabPreviewFrame({
  data,
  designDocument,
  height,
  onContentHeight,
  showGrid,
  viewportHeight,
  viewportWidth,
}: {
  data: Data;
  designDocument: ComponentDesignDocument;
  height: number;
  onContentHeight: (height: number) => void;
  showGrid: boolean;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const renderMessage = useMemo<ComponentLabPreviewRenderMessage>(() => ({
    data,
    designDocument,
    showGrid,
    type: COMPONENT_LAB_PREVIEW_RENDER_MESSAGE,
    viewportHeight,
  }), [data, designDocument, showGrid, viewportHeight]);
  const postRenderMessage = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      renderMessage,
      window.location.origin,
    );
  }, [renderMessage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) return;
      if (
        event.data &&
        typeof event.data === "object" &&
        "type" in event.data &&
        event.data.type === COMPONENT_LAB_PREVIEW_READY_MESSAGE
      ) {
        postRenderMessage();
      } else if (isComponentLabPreviewHeightMessage(event.data)) {
        onContentHeight(Math.max(viewportHeight, event.data.height));
      }
    };
    window.addEventListener("message", handleMessage);
    postRenderMessage();
    return () => window.removeEventListener("message", handleMessage);
  }, [onContentHeight, postRenderMessage, viewportHeight]);

  return (
    <div className="relative" style={{ height: `${height}px`, width: `${viewportWidth}px` }}>
      <iframe
        ref={iframeRef}
        title="ComponentLab 真实组件预览"
        src="/component-lab-preview"
        onLoad={postRenderMessage}
        className="relative z-10 block border-0 bg-black"
        style={{ height: `${height}px`, width: `${viewportWidth}px` }}
      />
    </div>
  );
}

function createPreviewData(entry: ComponentLabCatalogEntry, instanceId: string): Data {
  const instance = instanceId === entry.stressSample.id
    ? entry.stressSample
    : entry.instances.find((candidate) => candidate.id === instanceId);
  if (!instance) {
    throw new Error(`${entry.componentKey} 预览实例不存在：${instanceId}`);
  }

  return {
    content: [instance.node],
    root: { props: { description: "", image: "", noIndex: true, title: "ComponentLab" } },
    zones: {},
  } as Data;
}

function getInitialInstanceId(entry: ComponentLabCatalogEntry) {
  return entry.preferredInstanceId ?? entry.stressSample.id;
}

export default function ComponentLabClient({
  catalog,
}: {
  catalog: ComponentLabInstanceCatalog;
}) {
  const router = useRouter();
  const providerDocument = useComponentDesignDocument();
  const normalizedProviderDocument = useMemo(
    () => normalizeComponentDesignDocument(providerDocument),
    [providerDocument],
  );
  const [committedDocument, setCommittedDocument] = useState(normalizedProviderDocument);
  const [draftDocument, setDraftDocument] = useState(normalizedProviderDocument);
  const [externalUpdatePending, setExternalUpdatePending] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDesignComponentKey>(
    COMPONENT_LAB_COMPONENT_KEYS[0],
  );
  const [selectedInstanceByComponent, setSelectedInstanceByComponent] = useState(() =>
    Object.fromEntries(
      COMPONENT_LAB_COMPONENT_KEYS.map((key) => [
        key,
        getInitialInstanceId(catalog.components[key]),
      ]),
    ) as Record<ComponentDesignComponentKey, string>,
  );
  const [selectedViewport, setSelectedViewport] = useState<PreviewViewportKey>(
    DEFAULT_PREVIEW_VIEWPORT.key,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showGrid, setShowGrid] = useState(true);
  const [saveState, setSaveState] = useState<"error" | "idle" | "saving" | "success">("idle");
  const [configPath, setConfigPath] = useState("content/component-design/component-design.json");
  const [hasSavedFile, setHasSavedFile] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewMeasurement, setPreviewMeasurement] = useState({
    height: 0,
    key: "",
  });
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const previousProviderRef = useRef(normalizedProviderDocument);

  const isDirty = !areComponentDesignDocumentsEqual(draftDocument, committedDocument);

  useEffect(() => {
    void router.prefetch("/playground");
    void fetch("/api/component-design", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<ComponentDesignApiPayload> : null)
      .then((payload) => {
        if (!payload) return;
        if (payload.path) setConfigPath(payload.path);
        if (typeof payload.hasSaved === "boolean") setHasSavedFile(payload.hasSaved);
      })
      .catch(() => undefined);
  }, [router]);

  useEffect(() => {
    if (areComponentDesignDocumentsEqual(previousProviderRef.current, normalizedProviderDocument)) return;
    previousProviderRef.current = normalizedProviderDocument;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (isDirty) {
        setCommittedDocument(normalizedProviderDocument);
        setExternalUpdatePending(true);
      } else {
        setCommittedDocument(normalizedProviderDocument);
        setDraftDocument(normalizedProviderDocument);
        setExternalUpdatePending(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isDirty, normalizedProviderDocument]);

  const activeViewport = PREVIEW_VIEWPORTS.find((viewport) => viewport.key === selectedViewport) ??
    DEFAULT_PREVIEW_VIEWPORT;
  const selectedEntry = catalog.components[selectedComponent];
  const selectedDefinition = COMPONENT_LAB_REGISTRY[selectedComponent];
  const selectedInstanceId = selectedInstanceByComponent[selectedComponent];
  const selectedInstance = selectedInstanceId === selectedEntry.stressSample.id
    ? selectedEntry.stressSample
    : selectedEntry.instances.find((instance) => instance.id === selectedInstanceId) ??
      selectedEntry.stressSample;
  const previewData = useMemo(
    () => createPreviewData(selectedEntry, selectedInstance.id),
    [selectedEntry, selectedInstance.id],
  );
  const filteredComponentKeys = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return COMPONENT_LAB_COMPONENT_KEYS;
    return COMPONENT_LAB_COMPONENT_KEYS.filter((key) => {
      const definition = COMPONENT_LAB_REGISTRY[key];
      return `${definition.label} ${definition.description}`.toLocaleLowerCase().includes(query);
    });
  }, [searchQuery]);
  const previewMeasurementKey = `${selectedComponent}:${selectedInstance.id}:${selectedViewport}`;
  const previewContentHeight = previewMeasurement.key === previewMeasurementKey
    ? previewMeasurement.height
    : 0;
  const handlePreviewContentHeight = useCallback((height: number) => {
    setPreviewMeasurement((current) =>
      current.key === previewMeasurementKey && current.height === height
        ? current
        : { height, key: previewMeasurementKey }
    );
  }, [previewMeasurementKey]);

  useLayoutEffect(() => {
    const node = previewFrameRef.current;
    if (!node) return;
    const updateScale = () => {
      const availableWidth = Math.max(1, node.clientWidth - 2);
      setPreviewScale(Math.min(1, availableWidth / activeViewport.width));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeViewport.width]);

  function updateDraftDocument(updater: (next: ComponentDesignDocument) => void) {
    setDraftDocument((current) => {
      const next = cloneDocument(current);
      updater(next);
      return normalizeComponentDesignDocument(next);
    });
    setSaveState("idle");
  }

  function resetCurrentComponent() {
    const defaults = createDefaultComponentDesignDocument();
    updateDraftDocument((next) => {
      next.components[selectedComponent] = cloneDocument(defaults).components[selectedComponent] as never;
    });
  }

  async function saveDocument() {
    const submittedDocument = cloneDocument(draftDocument);
    setSaveState("saving");
    try {
      const response = await fetch("/api/component-design", {
        body: JSON.stringify({ config: submittedDocument }),
        headers: { "Content-Type": "application/json", ...getLocalEditorAccessHeaders() },
        method: "POST",
      });
      const payload = await response.json() as ComponentDesignApiPayload;
      if (!response.ok || !payload.config) throw new Error(payload.error?.message ?? "保存失败");

      const nextDocument = normalizeComponentDesignDocument(payload.config);
      setCommittedDocument(nextDocument);
      setDraftDocument((currentDraft) => reconcileComponentDesignDraftAfterSave({
        committedDocument: nextDocument,
        currentDraft,
        submittedDraft: submittedDocument,
      }));
      setExternalUpdatePending(false);
      setHasSavedFile(true);
      if (payload.path) setConfigPath(payload.path);
      dispatchComponentDesignUpdated(nextDocument);
      setSaveState("success");
    } catch {
      setSaveState("error");
    }
  }

  const previewCanvasHeight = Math.max(activeViewport.height, previewContentHeight);
  const scaledHeight = previewCanvasHeight * previewScale;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid-container gap-y-8 py-6 lg:h-screen lg:overflow-hidden lg:py-8">
        <aside className="col-span-12 flex min-h-0 flex-col lg:col-span-4 lg:h-full lg:overflow-hidden lg:pr-2">
          <header className="border-b border-white/10 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SmallText className="text-textMuted">INTERNAL TOOL / COMPONENT DESIGN</SmallText>
                <Typography as="h1" preset="sans-body" size="title-sm" weight="strong" wrapPolicy="heading" className="mt-1 text-white">
                  ComponentLab
                </Typography>
              </div>
              <MotionButton type="button" onClick={() => router.push("/playground")} className="min-h-10 border border-white/10 px-3 text-textPrimary hover:border-white/25">
                <SmallText>返回</SmallText>
              </MotionButton>
            </div>
            <Typography as="p" preset="sans-body" size="body-sm" weight="regular" wrapPolicy="prose" className="mt-3 max-w-xl text-textMuted">
              页面 JSON 提供实例内容，组件设计 JSON 提供版式。预览由公开页同一 Puck 适配器输出。
            </Typography>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-5 pr-1 lg:overscroll-contain">
            <section className="space-y-3">
              <SmallText className="text-textPrimary">组件与实例</SmallText>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="搜索组件"
                className="min-h-10 w-full border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-textMuted focus:border-white/30"
              />
              <div className="grid grid-cols-2 gap-2">
                {filteredComponentKeys.map((key) => {
                  const entry = catalog.components[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedComponent(key)}
                      className={`min-h-11 border px-3 text-left text-sm transition-colors ${selectedComponent === key ? "border-white/35 bg-white/10 text-white" : "border-white/8 text-textMuted hover:border-white/20 hover:text-white"}`}
                    >
                      <span className="block truncate">{key}</span>
                      <span className="mt-0.5 block text-[11px] text-textMuted">{entry.instances.length} 个页面实例</span>
                    </button>
                  );
                })}
              </div>
              <SelectField
                label="预览实例"
                value={selectedInstance.id}
                options={[
                  ...selectedEntry.instances.map((instance) => ({ label: instance.label, value: instance.id })),
                  { label: selectedEntry.stressSample.label, value: selectedEntry.stressSample.id },
                ]}
                onChange={(id) => setSelectedInstanceByComponent((current) => ({ ...current, [selectedComponent]: id }))}
              />
              <SmallText className="block text-textMuted">
                {selectedInstance.source === "page"
                  ? `真实来源：content/pages/${selectedInstance.pageSlug}.json · ${selectedInstance.componentId}`
                  : selectedEntry.instances.length === 0
                    ? "该类型目前没有页面实例；正在显示预设中的独立压力样本。"
                    : "压力样本：由预设覆盖真实实例生成，不写入页面 JSON。"}
              </SmallText>
            </section>

            <section className="border-t border-white/10 pt-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <SmallText className="text-textPrimary">{selectedDefinition.label} 设置</SmallText>
                <SmallText className="text-textMuted">{selectedDefinition.sections.length} 组</SmallText>
              </div>
              <Typography as="p" preset="sans-body" size="body-sm" weight="regular" wrapPolicy="prose" className="mb-3 text-textMuted">
                {selectedDefinition.description}
              </Typography>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {selectedDefinition.sections.map((section, index) => (
                  <details key={section.title} open={index === 0} className="group py-1">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-textPrimary">
                      {section.title}<span className="text-textMuted group-open:rotate-45">＋</span>
                    </summary>
                    <div className="space-y-4 pb-4">
                      {section.fields.map((field) => (
                        <div key={`${section.title}-${field.label}`}>
                          {renderFieldControl(field, draftDocument, updateDraftDocument)}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <button type="button" onClick={resetCurrentComponent} className="mt-3 min-h-10 text-sm text-textMuted underline decoration-white/20 underline-offset-4 hover:text-white">
                重置当前组件设计
              </button>
            </section>
          </div>

          <footer className="sticky bottom-0 border-t border-white/10 bg-black py-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <SmallText className={isDirty ? "text-white" : "text-textMuted"}>
                {isDirty ? "有未保存修改，仅在本 Lab 生效" : saveState === "success" ? "已保存并广播已提交配置" : saveState === "error" ? "保存失败，正式配置未变化" : "已与正式配置同步"}
              </SmallText>
              <SmallText className="text-right text-textMuted">{hasSavedFile ? configPath : "默认配置"}</SmallText>
            </div>
            {externalUpdatePending ? (
              <div className="mb-3 border-l-2 border-white/40 pl-3 text-sm text-textMuted">
                检测到外部已提交更新。当前草稿仍保留；放弃草稿后可载入新版本。
              </div>
            ) : null}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <MotionButton
                type="button"
                disabled={!isDirty || saveState === "saving"}
                onClick={saveDocument}
                className="min-h-11 bg-white px-4 text-black disabled:bg-white/10 disabled:text-textMuted"
              >
                <SmallText>{saveState === "saving" ? "保存中" : "保存组件设计"}</SmallText>
              </MotionButton>
              <button
                type="button"
                disabled={!isDirty && !externalUpdatePending}
                onClick={() => {
                  setDraftDocument(committedDocument);
                  setExternalUpdatePending(false);
                  setSaveState("idle");
                }}
                className="min-h-11 border border-white/10 px-3 text-sm text-textMuted disabled:opacity-35"
              >
                放弃草稿
              </button>
            </div>
          </footer>
        </aside>

        <section className="col-span-12 min-w-0 lg:col-span-8 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <SmallText className="text-textMuted">LIVE CANVAS / {selectedInstance.source === "page" ? "REAL PAGE INSTANCE" : "STRESS SAMPLE"}</SmallText>
              <Typography as="h2" preset="sans-body" size="body-lg" weight="medium" wrapPolicy="heading" className="mt-1 text-white">
                {selectedComponent}
              </Typography>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PREVIEW_VIEWPORTS.map((viewport) => (
                <button
                  key={viewport.key}
                  type="button"
                  onClick={() => setSelectedViewport(viewport.key)}
                  className={`min-h-9 border px-3 text-xs ${selectedViewport === viewport.key ? "border-white/35 bg-white/10 text-white" : "border-white/10 text-textMuted"}`}
                >
                  {viewport.label} {viewport.width}×{viewport.height}
                </button>
              ))}
              <button type="button" onClick={() => setShowGrid((value) => !value)} className="min-h-9 border border-white/10 px-3 text-xs text-textMuted">
                {showGrid ? "隐藏栅格" : "显示栅格"}
              </button>
            </div>
          </header>

          <div ref={previewFrameRef} className="min-h-0 flex-1 overflow-auto bg-[#080808] lg:overscroll-contain">
            <div
              className="relative mx-auto overflow-hidden bg-black"
              style={{ height: `${scaledHeight}px`, width: `${activeViewport.width * previewScale}px` }}
            >
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{ transform: `scale(${previewScale})`, width: `${activeViewport.width}px` }}
              >
                <LabPreviewFrame
                  key={previewMeasurementKey}
                  data={previewData}
                  designDocument={draftDocument}
                  height={previewCanvasHeight}
                  onContentHeight={handlePreviewContentHeight}
                  showGrid={showGrid}
                  viewportHeight={activeViewport.height}
                  viewportWidth={activeViewport.width}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
