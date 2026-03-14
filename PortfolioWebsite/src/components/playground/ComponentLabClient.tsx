"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import Typography from "@/components/common/Typography";
import ComponentDesignProvider, {
  dispatchComponentDesignUpdated,
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignComponentKey,
  type ComponentDesignDocument,
  type ComponentGridBounds,
  type ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";
import {
  DEFAULT_PREVIEW_VIEWPORT,
  PREVIEW_VIEWPORTS,
  type PreviewViewportKey,
} from "@/lib/preview-viewports";
import {
  COMPONENT_LAB_COMPONENT_KEYS,
  COMPONENT_LAB_REGISTRY,
  type ComponentLabFieldConfig,
  type PreviewVariantKey,
} from "@/components/playground/component-lab-registry";

type ComponentDesignApiPayload = {
  config?: ComponentDesignDocument;
  error?: {
    code: string;
    message: string;
  };
  hasSaved?: boolean;
  path?: string;
};

const PREVIEW_VARIANTS: Array<{ key: PreviewVariantKey; label: string }> = [
  { key: "standard", label: "标准样本" },
  { key: "stress", label: "极端样本" },
];

function cloneDocument(document: ComponentDesignDocument) {
  return JSON.parse(JSON.stringify(document)) as ComponentDesignDocument;
}

function ActionText({ children }: { children: ReactNode }) {
  return (
    <Typography
      as="span"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="label"
      className="block w-full text-center leading-none text-current"
    >
      {children}
    </Typography>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      as="span"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="label"
      className="mb-2 block text-textMuted"
    >
      {children}
    </Typography>
  );
}

function StatusText({ children }: { children: ReactNode }) {
  return (
    <Typography
      as="p"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="prose"
      className="text-textMuted"
    >
      {children}
    </Typography>
  );
}

function ControlBlock({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="border border-white/10 bg-white/[0.02] px-4 py-4">
      <Typography
        as="h2"
        preset="sans-body"
        size="label"
        weight="medium"
        wrapPolicy="label"
        className="mb-2 text-textMuted"
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          as="p"
          preset="sans-body"
          size="body"
          weight="regular"
          wrapPolicy="prose"
          className="mb-4 text-textMuted"
        >
          {description}
        </Typography>
      ) : null}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ControlSubsection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-4 border border-white/8 bg-black/20 p-4">
      <Typography
        as="h3"
        preset="sans-body"
        size="caption"
        weight="medium"
        wrapPolicy="label"
        className="text-textMuted"
      >
        {title}
      </Typography>
      <div className="space-y-3">{children}</div>
    </section>
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
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="w-full border border-white/10 bg-black px-3 py-3 text-textPrimary outline-none transition-colors focus:border-white/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberSelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  options: Array<{ label: string; value: number }>;
  value: number;
}) {
  return (
    <SelectField
      label={label}
      value={String(value)}
      options={options.map((option) => ({
        label: option.label,
        value: String(option.value),
      }))}
      onChange={(nextValue) => onChange(Number(nextValue))}
    />
  );
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/8 py-3">
      <Typography
        as="span"
        preset="sans-body"
        size="body"
        weight="regular"
        wrapPolicy="prose"
        className="text-textPrimary"
      >
        {label}
      </Typography>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-white"
      />
    </label>
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
  return (
    <div className="border border-white/8 bg-black/20 p-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="左边界列"
          value={String(value.leftCol)}
          options={Array.from({ length: 12 }, (_, index) => index + 1).map((column) => ({
            label: `第 ${column} 列`,
            value: String(column),
          }))}
          onChange={(nextValue) => {
            const leftCol = Number(nextValue);
            onChange({
              leftCol,
              rightCol: Math.max(leftCol, value.rightCol),
            });
          }}
        />
        <SelectField
          label="右边界列"
          value={String(value.rightCol)}
          options={Array.from({ length: 12 }, (_, index) => index + 1)
            .filter((column) => column >= value.leftCol)
            .map((column) => ({
              label: `第 ${column} 列`,
              value: String(column),
            }))}
          onChange={(nextValue) => {
            const rightCol = Number(nextValue);
            onChange({
              leftCol: Math.min(value.leftCol, rightCol),
              rightCol,
            });
          }}
        />
      </div>
    </div>
  );
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
    <div className="space-y-3 border border-white/8 bg-black/20 p-4">
      <FieldLabel>{label}</FieldLabel>
      <BoundsField
        label="默认 / 移动端边界"
        value={value.base}
        onChange={(nextValue) => {
          onChange({
            ...value,
            base: nextValue,
          });
        }}
      />
      <BoundsField
        label="桌面端边界 (`lg`)"
        value={value.lg}
        onChange={(nextValue) => {
          onChange({
            ...value,
            lg: nextValue,
          });
        }}
      />
    </div>
  );
}

function GridOverlay({ height }: { height: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      aria-hidden="true"
    >
      <div
        className="grid-container h-full min-h-full"
        style={{ height: `${height}px`, minHeight: `${height}px` }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={`component-lab-grid-${index + 1}`}
            className="relative block h-full min-h-full border-x border-white/20 bg-white/[0.035] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          />
        ))}
      </div>
    </div>
  );
}

function renderFieldControl(
  field: ComponentLabFieldConfig,
  document: ComponentDesignDocument,
  updateDocument: (
    updater: (nextDocument: ComponentDesignDocument) => void,
  ) => void,
) {
  switch (field.type) {
    case "toggle":
      return (
        <ToggleField
          label={field.label}
          checked={field.getValue(document)}
          onChange={(value) => {
            updateDocument((nextDocument) => {
              field.setValue(nextDocument, value);
            });
          }}
        />
      );
    case "select":
      return (
        <SelectField
          label={field.label}
          value={field.getValue(document)}
          options={field.options}
          onChange={(value) => {
            updateDocument((nextDocument) => {
              field.setValue(nextDocument, value);
            });
          }}
        />
      );
    case "number-select":
      return (
        <NumberSelectField
          label={field.label}
          value={field.getValue(document)}
          options={field.options}
          onChange={(value) => {
            updateDocument((nextDocument) => {
              field.setValue(nextDocument, value);
            });
          }}
        />
      );
    case "bounds":
      return (
        <BoundsField
          label={field.label}
          value={field.getValue(document)}
          onChange={(value) => {
            updateDocument((nextDocument) => {
              field.setValue(nextDocument, value);
            });
          }}
        />
      );
    case "responsive-bounds":
      return (
        <ResponsiveBoundsField
          label={field.label}
          value={field.getValue(document)}
          onChange={(value) => {
            updateDocument((nextDocument) => {
              field.setValue(nextDocument, value);
            });
          }}
        />
      );
    default:
      return null;
  }
}

export default function ComponentLabClient() {
  const router = useRouter();
  const componentDesignDocument = useComponentDesignDocument();
  const previewViewportFrameRef = useRef<HTMLDivElement>(null);
  const previewStageContentRef = useRef<HTMLDivElement>(null);
  const [draftDocument, setDraftDocument] = useState<ComponentDesignDocument>(
    normalizeComponentDesignDocument(componentDesignDocument),
  );
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentDesignComponentKey>(COMPONENT_LAB_COMPONENT_KEYS[0]);
  const [selectedViewport, setSelectedViewport] =
    useState<PreviewViewportKey>(DEFAULT_PREVIEW_VIEWPORT.key);
  const [selectedVariant, setSelectedVariant] =
    useState<PreviewVariantKey>("standard");
  const [saveState, setSaveState] =
    useState<"error" | "idle" | "saving" | "success">("idle");
  const [configPath, setConfigPath] =
    useState("content/component-design/component-design.json");
  const [hasSavedFile, setHasSavedFile] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewStageContentHeight, setPreviewStageContentHeight] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-lab-mode", "true");
    void router.prefetch("/playground");

    return () => {
      document.documentElement.removeAttribute("data-font-lab-mode");
    };
  }, [router]);

  useEffect(() => {
    setDraftDocument(normalizeComponentDesignDocument(componentDesignDocument));
  }, [componentDesignDocument]);

  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      try {
        const response = await fetch("/api/component-design", {
          cache: "no-store",
        });
        if (!response.ok || !isMounted) {
          return;
        }

        const payload = (await response.json()) as ComponentDesignApiPayload;
        if (payload.path) {
          setConfigPath(payload.path);
        }
        if (typeof payload.hasSaved === "boolean") {
          setHasSavedFile(payload.hasSaved);
        }
      } catch {
        // 保持默认路径
      }
    }

    void loadMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeViewport = useMemo(
    () =>
      PREVIEW_VIEWPORTS.find((viewport) => viewport.key === selectedViewport) ??
      DEFAULT_PREVIEW_VIEWPORT,
    [selectedViewport],
  );
  const stageHeight = Math.max(activeViewport.height, 900);
  const selectedDefinition = COMPONENT_LAB_REGISTRY[selectedComponent];

  const isDirty = useMemo(
    () =>
      JSON.stringify(normalizeComponentDesignDocument(draftDocument)) !==
      JSON.stringify(normalizeComponentDesignDocument(componentDesignDocument)),
    [componentDesignDocument, draftDocument],
  );

  useLayoutEffect(() => {
    const frameNode = previewViewportFrameRef.current;

    if (!frameNode) {
      return;
    }

    const updateScale = () => {
      const nextScale = Math.min(
        1,
        (frameNode.clientWidth - 2) / activeViewport.width,
      );
      setPreviewScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frameNode);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [activeViewport.width]);

  useLayoutEffect(() => {
    const node = previewStageContentRef.current;

    if (!node) {
      return;
    }

    let frameId = 0;
    const updateHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const nextHeight = Math.max(stageHeight, node.offsetHeight);
        setPreviewStageContentHeight((current) =>
          Math.abs(current - nextHeight) < 0.5 ? current : nextHeight
        );
      });
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    window.addEventListener("resize", updateHeight);
    void document.fonts.ready.then(updateHeight).catch(() => {});

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [selectedComponent, selectedVariant, stageHeight]);

  const previewStageHeight = Math.max(stageHeight, previewStageContentHeight || 0);

  function updateDraftDocument(
    updater: (nextDocument: ComponentDesignDocument) => void,
  ) {
    setDraftDocument((currentDocument) => {
      const nextDocument = cloneDocument(currentDocument);
      updater(nextDocument);
      return normalizeComponentDesignDocument(nextDocument);
    });
    setSaveState((currentState) => (currentState === "success" ? "idle" : currentState));
  }

  function resetCurrentComponent() {
    const defaults = createDefaultComponentDesignDocument();
    updateDraftDocument((nextDocument) => {
      const componentMap = nextDocument.components as Record<
        ComponentDesignComponentKey,
        unknown
      >;
      const defaultMap = defaults.components as Record<
        ComponentDesignComponentKey,
        unknown
      >;
      componentMap[selectedComponent] = defaultMap[selectedComponent];
    });
  }

  async function saveDocument() {
    setSaveState("saving");

    try {
      const response = await fetch("/api/component-design", {
        body: JSON.stringify({
          config: draftDocument,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as ComponentDesignApiPayload;
      if (!response.ok || !payload.config) {
        setSaveState("error");
        return;
      }

      const nextDocument = normalizeComponentDesignDocument(payload.config);
      setDraftDocument(nextDocument);
      setHasSavedFile(true);
      if (payload.path) {
        setConfigPath(payload.path);
      }
      dispatchComponentDesignUpdated(nextDocument);
      setSaveState("success");
    } catch {
      setSaveState("error");
    }
  }

  function navigateToPlayground() {
    document.documentElement.removeAttribute("data-font-lab-mode");
    window.location.assign("/playground");
  }

  return (
    <main className="min-h-screen bg-black text-white rhythm-section-spacious lg:h-screen lg:overflow-hidden lg:py-0">
      <div className="grid-container gap-y-8 lg:h-full lg:grid-cols-12 lg:gap-x-6 lg:py-8">
        <aside className="col-span-12 self-start space-y-4 lg:col-span-3 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <div className="border border-white/10 bg-white/[0.02] px-4 py-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 md:items-center">
              <div>
                <Typography
                  as="p"
                  preset="sans-body"
                  size="caption"
                  weight="medium"
                  wrapPolicy="label"
                  className="text-textMuted"
                >
                  INTERNAL TOOL
                </Typography>
                <Typography
                  as="h1"
                  preset="sans-body"
                  size="title-sm"
                  weight="strong"
                  wrapPolicy="heading"
                  className="text-white"
                >
                  Component Lab
                </Typography>
              </div>
              <button
                type="button"
                onClick={navigateToPlayground}
                className="inline-flex min-h-[3rem] items-center justify-center border border-white/10 px-4 text-textPrimary transition-colors hover:border-white/20 hover:text-white"
              >
                <ActionText>返回 Playground</ActionText>
              </button>
            </div>
            <Typography
              as="p"
              preset="sans-body"
              size="body"
              weight="regular"
              wrapPolicy="prose"
              className="mt-4 text-textMuted"
            >
              全站组件级版式工作台。这里直接调整全部可视组件的共享字号、节奏 token 与 12 列栅格边界，保存后会同步影响对应实例。
            </Typography>
            <div className="mt-6 grid gap-3">
              <StatusText>配置文件：{configPath}</StatusText>
              <StatusText>
                {hasSavedFile ? "当前已读取正式组件设计配置。" : "当前使用默认回退配置。"}
              </StatusText>
            </div>
          </div>

          <ControlBlock
            title="组件选择"
            description="已覆盖全部可视组件。`base` 代表默认 / 移动端边界，`lg` 代表桌面断点边界。"
          >
            <div className="grid gap-3">
              {COMPONENT_LAB_COMPONENT_KEYS.map((componentKey) => {
                const definition = COMPONENT_LAB_REGISTRY[componentKey];
                return (
                  <button
                    key={componentKey}
                    type="button"
                    onClick={() => setSelectedComponent(componentKey)}
                    className={`border px-4 py-4 text-left transition-colors ${
                      selectedComponent === componentKey
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="caption"
                      weight="medium"
                      wrapPolicy="label"
                      className="text-textMuted"
                    >
                      {definition.label}
                    </Typography>
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="body"
                      weight="regular"
                      wrapPolicy="prose"
                      className="mt-3 text-textPrimary"
                    >
                      {definition.description}
                    </Typography>
                  </button>
                );
              })}
            </div>
          </ControlBlock>
        </aside>

        <section className="col-span-12 lg:col-span-5 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <div className="space-y-4">
            <ControlBlock
              title={selectedDefinition.label}
              description={selectedDefinition.description}
            >
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-3">
                  {PREVIEW_VIEWPORTS.map((viewport) => (
                    <button
                      key={viewport.key}
                      type="button"
                      onClick={() => setSelectedViewport(viewport.key)}
                      className={`border px-4 py-3 transition-colors ${
                        selectedViewport === viewport.key
                          ? "border-white/20 bg-white/[0.08] text-white"
                          : "border-white/10 bg-black/20 text-textPrimary hover:border-white/20"
                      }`}
                    >
                      <ActionText>{viewport.label}</ActionText>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {PREVIEW_VARIANTS.map((variant) => (
                    <button
                      key={variant.key}
                      type="button"
                      onClick={() => setSelectedVariant(variant.key)}
                      className={`border px-4 py-3 transition-colors ${
                        selectedVariant === variant.key
                          ? "border-white/20 bg-white/[0.08] text-white"
                          : "border-white/10 bg-black/20 text-textPrimary hover:border-white/20"
                      }`}
                    >
                      <ActionText>{variant.label}</ActionText>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={saveDocument}
                    disabled={!isDirty || saveState === "saving"}
                    className="border border-white/10 bg-white/[0.06] px-4 py-3 text-textPrimary transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.02] disabled:text-textMuted"
                  >
                    <ActionText>
                      {saveState === "saving" ? "保存中" : "保存配置"}
                    </ActionText>
                  </button>
                </div>
                <StatusText>
                  当前预览约束固定为 390 / 820 / 1440 三档舞台；桌面档始终按 1440px 校准并自动缩放显示。
                </StatusText>
                <StatusText>
                  {saveState === "success"
                    ? "已写入正式配置，所有纳入组件的实例会立即读取更新。"
                    : saveState === "error"
                      ? "保存失败，正式配置未更新。"
                      : isDirty
                        ? "当前有未保存改动。"
                        : "当前没有未保存改动。"}
                </StatusText>
              </div>
            </ControlBlock>

            <div
              ref={previewViewportFrameRef}
              className="overflow-y-auto overflow-x-hidden border border-white/10 bg-white/[0.02] p-3"
            >
              <div
                className="relative mx-auto overflow-hidden border border-white/10 bg-black"
                style={{
                  height: `${previewStageHeight * previewScale}px`,
                  width: "100%",
                }}
              >
                <div
                  className="absolute left-1/2 top-0 origin-top -translate-x-1/2"
                  style={{
                    transform: `translateX(-50%) scale(${previewScale})`,
                    width: `${activeViewport.width}px`,
                  }}
                >
                  <div className="relative" style={{ minHeight: `${stageHeight}px` }}>
                    <GridOverlay height={previewStageHeight} />
                    <div
                      ref={previewStageContentRef}
                      className="relative z-10 overflow-x-hidden"
                      style={{ minHeight: `${stageHeight}px` }}
                    >
                      <ComponentDesignProvider
                        initialDocument={draftDocument}
                        listenToGlobalUpdates={false}
                      >
                        {selectedDefinition.renderPreview(selectedVariant)}
                      </ComponentDesignProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 self-start space-y-4 lg:col-span-4 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <ControlBlock
            title="组件设置"
            description="所有位置调整都回写到组件设计配置；不会直接修改页面 JSON。"
          >
            {selectedDefinition.sections.map((section) => (
              <ControlSubsection key={section.title} title={section.title}>
                {section.fields.map((field) => (
                  <div key={`${section.title}-${field.label}`}>
                    {renderFieldControl(field, draftDocument, updateDraftDocument)}
                  </div>
                ))}
              </ControlSubsection>
            ))}

            <div className="flex flex-wrap gap-3 border-t border-white/8 pt-4">
              <button
                type="button"
                onClick={resetCurrentComponent}
                className="border border-white/10 px-4 py-3 text-textPrimary transition-colors hover:border-white/20 hover:text-white"
              >
                <ActionText>重置当前组件配置</ActionText>
              </button>
            </div>
          </ControlBlock>
        </aside>
      </div>
    </main>
  );
}
