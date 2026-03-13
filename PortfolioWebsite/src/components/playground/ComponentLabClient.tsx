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

import ContentCard from "@/components/breakdowns/ContentCard";
import HighDensityInfoBlock from "@/components/breakdowns/HighDensityInfoBlock";
import TextSplitLayout from "@/components/breakdowns/TextSplitLayout";
import Typography from "@/components/common/Typography";
import RichParagraphBlock from "@/components/common/RichParagraphBlock";
import ComponentDesignProvider, {
  dispatchComponentDesignUpdated,
  useComponentDesignDocument,
} from "@/components/layout/ComponentDesignProvider";
import {
  COMPONENT_DESIGN_COMPONENT_KEYS,
  COMPONENT_DESIGN_SECTION_SPACING_LABELS,
  COMPONENT_DESIGN_SECTION_SPACING_TOKENS,
  COMPONENT_DESIGN_SPACING_LABELS,
  COMPONENT_DESIGN_SPACING_TOKENS,
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignComponentKey,
  type ComponentDesignDocument,
  type ComponentGridBounds,
} from "@/lib/component-design-schema";
import { type TypographySize } from "@/lib/typography-tokens";

type ComponentDesignApiPayload = {
  config?: ComponentDesignDocument;
  error?: {
    code: string;
    message: string;
  };
  hasSaved?: boolean;
  path?: string;
};

type PreviewVariantKey = "stress" | "standard";

type PreviewTextState = {
  ContentCard: {
    description: string;
    title: string;
  };
  HighDensityInfoBlock: {
    phase1Content: string;
    phase1Label: string;
    phase1Subtitle: string;
    phase1Title: string;
    phase2Content: string;
    phase2Label: string;
    phase2Subtitle: string;
    phase2Title: string;
    phase3Content: string;
    phase3Label: string;
    phase3Subtitle: string;
    phase3Title: string;
  };
  RichParagraph: {
    content: string;
  };
  TextSplitLayout: {
    heading: string;
    paragraphs: string;
  };
};

const VIEWPORTS = [
  { height: 844, key: "mobile", label: "Mobile", width: 390 },
  { height: 1180, key: "tablet", label: "Tablet", width: 820 },
  { height: 920, key: "desktop", label: "Desktop", width: 1280 },
] as const;

const PREVIEW_VARIANTS: Array<{ key: PreviewVariantKey; label: string }> = [
  { key: "standard", label: "标准样本" },
  { key: "stress", label: "极端样本" },
];

const COMPONENT_LABELS: Record<ComponentDesignComponentKey, string> = {
  ContentCard: "ContentCard",
  HighDensityInfoBlock: "HighDensityInfoBlock",
  RichParagraph: "RichParagraph",
  TextSplitLayout: "TextSplitLayout",
};

const COMPONENT_DESCRIPTIONS: Record<ComponentDesignComponentKey, string> = {
  ContentCard: "图文叙事卡片，重点看标题层级、正文组间距和图文边界。",
  HighDensityInfoBlock: "三列高密度信息块，重点看列边界、标题堆叠和 metadata 节奏。",
  RichParagraph: "长段落正文组件，重点看正文档位与内容区边界。",
  TextSplitLayout: "标题、正文、图片组合组件，重点看左右落点和段落堆叠节奏。",
};

const BODY_SIZE_OPTIONS: TypographySize[] = ["body-sm", "body", "body-lg"];
const TITLE_SIZE_OPTIONS: TypographySize[] = ["title-sm", "title", "display"];
const STACK_HEADING_OPTIONS: TypographySize[] = ["title", "display", "hero"];

function cloneDocument(document: ComponentDesignDocument) {
  return JSON.parse(JSON.stringify(document)) as ComponentDesignDocument;
}

function createEmptyPreviewTextState(): PreviewTextState {
  return {
    ContentCard: {
      description: "",
      title: "",
    },
    HighDensityInfoBlock: {
      phase1Content: "",
      phase1Label: "",
      phase1Subtitle: "",
      phase1Title: "",
      phase2Content: "",
      phase2Label: "",
      phase2Subtitle: "",
      phase2Title: "",
      phase3Content: "",
      phase3Label: "",
      phase3Subtitle: "",
      phase3Title: "",
    },
    RichParagraph: {
      content: "",
    },
    TextSplitLayout: {
      heading: "",
      paragraphs: "",
    },
  };
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

function SelectField<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: TValue) => void;
  options: Array<{ label: string; value: TValue }>;
  value: TValue;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as TValue)}
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

function TextInputField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="w-full border border-white/10 bg-black px-3 py-3 text-textPrimary outline-none transition-colors placeholder:text-textMuted focus:border-white/30"
      />
    </label>
  );
}

function TextareaField({
  label,
  onChange,
  placeholder,
  rows = 4,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="w-full resize-y border border-white/10 bg-black px-3 py-3 text-textPrimary outline-none transition-colors placeholder:text-textMuted focus:border-white/30"
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

function getRichParagraphBasePreview(variant: PreviewVariantKey) {
  return {
    content:
      variant === "stress"
        ? "凌晨四点的工业园区不会给排版留多少容错空间。Typography 必须同时承受中文、English、版本号 build-2026.03.13、长文件名与多重语义切换。只有当大段正文在极长句、长英文词和中英混排下仍然保持稳定左边缘、均匀阅读节奏和清晰层级时，这个组件的正文档位与边界才算真正成立。"
        : "这是一个用于检验正文档位和内容宽度的标准样本。它需要在 Futura 与汉仪旗黑的混排中保持稳定阅读节奏，同时又不能因为内容区过宽而失去密度。",
  };
}

function getContentCardBasePreview(variant: PreviewVariantKey) {
  return {
    description:
      variant === "stress"
        ? "第一段用于观察标题与正文的关系。\n\n第二段用于观察多段内容时的组间距是否还能保持稳定。\n\nThird paragraph checks bilingual rhythm under a dense editorial layout."
        : "这是一个用于观察标题、正文和图片边界关系的标准样本。可以直接判断 text block 是否太挤，或者图文距离是否松散。",
    title:
      variant === "stress"
        ? "LAYOUT SYSTEM / 组件共享排版校准"
        : "CONTENT CARD TITLE",
  };
}

function getTextSplitLayoutBasePreview(variant: PreviewVariantKey) {
  return {
    heading:
      variant === "stress"
        ? "SYSTEM BREAKDOWN / COMPONENT DESIGN"
        : "SPLIT LAYOUT HEADING",
    paragraphs:
      variant === "stress"
        ? "第一段观察极长标题下正文区域是否还保有足够的呼吸感。\n\n第二段观察多段叙述时，右侧文本列是不是开始变得过碎，或者边界已经侵蚀到图片舞台。\n\nThird paragraph is intentionally longer so the lab can expose whether the current paragraph stack is still controlled."
        : "这是标准图文分栏样本，用于观察标题、正文和图片是否仍然共享同一套栅格边界。\n\n如果正文列过宽或标题区太窄，这里会很快暴露问题。",
  };
}

function getHighDensityInfoBlockBasePreview(variant: PreviewVariantKey) {
  return {
    phase1Content:
      variant === "stress"
        ? "高密度信息块最容易出问题的是列宽失衡和标题节奏漂移。这里用较长的第一列文本压测左列是否已经过窄。"
        : "第一列用于承载背景和问题定义。",
    phase1Label: "PHASE 01 / CONTEXT",
    phase1Subtitle: "Problem framing",
    phase1Title: variant === "stress" ? "Context / Constraints" : "Context",
    phase2Content:
      variant === "stress"
        ? "中列通常承担方法论说明，因此最需要稳定的标题、正文和 metadata 节奏，不然整块会显得又碎又紧。"
        : "第二列用于解释系统结构与执行方法。",
    phase2Label: "PHASE 02 / SYSTEM",
    phase2Subtitle: "Structure",
    phase2Title: "Architecture",
    phase3Content:
      variant === "stress"
        ? "第三列同时承载文案与图像时，常见问题是图片区进入太早，导致文字段落尚未收住。"
        : "第三列用于交代结果与最终图像。",
    phase3Label: "PHASE 03 / RESULT",
    phase3Subtitle: "Outcome",
    phase3Title: "Execution",
  };
}

function resolvePreviewText(
  value: string,
  fallback: string,
) {
  return value.trim() ? value : fallback;
}

function splitPreviewParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderPreviewComponent(
  componentKey: ComponentDesignComponentKey,
  variant: PreviewVariantKey,
  previewTextState: PreviewTextState,
) {
  switch (componentKey) {
    case "RichParagraph": {
      const preview = getRichParagraphBasePreview(variant);
      return (
        <RichParagraphBlock
          content={resolvePreviewText(
            previewTextState.RichParagraph.content,
            preview.content,
          )}
        />
      );
    }
    case "ContentCard": {
      const preview = getContentCardBasePreview(variant);
      return (
        <ContentCard
          title={resolvePreviewText(
            previewTextState.ContentCard.title,
            preview.title,
          )}
          description={resolvePreviewText(
            previewTextState.ContentCard.description,
            preview.description,
          )}
          imageSrc="/images/train-station/2Day.webp"
          imagePreset="ratio-16-9"
          imageFitMode="x"
          imagePosition={variant === "stress" ? "left" : "right"}
        />
      );
    }
    case "TextSplitLayout": {
      const preview = getTextSplitLayoutBasePreview(variant);
      return (
        <TextSplitLayout
          heading={resolvePreviewText(
            previewTextState.TextSplitLayout.heading,
            preview.heading,
          )}
          paragraphs={splitPreviewParagraphs(
            resolvePreviewText(
              previewTextState.TextSplitLayout.paragraphs,
              preview.paragraphs,
            ),
          )}
          imageSrc="/images/train-station/2Night.webp"
          imagePreset="ratio-16-9"
          imageFitMode="x"
          layoutVariant={variant === "stress" ? "stack" : "split-left"}
        />
      );
    }
    case "HighDensityInfoBlock": {
      const preview = getHighDensityInfoBlockBasePreview(variant);
      return (
        <HighDensityInfoBlock
          phase1={{
            label: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase1Label,
              preview.phase1Label,
            ),
            title: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase1Title,
              preview.phase1Title,
            ),
            subtitle: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase1Subtitle,
              preview.phase1Subtitle,
            ),
            content: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase1Content,
              preview.phase1Content,
            ),
            items: [
              { label: "Role", value: "Lighting / Tech Art" },
              { label: "Timeline", value: "2026.03 / 3 weeks" },
            ],
          }}
          phase2={{
            label: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase2Label,
              preview.phase2Label,
            ),
            title: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase2Title,
              preview.phase2Title,
            ),
            subtitle: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase2Subtitle,
              preview.phase2Subtitle,
            ),
            content: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase2Content,
              preview.phase2Content,
            ),
            items: [
              { label: "Tools", value: "Unreal / Houdini / Puck" },
              { label: "Focus", value: "Layout tokens / Typography" },
            ],
          }}
          phase3={{
            label: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase3Label,
              preview.phase3Label,
            ),
            title: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase3Title,
              preview.phase3Title,
            ),
            subtitle: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase3Subtitle,
              preview.phase3Subtitle,
            ),
            content: resolvePreviewText(
              previewTextState.HighDensityInfoBlock.phase3Content,
              preview.phase3Content,
            ),
            imageSrc: "/images/city-2026/002.webp",
            imagePreset: "ratio-16-9",
            imageFitMode: "x",
          }}
        />
      );
    }
    default:
      return null;
  }
}

export default function ComponentLabClient() {
  const router = useRouter();
  const componentDesignDocument = useComponentDesignDocument();
  const previewViewportFrameRef = useRef<HTMLDivElement>(null);
  const [draftDocument, setDraftDocument] = useState<ComponentDesignDocument>(
    normalizeComponentDesignDocument(componentDesignDocument),
  );
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentDesignComponentKey>("RichParagraph");
  const [selectedViewport, setSelectedViewport] =
    useState<(typeof VIEWPORTS)[number]["key"]>("desktop");
  const [selectedVariant, setSelectedVariant] =
    useState<PreviewVariantKey>("standard");
  const [previewTextState, setPreviewTextState] = useState<PreviewTextState>(
    createEmptyPreviewTextState,
  );
  const [saveState, setSaveState] =
    useState<"error" | "idle" | "saving" | "success">("idle");
  const [configPath, setConfigPath] =
    useState("content/component-design/component-design.json");
  const [hasSavedFile, setHasSavedFile] = useState(true);
  const [previewScale, setPreviewScale] = useState(1);

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
    () => VIEWPORTS.find((viewport) => viewport.key === selectedViewport) ?? VIEWPORTS[2],
    [selectedViewport],
  );
  const stageHeight = Math.max(activeViewport.height, 900);

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
      switch (selectedComponent) {
        case "RichParagraph":
          nextDocument.components.RichParagraph = defaults.components.RichParagraph;
          break;
        case "ContentCard":
          nextDocument.components.ContentCard = defaults.components.ContentCard;
          break;
        case "TextSplitLayout":
          nextDocument.components.TextSplitLayout = defaults.components.TextSplitLayout;
          break;
        case "HighDensityInfoBlock":
          nextDocument.components.HighDensityInfoBlock = defaults.components.HighDensityInfoBlock;
          break;
        default:
          break;
      }
    });
  }

  function resetPreviewOverride() {
    setPreviewTextState((currentState) => ({
      ...currentState,
      [selectedComponent]: createEmptyPreviewTextState()[selectedComponent],
    }));
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

  function updatePreviewTextForComponent(
    componentKey: ComponentDesignComponentKey,
    field: string,
    value: string,
  ) {
    setPreviewTextState((currentState) => ({
      ...currentState,
      [componentKey]: {
        ...currentState[componentKey],
        [field]: value,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-black text-white rhythm-section-spacious lg:h-screen lg:overflow-hidden lg:py-0">
      <div className="grid-container gap-y-8 lg:h-full lg:grid-cols-12 lg:gap-x-6 lg:py-8">
        <aside className="col-span-12 self-start space-y-4 lg:col-span-3 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <div className="border border-white/10 bg-white/[0.02] px-4 py-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 md:items-center">
              <div className="space-y-3">
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
                <Typography
                  as="p"
                  preset="sans-body"
                  size="body"
                  weight="regular"
                  wrapPolicy="prose"
                  className="text-textMuted"
                >
                  组件级排版工作台。这里直接调整试点组件的共享字号档位、文本间距、自动换行和左右网格边界。
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.documentElement.removeAttribute("data-font-lab-mode");
                  window.location.assign("/playground");
                }}
                className="inline-flex min-h-[3rem] items-center justify-center border border-white/10 px-4 text-textPrimary transition-colors hover:border-white/20 hover:text-white"
              >
                <ActionText>返回 Playground</ActionText>
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              <StatusText>
                配置文件：{configPath}
              </StatusText>
              <StatusText>
                {hasSavedFile ? "当前已读取正式组件设计配置。" : "当前使用默认回退配置。"}
              </StatusText>
            </div>
          </div>

          <ControlBlock
            title="组件选择"
            description="第一版只开放 4 个试点组件，它们都会在保存后同步影响全站对应实例。"
          >
            <div className="grid gap-3">
              {COMPONENT_DESIGN_COMPONENT_KEYS.map((componentKey) => (
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
                    {COMPONENT_LABELS[componentKey]}
                  </Typography>
                  <Typography
                    as="p"
                    preset="sans-body"
                    size="body"
                    weight="regular"
                    wrapPolicy="prose"
                    className="mt-3 text-textPrimary"
                  >
                    {COMPONENT_DESCRIPTIONS[componentKey]}
                  </Typography>
                </button>
              ))}
            </div>
          </ControlBlock>
        </aside>

        <section className="col-span-12 lg:col-span-5 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <div className="space-y-4">
            <ControlBlock
              title={COMPONENT_LABELS[selectedComponent]}
              description="预览舞台使用站点真实组件。网格线比站点测试模式更明显，用来直接判断边界和列落点。"
            >
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-3">
                  {VIEWPORTS.map((viewport) => (
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
                  {saveState === "success"
                    ? "已写入正式配置，试点组件全部实例会立即读取更新。"
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
                  height: `${stageHeight * previewScale}px`,
                  width: "100%",
                }}
              >
                <div
                  className="absolute left-1/2 top-0 origin-top -translate-x-1/2 overflow-hidden"
                  style={{
                    height: `${stageHeight}px`,
                    transform: `translateX(-50%) scale(${previewScale})`,
                    width: `${activeViewport.width}px`,
                  }}
                >
                  <GridOverlay height={stageHeight} />
                  <div className="relative z-10 h-full overflow-x-hidden">
                    <ComponentDesignProvider
                      initialDocument={draftDocument}
                      listenToGlobalUpdates={false}
                    >
                      {renderPreviewComponent(
                        selectedComponent,
                        selectedVariant,
                        previewTextState,
                      )}
                    </ComponentDesignProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-12 self-start space-y-4 lg:col-span-4 lg:min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <ControlBlock
            title="文本与换行"
            description="默认都允许自动换行。关闭后会切到 `nowrap`，用于快速暴露过长标题或标签锁线问题。"
          >
            {selectedComponent === "RichParagraph" ? (
              <ControlSubsection title="正文">
                <SelectField
                  label="正文字号"
                  value={draftDocument.components.RichParagraph.bodySize}
                  options={BODY_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                  onChange={(value) => {
                    updateDraftDocument((nextDocument) => {
                      nextDocument.components.RichParagraph.bodySize = value;
                    });
                  }}
                />
                <ToggleField
                  label="正文自动换行"
                  checked={draftDocument.components.RichParagraph.bodyAutoWrap}
                  onChange={(value) => {
                    updateDraftDocument((nextDocument) => {
                      nextDocument.components.RichParagraph.bodyAutoWrap = value;
                    });
                  }}
                />
              </ControlSubsection>
            ) : null}

            {selectedComponent === "ContentCard" ? (
              <>
                <ControlSubsection title="标题">
                  <SelectField
                    label="标题字号"
                    value={draftDocument.components.ContentCard.titleSize}
                    options={TITLE_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.titleSize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="标题自动换行"
                    checked={draftDocument.components.ContentCard.titleAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.titleAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="正文">
                  <SelectField
                    label="正文字号"
                    value={draftDocument.components.ContentCard.bodySize}
                    options={BODY_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.bodySize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="正文自动换行"
                    checked={draftDocument.components.ContentCard.bodyAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.bodyAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}

            {selectedComponent === "TextSplitLayout" ? (
              <>
                <ControlSubsection title="标题">
                  <SelectField
                    label="分栏标题字号"
                    value={draftDocument.components.TextSplitLayout.splitHeadingSize}
                    options={TITLE_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.splitHeadingSize = value;
                      });
                    }}
                  />
                  <SelectField
                    label="堆叠标题字号"
                    value={draftDocument.components.TextSplitLayout.stackHeadingSize}
                    options={STACK_HEADING_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.stackHeadingSize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="标题自动换行"
                    checked={draftDocument.components.TextSplitLayout.headingAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.headingAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="正文">
                  <SelectField
                    label="正文字号"
                    value={draftDocument.components.TextSplitLayout.bodySize}
                    options={BODY_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.bodySize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="正文自动换行"
                    checked={draftDocument.components.TextSplitLayout.bodyAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.bodyAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}

            {selectedComponent === "HighDensityInfoBlock" ? (
              <>
                <ControlSubsection title="标题">
                  <SelectField
                    label="阶段标题字号"
                    value={draftDocument.components.HighDensityInfoBlock.titleSize}
                    options={TITLE_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.titleSize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="标题自动换行"
                    checked={draftDocument.components.HighDensityInfoBlock.titleAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.titleAutoWrap = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="副标题自动换行"
                    checked={draftDocument.components.HighDensityInfoBlock.subtitleAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.subtitleAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="正文">
                  <SelectField
                    label="正文字号"
                    value={draftDocument.components.HighDensityInfoBlock.bodySize}
                    options={BODY_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.bodySize = value;
                      });
                    }}
                  />
                  <ToggleField
                    label="正文自动换行"
                    checked={draftDocument.components.HighDensityInfoBlock.bodyAutoWrap}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.bodyAutoWrap = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}
          </ControlBlock>

          <ControlBlock
            title="布局与节奏"
            description="只开放现有 12 列边界和节奏档位，不允许自由 CSS。"
          >
            {selectedComponent === "RichParagraph" ? (
              <>
                <ControlSubsection title="区块">
                  <SelectField
                    label="区块纵向节奏"
                    value={draftDocument.components.RichParagraph.sectionSpacing}
                    options={COMPONENT_DESIGN_SECTION_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SECTION_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.RichParagraph.sectionSpacing = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="网格边界">
                  <BoundsField
                    label="内容区边界"
                    value={draftDocument.components.RichParagraph.contentBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.RichParagraph.contentBounds = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}

            {selectedComponent === "ContentCard" ? (
              <>
                <ControlSubsection title="节奏">
                  <SelectField
                    label="标题与正文间距"
                    value={draftDocument.components.ContentCard.titleBodyGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.titleBodyGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="段落组间距"
                    value={draftDocument.components.ContentCard.paragraphGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.paragraphGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="图片移动端上边距"
                    value={draftDocument.components.ContentCard.mobileMediaTopSpacing}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.mobileMediaTopSpacing = value;
                      });
                    }}
                  />
                  <SelectField
                    label="区块纵向节奏"
                    value={draftDocument.components.ContentCard.sectionSpacing}
                    options={COMPONENT_DESIGN_SECTION_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SECTION_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.sectionSpacing = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="网格边界">
                  <BoundsField
                    label="纯文本内容边界"
                    value={draftDocument.components.ContentCard.textOnlyBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.textOnlyBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="图片在左 / 图片边界"
                    value={draftDocument.components.ContentCard.imageLeftMediaBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.imageLeftMediaBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="图片在左 / 文本边界"
                    value={draftDocument.components.ContentCard.imageLeftTextBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.imageLeftTextBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="图片在右 / 文本边界"
                    value={draftDocument.components.ContentCard.imageRightTextBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.imageRightTextBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="图片在右 / 图片边界"
                    value={draftDocument.components.ContentCard.imageRightMediaBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.ContentCard.imageRightMediaBounds = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}

            {selectedComponent === "TextSplitLayout" ? (
              <>
                <ControlSubsection title="节奏">
                  <SelectField
                    label="段落组间距"
                    value={draftDocument.components.TextSplitLayout.paragraphGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.paragraphGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="分栏上下错位距离"
                    value={draftDocument.components.TextSplitLayout.headingImageGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.headingImageGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="堆叠标题后距离"
                    value={draftDocument.components.TextSplitLayout.stackTextTopSpacing}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.stackTextTopSpacing = value;
                      });
                    }}
                  />
                  <SelectField
                    label="堆叠图片区进入距离"
                    value={draftDocument.components.TextSplitLayout.stackImageTopSpacing}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.stackImageTopSpacing = value;
                      });
                    }}
                  />
                  <SelectField
                    label="区块纵向节奏"
                    value={draftDocument.components.TextSplitLayout.sectionSpacing}
                    options={COMPONENT_DESIGN_SECTION_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SECTION_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.sectionSpacing = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="网格边界">
                  <BoundsField
                    label="左分栏 / 标题边界"
                    value={draftDocument.components.TextSplitLayout.splitLeftHeadingBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.splitLeftHeadingBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="左分栏 / 正文边界"
                    value={draftDocument.components.TextSplitLayout.splitLeftTextBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.splitLeftTextBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="右分栏 / 正文边界"
                    value={draftDocument.components.TextSplitLayout.splitRightTextBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.splitRightTextBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="右分栏 / 标题边界"
                    value={draftDocument.components.TextSplitLayout.splitRightHeadingBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.splitRightHeadingBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="堆叠居中边界"
                    value={draftDocument.components.TextSplitLayout.stackBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.TextSplitLayout.stackBounds = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}

            {selectedComponent === "HighDensityInfoBlock" ? (
              <>
                <ControlSubsection title="节奏">
                  <SelectField
                    label="标题下间距"
                    value={draftDocument.components.HighDensityInfoBlock.phaseTitleGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.phaseTitleGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="副标题下间距"
                    value={draftDocument.components.HighDensityInfoBlock.subtitleGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.subtitleGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="正文后间距"
                    value={draftDocument.components.HighDensityInfoBlock.titleBodyGap}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.titleBodyGap = value;
                      });
                    }}
                  />
                  <SelectField
                    label="Metadata 进入距离"
                    value={draftDocument.components.HighDensityInfoBlock.itemsTopSpacing}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.itemsTopSpacing = value;
                      });
                    }}
                  />
                  <SelectField
                    label="图片区进入距离"
                    value={draftDocument.components.HighDensityInfoBlock.imageTopSpacing}
                    options={COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.imageTopSpacing = value;
                      });
                    }}
                  />
                  <SelectField
                    label="区块纵向节奏"
                    value={draftDocument.components.HighDensityInfoBlock.sectionSpacing}
                    options={COMPONENT_DESIGN_SECTION_SPACING_TOKENS.map((token) => ({
                      label: COMPONENT_DESIGN_SECTION_SPACING_LABELS[token],
                      value: token,
                    }))}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.sectionSpacing = value;
                      });
                    }}
                  />
                </ControlSubsection>
                <ControlSubsection title="网格边界">
                  <BoundsField
                    label="第一列边界"
                    value={draftDocument.components.HighDensityInfoBlock.leftBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.leftBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="第二列边界"
                    value={draftDocument.components.HighDensityInfoBlock.middleBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.middleBounds = value;
                      });
                    }}
                  />
                  <BoundsField
                    label="第三列边界"
                    value={draftDocument.components.HighDensityInfoBlock.rightBounds}
                    onChange={(value) => {
                      updateDraftDocument((nextDocument) => {
                        nextDocument.components.HighDensityInfoBlock.rightBounds = value;
                      });
                    }}
                  />
                </ControlSubsection>
              </>
            ) : null}
          </ControlBlock>

          <ControlBlock
            title="预览文案"
            description="这里的输入只影响当前 Lab 预览，不会写入页面 JSON。留空时自动回退到“标准样本”或“极端样本”的默认文本。"
          >
            {selectedComponent === "RichParagraph" ? (
              <ControlSubsection title="正文样本">
                <TextareaField
                  label="正文内容覆盖"
                  rows={8}
                  value={previewTextState.RichParagraph.content}
                  placeholder={getRichParagraphBasePreview(selectedVariant).content}
                  onChange={(value) => updatePreviewTextForComponent("RichParagraph", "content", value)}
                />
              </ControlSubsection>
            ) : null}

            {selectedComponent === "ContentCard" ? (
              <ControlSubsection title="图文文案">
                <TextInputField
                  label="标题覆盖"
                  value={previewTextState.ContentCard.title}
                  placeholder={getContentCardBasePreview(selectedVariant).title}
                  onChange={(value) => updatePreviewTextForComponent("ContentCard", "title", value)}
                />
                <TextareaField
                  label="正文覆盖"
                  rows={8}
                  value={previewTextState.ContentCard.description}
                  placeholder={getContentCardBasePreview(selectedVariant).description}
                  onChange={(value) => updatePreviewTextForComponent("ContentCard", "description", value)}
                />
              </ControlSubsection>
            ) : null}

            {selectedComponent === "TextSplitLayout" ? (
              <ControlSubsection title="标题与段落">
                <TextInputField
                  label="标题覆盖"
                  value={previewTextState.TextSplitLayout.heading}
                  placeholder={getTextSplitLayoutBasePreview(selectedVariant).heading}
                  onChange={(value) => updatePreviewTextForComponent("TextSplitLayout", "heading", value)}
                />
                <TextareaField
                  label="段落覆盖"
                  rows={8}
                  value={previewTextState.TextSplitLayout.paragraphs}
                  placeholder={getTextSplitLayoutBasePreview(selectedVariant).paragraphs}
                  onChange={(value) => updatePreviewTextForComponent("TextSplitLayout", "paragraphs", value)}
                />
              </ControlSubsection>
            ) : null}

            {selectedComponent === "HighDensityInfoBlock" ? (
              <>
                <ControlSubsection title="Phase 1">
                  <TextInputField
                    label="Label"
                    value={previewTextState.HighDensityInfoBlock.phase1Label}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase1Label}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase1Label", value)}
                  />
                  <TextInputField
                    label="Title"
                    value={previewTextState.HighDensityInfoBlock.phase1Title}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase1Title}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase1Title", value)}
                  />
                  <TextInputField
                    label="Subtitle"
                    value={previewTextState.HighDensityInfoBlock.phase1Subtitle}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase1Subtitle}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase1Subtitle", value)}
                  />
                  <TextareaField
                    label="Content"
                    rows={5}
                    value={previewTextState.HighDensityInfoBlock.phase1Content}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase1Content}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase1Content", value)}
                  />
                </ControlSubsection>
                <ControlSubsection title="Phase 2">
                  <TextInputField
                    label="Label"
                    value={previewTextState.HighDensityInfoBlock.phase2Label}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase2Label}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase2Label", value)}
                  />
                  <TextInputField
                    label="Title"
                    value={previewTextState.HighDensityInfoBlock.phase2Title}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase2Title}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase2Title", value)}
                  />
                  <TextInputField
                    label="Subtitle"
                    value={previewTextState.HighDensityInfoBlock.phase2Subtitle}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase2Subtitle}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase2Subtitle", value)}
                  />
                  <TextareaField
                    label="Content"
                    rows={5}
                    value={previewTextState.HighDensityInfoBlock.phase2Content}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase2Content}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase2Content", value)}
                  />
                </ControlSubsection>
                <ControlSubsection title="Phase 3">
                  <TextInputField
                    label="Label"
                    value={previewTextState.HighDensityInfoBlock.phase3Label}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase3Label}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase3Label", value)}
                  />
                  <TextInputField
                    label="Title"
                    value={previewTextState.HighDensityInfoBlock.phase3Title}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase3Title}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase3Title", value)}
                  />
                  <TextInputField
                    label="Subtitle"
                    value={previewTextState.HighDensityInfoBlock.phase3Subtitle}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase3Subtitle}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase3Subtitle", value)}
                  />
                  <TextareaField
                    label="Content"
                    rows={5}
                    value={previewTextState.HighDensityInfoBlock.phase3Content}
                    placeholder={getHighDensityInfoBlockBasePreview(selectedVariant).phase3Content}
                    onChange={(value) => updatePreviewTextForComponent("HighDensityInfoBlock", "phase3Content", value)}
                  />
                </ControlSubsection>
              </>
            ) : null}

            <div className="flex flex-wrap gap-3 border-t border-white/8 pt-4">
              <button
                type="button"
                onClick={resetPreviewOverride}
                className="border border-white/10 px-4 py-3 text-textPrimary transition-colors hover:border-white/20 hover:text-white"
              >
                <ActionText>清空文案覆盖</ActionText>
              </button>
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
