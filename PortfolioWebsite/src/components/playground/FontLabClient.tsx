"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import Typography from "@/components/common/Typography";
import { FONT_LAB_UPDATED_EVENT } from "@/components/layout/FontLabGlobalVars";
import { buildFontLabDocumentCssVars } from "@/lib/font-lab-css-vars";
import {
  createDefaultFontLabDocument,
  parseFontLabDocument,
  type FontLabSizeConfig,
} from "@/lib/font-lab-config-schema";
import {
  createDefaultFontLabSampleLayoutState,
  getFontLabActiveSizeConfig,
  updateFontLabActiveSizeConfig,
  updateFontLabPresetWeightOffset,
  updateFontLabSelection,
  type FontLabSampleLayoutState,
} from "@/lib/font-lab-state";
import {
  clampTypographyLatinWeightOffsetSteps,
  getTypographyFontLabSizes,
  getTypographyLatinWeightOffsetRange,
  getTypographyPresetToken,
  isTypographySizeSupported,
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_WEIGHTS,
  type TypographyPreset,
  type TypographySize,
  type TypographyWeight,
} from "@/lib/typography-tokens";

const FALLBACK_CONFIG_PATH = "content/font-lab/font-presets.json";
const FIELD_STEP = "0.001";
const BASELINE_TOLERANCE = 2.5;
const BASELINE_PROBE_ATTRIBUTE = "data-font-lab-baseline-probe";
const DESCENDER_LATIN_CHARS = new Set(["g", "j", "p", "q", "y"]);

const SIZE_LABELS_ZH: Record<TypographySize, string> = {
  caption: "说明",
  label: "标签",
  "body-sm": "小正文",
  body: "正文",
  "body-lg": "大正文",
  "title-sm": "小标题",
  menu: "菜单",
  title: "标题",
  display: "展示标题",
  hero: "主视觉标题",
};

const WEIGHT_LABELS_ZH: Record<TypographyWeight, string> = {
  light: "细",
  regular: "常规",
  medium: "中等",
  strong: "加粗",
  display: "展示",
};

type GuideMetrics = {
  baselinePx: number;
  opticalAlignmentPx: number | null;
  stepPx: number;
};

type StyleWithVars = CSSProperties & Record<string, string>;

type MixedCaseRoleRequirement = {
  preset: TypographyPreset;
  size: TypographySize;
};

type MixedCaseSectionProps = {
  children: ReactNode;
  showBaseline: boolean;
  showOpticalAlignment: boolean;
  showTick: boolean;
  className?: string;
  title: string;
};

const LONG_READING_SAMPLE_TEXT =
  "凌晨四点的工业园区不会给排版留多少容错空间。冷色顶光掠过混凝土立面时，Typography 需要同时承受中文、English、数字、版本信息与场景名的连续混排压力，例如 Lighting review / 雨后工业区 / build 2026.03.12 / Unreal Engine 5.3。只有当这段长文本在换行后依然保持统一左边缘、稳定英文基线与清晰阅读节奏时，当前字号才算真正校准完成。";

const CURRENT_HEADING_SAMPLE_TEXT =
  "Lighting Notes / 雨后工业区 / build 2026.03.12";

const EXTREME_MIXED_TEXT =
  "极端混排测试会把中文（English）、“引号”、A/B、UI、GPU、Lumen、Nanite、5.3ms、128GB、4K HDR 与版本号 build-2026.03.12 全部压进同一段里，用来观察最容易失控的边缘情况。";

const EXTREME_NARROW_TEXT =
  "Pneumonoultramicroscopicsilicovolcanoconiosis 在极窄列宽下依然需要保持清晰断行，同时不能破坏中文左边缘秩序与标题节奏。";

const EXTREME_URL_TEXT =
  "contact@jiangchengyan.dev / review-build v2.4 / frame-001-2048 / assets://lighting/after-rain";

let measurementCanvasContext: CanvasRenderingContext2D | null = null;

function formatPresetLabel(preset: TypographyPreset, labelZh: string) {
  return `${labelZh} / ${preset}`;
}

function formatSizeLabel(size: TypographySize) {
  return `${SIZE_LABELS_ZH[size]} / ${size}`;
}

function formatWeightLabel(weight: TypographyWeight) {
  return `${WEIGHT_LABELS_ZH[weight]} / ${weight}`;
}

function formatLatinWeightOffsetLabel(offset: number) {
  if (offset === 0) {
    return "保持模板默认";
  }

  if (offset > 0) {
    return `英文更粗 ${offset} 档`;
  }

  return `英文更细 ${Math.abs(offset)} 档`;
}

function formatFontSizeNumber(value: number) {
  return `${Number.parseFloat(value.toFixed(4))}`;
}

function parseRemFontSize(value: string) {
  const match = value.trim().match(/^(-?\d*\.?\d+)rem$/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseClampFontSize(value: string) {
  const match = value.trim().match(
    /^clamp\(\s*(-?\d*\.?\d+)rem\s*,\s*(-?\d*\.?\d+)vw\s*,\s*(-?\d*\.?\d+)rem\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  const minRem = Number(match[1]);
  const viewportVw = Number(match[2]);
  const maxRem = Number(match[3]);

  if (
    !Number.isFinite(minRem) ||
    !Number.isFinite(viewportVw) ||
    !Number.isFinite(maxRem)
  ) {
    return null;
  }

  return {
    maxRem,
    minRem,
    viewportVw,
  };
}

function getFixedFontSizeRem(value: string) {
  const parsedRem = parseRemFontSize(value);

  if (parsedRem !== null) {
    return parsedRem;
  }

  const parsedClamp = parseClampFontSize(value);

  if (parsedClamp) {
    return parsedClamp.maxRem;
  }

  return null;
}

function buildFixedFontSize(value: string) {
  const parsed = Number(value.trim());

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return `${formatFontSizeNumber(parsed)}rem`;
}

function isHeadingPreviewSize(size: TypographySize) {
  return size === "title-sm" ||
    size === "menu" ||
    size === "title" ||
    size === "display" ||
    size === "hero";
}

function isFiniteGuideMetrics(
  value: GuideMetrics | null,
): value is GuideMetrics {
  return !!value && Number.isFinite(value.baselinePx) && Number.isFinite(value.stepPx);
}

function parseLineHeightPx(value: string, fontSizePx: number) {
  const parsed = Number.parseFloat(value);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return fontSizePx * 1.2;
}

function getMeasurementContext() {
  if (typeof document === "undefined") {
    return null;
  }

  if (!measurementCanvasContext) {
    const canvas = document.createElement("canvas");
    measurementCanvasContext = canvas.getContext("2d");
  }

  return measurementCanvasContext;
}

function buildCanvasFont(style: CSSStyleDeclaration) {
  if (style.font) {
    return style.font;
  }

  return [
    style.fontStyle,
    style.fontVariant,
    style.fontWeight,
    style.fontStretch,
    style.fontSize,
    style.fontFamily,
  ]
    .filter(Boolean)
    .join(" ");
}

function createBaselineProbe() {
  const probe = document.createElement("span");

  probe.setAttribute(BASELINE_PROBE_ATTRIBUTE, "true");
  probe.setAttribute("aria-hidden", "true");
  probe.textContent = "\u200b";
  Object.assign(probe.style, {
    display: "inline-block",
    width: "1px",
    height: "0",
    margin: "0 -1px 0 0",
    padding: "0",
    border: "0",
    overflow: "hidden",
    lineHeight: "0",
    verticalAlign: "baseline",
    opacity: "0",
    pointerEvents: "none",
  });

  return probe;
}

function removeBaselineProbe(node: HTMLElement) {
  node.querySelectorAll(`[${BASELINE_PROBE_ATTRIBUTE}]`).forEach((element) => {
    element.remove();
  });
}

function isCjkCharacter(char: string) {
  return /[\u3400-\u9fff\uf900-\ufaff]/.test(char);
}

function isVisibleCharacter(char: string) {
  return /\S/.test(char);
}

function selectOpticalReferenceChar(text: string) {
  const chars = Array.from(text);
  const matchers = [
    (char: string) => isCjkCharacter(char),
    (char: string) => /[A-Z]/.test(char),
    (char: string) => /[0-9]/.test(char),
    (char: string) =>
      /[a-z]/.test(char) && !DESCENDER_LATIN_CHARS.has(char),
    (char: string) => /[A-Za-z]/.test(char),
    (char: string) => isVisibleCharacter(char),
  ];

  for (const matcher of matchers) {
    const found = chars.find((char) => matcher(char));

    if (found) {
      return found;
    }
  }

  return null;
}

function measureOpticalAlignmentPx(
  anchor: HTMLElement,
  baselinePx: number,
) {
  const context = getMeasurementContext();
  const anchorStyle = window.getComputedStyle(anchor);
  const referenceChar = selectOpticalReferenceChar(anchor.textContent ?? "");

  if (!context || !referenceChar) {
    return null;
  }

  context.font = buildCanvasFont(anchorStyle);
  const metrics = context.measureText(referenceChar);
  const descent = Number.isFinite(metrics.actualBoundingBoxDescent)
    ? metrics.actualBoundingBoxDescent
    : 0;

  return baselinePx + Math.max(descent, 0);
}

function measureGuideMetrics(node: HTMLElement): GuideMetrics | null {
  removeBaselineProbe(node);

  const runs = Array.from(
    node.querySelectorAll<HTMLElement>(".typography-run"),
  ).filter((run) => run.textContent?.trim() && run.getClientRects().length > 0);

  if (!runs.length) {
    return null;
  }

  const containerRect = node.getBoundingClientRect();
  const firstLineTop = Math.min(
    ...runs.map((run) => run.getBoundingClientRect().top),
  );
  const firstLineRuns = runs.filter(
    (run) => Math.abs(run.getBoundingClientRect().top - firstLineTop) <= BASELINE_TOLERANCE,
  );
  const anchor =
    firstLineRuns.find((run) => run.classList.contains("typography-run--cjk")) ??
    firstLineRuns[0];

  if (!anchor) {
    return null;
  }

  const anchorStyle = window.getComputedStyle(anchor);
  const lineSource = (anchor.closest(".typography-root") as HTMLElement | null) ?? anchor;
  const lineStyle = window.getComputedStyle(lineSource);
  const fontSizePx = Number.parseFloat(anchorStyle.fontSize) || 16;
  const lineHeightPx = parseLineHeightPx(lineStyle.lineHeight, fontSizePx);
  const probe = createBaselineProbe();

  anchor.prepend(probe);
  const probeRect = probe.getBoundingClientRect();
  probe.remove();

  const baselinePx = probeRect.bottom - containerRect.top;
  if (!Number.isFinite(baselinePx)) {
    return null;
  }

  return {
    baselinePx,
    opticalAlignmentPx: measureOpticalAlignmentPx(anchor, baselinePx),
    stepPx: lineHeightPx,
  };
}

function useMeasuredGuideMetrics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<GuideMetrics | null>(null);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    let frameId = 0;
    const measure = () => {
      const nextMetrics = measureGuideMetrics(node);
      setMetrics((current) => {
        if (
          isFiniteGuideMetrics(current) &&
          isFiniteGuideMetrics(nextMetrics) &&
          Math.abs(current.baselinePx - nextMetrics.baselinePx) < 0.5 &&
          Math.abs(
            (current.opticalAlignmentPx ?? current.baselinePx) -
            (nextMetrics.opticalAlignmentPx ?? nextMetrics.baselinePx),
          ) < 0.5 &&
          Math.abs(current.stepPx - nextMetrics.stepPx) < 0.5
        ) {
          return current;
        }

        return nextMetrics;
      });
    };

    const queueMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };

    queueMeasure();

    const observer = new ResizeObserver(queueMeasure);
    observer.observe(node);
    node.querySelectorAll(".typography-root").forEach((element) => {
      observer.observe(element);
    });

    window.addEventListener("resize", queueMeasure);
    void document.fonts.ready.then(queueMeasure).catch(() => {});

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", queueMeasure);
    };
  });

  return {
    containerRef,
    metrics,
  };
}

function getCaseSupportText(requirements: MixedCaseRoleRequirement[]) {
  const unsupportedRequirements = requirements.filter(
    ({ preset, size }) => !isTypographySizeSupported(preset, size),
  );

  if (!unsupportedRequirements.length) {
    return null;
  }

  return `该案例所需的固定角色暂未定义：${unsupportedRequirements
    .map(({ preset, size }) => `${preset} / ${SIZE_LABELS_ZH[size]}`)
    .join("、")}。`;
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
    <label className="flex items-center justify-between gap-4 border-b border-white/8 py-3">
      <Typography
        as="span"
        preset="sans-body"
        size="body-sm"
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

function NumberField({
  helperText,
  label,
  onCommit,
  step = FIELD_STEP,
  value,
}: {
  helperText?: ReactNode;
  label: string;
  onCommit: (value: number) => void;
  step?: string;
  value: number;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const nextValue = draft.trim();

    if (!nextValue) {
      setDraft("0");
      onCommit(0);
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }

    setDraft(String(parsed));
    onCommit(parsed);
  };

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-full border border-white/10 bg-black px-3 py-3"
      />
      {helperText ? (
        <Typography
          as="span"
          preset="sans-body"
          size="caption"
          weight="medium"
          wrapPolicy="prose"
          className="mt-2 block text-textMuted"
        >
          {helperText}
        </Typography>
      ) : null}
    </label>
  );
}

function FontSizeField({
  label,
  onCommit,
  value,
}: {
  label: string;
  onCommit: (value: string) => void;
  value: string;
}) {
  const [draft, setDraft] = useState(() => {
    const fixedRem = getFixedFontSizeRem(value);

    return fixedRem === null ? "1" : formatFontSizeNumber(fixedRem);
  });

  useEffect(() => {
    const fixedRem = getFixedFontSizeRem(value);
    setDraft(fixedRem === null ? "1" : formatFontSizeNumber(fixedRem));
  }, [value]);

  const commitFixed = () => {
    const nextValue = buildFixedFontSize(draft);

    if (!nextValue) {
      const fixedRem = getFixedFontSizeRem(value);
      setDraft(fixedRem === null ? "1" : formatFontSizeNumber(fixedRem));
      return;
    }

    setDraft(formatFontSizeNumber(getFixedFontSizeRem(nextValue) ?? 1));
    onCommit(nextValue);
  };

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitFixed}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-full border border-white/10 bg-black px-3 py-3"
      />
      <Typography
        as="span"
        preset="sans-body"
        size="caption"
        weight="medium"
        wrapPolicy="prose"
        className="mt-2 block text-textMuted"
      >
        固定字号只输入 `rem` 数值，响应式 `clamp(...)` 由代码按该档位默认比例自动生成。
      </Typography>
    </label>
  );
}

function ControlBlock({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
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
          size="body-sm"
          weight="regular"
          wrapPolicy="prose"
          className="mb-4 text-textMuted"
        >
          {description}
        </Typography>
      ) : null}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function GuideRow({
  children,
  showBaseline,
  showOpticalAlignment,
  showTick,
  className,
}: {
  children: ReactNode;
  showBaseline: boolean;
  showOpticalAlignment: boolean;
  showTick: boolean;
  className?: string;
}) {
  const { containerRef, metrics } = useMeasuredGuideMetrics();

  return (
    <div ref={containerRef} className={["relative", className].filter(Boolean).join(" ")}>
      {showOpticalAlignment &&
      isFiniteGuideMetrics(metrics) &&
      Number.isFinite(metrics.opticalAlignmentPx) ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${Math.max((metrics.opticalAlignmentPx ?? 0) - 1, 0)}px, rgba(255, 255, 255, 0.24) ${Math.max((metrics.opticalAlignmentPx ?? 0) - 1, 0)}px, rgba(255, 255, 255, 0.24) ${metrics.opticalAlignmentPx}px, transparent ${metrics.opticalAlignmentPx}px, transparent ${metrics.stepPx}px)`,
            backgroundSize: `100% ${metrics.stepPx}px`,
          }}
        />
      ) : null}
      {showBaseline && isFiniteGuideMetrics(metrics) ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${Math.max(metrics.baselinePx - 1, 0)}px, rgba(255, 122, 89, 0.58) ${Math.max(metrics.baselinePx - 1, 0)}px, rgba(255, 122, 89, 0.58) ${metrics.baselinePx}px, transparent ${metrics.baselinePx}px, transparent ${metrics.stepPx}px)`,
            backgroundSize: `100% ${metrics.stepPx}px`,
          }}
        />
      ) : null}
      {showTick && isFiniteGuideMetrics(metrics) ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 w-4 border-t border-cyan-300/60"
          style={{ top: metrics.baselinePx }}
        />
      ) : null}
      <div className="relative pl-6 md:pl-8">{children}</div>
    </div>
  );
}

function CalibrationCard({
  children,
  showGrid,
  showRunHighlight,
  title,
}: {
  children: ReactNode;
  showGrid: boolean;
  showRunHighlight: boolean;
  title: string;
}) {
  return (
    <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
      <div
        className={[
          "relative p-6 md:p-8",
          showGrid ? "font-lab-grid" : "",
          showRunHighlight ? "font-lab-run-highlight" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Typography
          as="p"
          preset="sans-body"
          size="caption"
          weight="medium"
          wrapPolicy="label"
          className="mb-6 text-textMuted"
        >
          {title}
        </Typography>
        {children}
      </div>
    </div>
  );
}

function UnsupportedCase({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-white/12 px-4 py-4">
      <Typography
        as="p"
        preset="sans-body"
        size="body-sm"
        weight="regular"
        wrapPolicy="prose"
        className="text-textMuted"
      >
        {message}
      </Typography>
    </div>
  );
}

function MixedCaseSection({
  children,
  showBaseline,
  showOpticalAlignment,
  showTick,
  className,
  title,
}: MixedCaseSectionProps) {
  return (
    <section className={["border-b border-white/8 pb-8", className].filter(Boolean).join(" ")}>
      <Typography
        as="p"
        preset="sans-body"
        size="caption"
        weight="medium"
        wrapPolicy="label"
        className="mb-4 text-textMuted"
      >
        {title}
      </Typography>
      <GuideRow
        showBaseline={showBaseline}
        showOpticalAlignment={showOpticalAlignment}
        showTick={showTick}
      >
        {children}
      </GuideRow>
    </section>
  );
}

export default function FontLabClient() {
  const [fontDocument, setFontDocument] = useState<FontLabDocument>(createDefaultFontLabDocument);
  const [layoutState, setLayoutState] = useState<FontLabSampleLayoutState>(
    createDefaultFontLabSampleLayoutState,
  );
  const [savedDocument, setSavedDocument] = useState<FontLabDocument | null>(null);
  const [hasSavedConfig, setHasSavedConfig] = useState(false);
  const [configPath, setConfigPath] = useState(FALLBACK_CONFIG_PATH);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activePreset = fontDocument.activePreset;
  const activeSize = fontDocument.activeSize;
  const presetToken = getTypographyPresetToken(activePreset);
  const fontLabSizes = getTypographyFontLabSizes(activePreset);
  const activePresetConfig = fontDocument.presets[activePreset];
  const activeSizeConfig = getFontLabActiveSizeConfig(fontDocument);
  const activeSemanticWeight = activeSizeConfig.semanticWeight;
  const latinWeightOffsetRange = getTypographyLatinWeightOffsetRange(activePreset);
  const latinWeightOffsetOptions = useMemo(() => {
    const options: number[] = [];

    for (
      let offset = latinWeightOffsetRange.min;
      offset <= latinWeightOffsetRange.max;
      offset += 1
    ) {
      options.push(offset);
    }

    return options;
  }, [latinWeightOffsetRange.max, latinWeightOffsetRange.min]);
  const cssVars = useMemo(
    () => buildFontLabDocumentCssVars(fontDocument) as StyleWithVars,
    [fontDocument],
  );

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-font-lab-mode", "true");

    let active = true;

    async function loadSavedConfig() {
      try {
        const response = await fetch("/api/font-lab", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load Font Lab config");
        }

        const payload = (await response.json()) as {
          config?: unknown;
          hasSaved?: boolean;
          path?: string;
        };
        const nextDocument =
          parseFontLabDocument(payload.config) ?? createDefaultFontLabDocument();

        if (!active) {
          return;
        }

        setFontDocument(nextDocument);
        setSavedDocument(nextDocument);
        setHasSavedConfig(Boolean(payload.hasSaved));
        setConfigPath(payload.path ?? FALLBACK_CONFIG_PATH);
      } catch {
        if (!active) {
          return;
        }

        const defaultDocument = createDefaultFontLabDocument();
        setFontDocument(defaultDocument);
        setSavedDocument(defaultDocument);
        setHasSavedConfig(false);
        setConfigPath(FALLBACK_CONFIG_PATH);
        setStatusMessage("未能读取已保存配置，已回退到默认模板。");
      }
    }

    void loadSavedConfig();

    return () => {
      active = false;
      htmlElement.removeAttribute("data-font-lab-mode");
    };
  }, []);

  const handleSave = async () => {
    setStatusMessage("正在保存当前字体模板...");

    try {
      const response = await fetch("/api/font-lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activePreset,
          activeSize,
          labelZh: activePresetConfig.labelZh,
          latinWeightOffsetSteps: activePresetConfig.latinWeightOffsetSteps,
          sizeConfig: activeSizeConfig,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Font Lab config");
      }

      const payload = (await response.json()) as {
        config?: unknown;
        path?: string;
      };
      const persistedDocument =
        parseFontLabDocument(payload.config) ?? fontDocument;
      const persistedCssVars = buildFontLabDocumentCssVars(persistedDocument);

      setSavedDocument(persistedDocument);
      setHasSavedConfig(true);
      setConfigPath(payload.path ?? FALLBACK_CONFIG_PATH);
      setStatusMessage(`已保存当前模板：${activePresetConfig.labelZh}`);
      window.dispatchEvent(
        new CustomEvent(FONT_LAB_UPDATED_EVENT, {
          detail: persistedCssVars,
        }),
      );
    } catch {
      setStatusMessage("保存失败，请检查本地编辑模式是否已开启。");
    }
  };

  const handleRestore = () => {
    if (!savedDocument) {
      return;
    }

    setFontDocument(savedDocument);
    setStatusMessage(`已恢复 ${configPath} 中的模板配置。`);
  };

  const updateCurrentSizeConfig = (patch: Partial<FontLabSizeConfig>) => {
    setFontDocument((current) =>
      updateFontLabActiveSizeConfig(current, current.activePreset, current.activeSize, patch),
    );
  };

  const titleSubtitleSupportMessage = getCaseSupportText([
    { preset: "luna-editorial", size: "display" },
    { preset: "luna-editorial", size: "title" },
  ]);
  const titleBodySupportMessage = getCaseSupportText([
    { preset: "luna-editorial", size: "title" },
    { preset: "sans-body", size: "body" },
  ]);
  const titleMetaSupportMessage = getCaseSupportText([
    { preset: "sans-body", size: "title" },
    { preset: "gothic-editorial", size: "label" },
    { preset: "sans-body", size: "caption" },
  ]);
  const menuLabelSupportMessage = getCaseSupportText([
    { preset: "classical-display", size: "menu" },
    { preset: "sans-body", size: "label" },
  ]);
  const bodyUrlSupportMessage = getCaseSupportText([
    { preset: "sans-body", size: "body" },
    { preset: "sans-body", size: "body-sm" },
  ]);
  const bodyMixedSupportMessage = getCaseSupportText([
    { preset: "sans-body", size: "body" },
  ]);

  return (
    <main
      className="min-h-screen bg-black pb-20 pt-24 text-white md:pb-24 md:pt-32"
      style={cssVars}
    >
      <div className="grid-container items-start gap-y-10">
        <aside className="col-span-12 self-start space-y-4 lg:col-span-4">
          <div className="border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.015)_100%)] px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography
                  as="p"
                  preset="sans-body"
                  size="caption"
                  weight="medium"
                  wrapPolicy="label"
                  className="text-textMuted"
                >
                  内部字体校准台
                </Typography>
                <Typography
                  as="h1"
                  preset="luna-editorial"
                  size="title"
                  weight="strong"
                  wrapPolicy="heading"
                  className="mt-3 text-white"
                >
                  Font Lab
                </Typography>
              </div>
              <Link href="/playground" className="transition-colors hover:text-white">
                <ActionText>返回 Playground</ActionText>
              </Link>
            </div>
            <Typography
              as="p"
              preset="sans-body"
              size="body-sm"
              weight="regular"
              wrapPolicy="prose"
              className="mt-4 text-textMuted"
            >
              这里用于校准字体模板本体。保存时只合并当前模板；调试层仅影响当前会话，不写入模板文件。
            </Typography>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex min-h-[4.75rem] min-w-[11.75rem] items-center justify-center border border-white/12 px-6 py-3 text-center text-textPrimary transition-colors hover:border-white/25 hover:text-white"
              >
                <ActionText>保存当前模板</ActionText>
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!hasSavedConfig}
                className="inline-flex min-h-[4.75rem] min-w-[11.75rem] items-center justify-center border border-white/12 px-6 py-3 text-center text-textPrimary transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ActionText>恢复已保存模板</ActionText>
              </button>
            </div>
            <div className="mt-5 space-y-2">
              <StatusText>{statusMessage ?? `配置文件：${configPath}`}</StatusText>
              <StatusText>{`当前模板：${activePresetConfig.labelZh} / 当前字号：${SIZE_LABELS_ZH[activeSize]}`}</StatusText>
              <StatusText>{`当前字号语义字重：${WEIGHT_LABELS_ZH[activeSemanticWeight]}`}</StatusText>
              <StatusText>URL 已保持干净，不再写入任何查询参数。</StatusText>
            </div>
          </div>

          <ControlBlock
            title="字体模板"
            description="这里保存模板级与字号级微调。中英字重偏差只在模板层生效；每个字号档位单独保存自己的语义字重、基线、字距与水平对齐。"
          >
            <label className="block">
              <FieldLabel>字体模板</FieldLabel>
              <select
                value={activePreset}
                onChange={(event) =>
                  setFontDocument((current) =>
                    updateFontLabSelection(
                      current,
                      event.target.value as TypographyPreset,
                      current.activeSize,
                    ),
                  )
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {TYPOGRAPHY_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {formatPresetLabel(preset, fontDocument.presets[preset].labelZh)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <FieldLabel>字号档位</FieldLabel>
              <select
                value={activeSize}
                onChange={(event) =>
                  setFontDocument((current) =>
                    updateFontLabSelection(
                      current,
                      current.activePreset,
                      event.target.value as TypographySize,
                    ),
                  )
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {fontLabSizes.map((size) => (
                  <option key={size} value={size}>
                    {formatSizeLabel(size)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <FieldLabel>当前字号语义字重</FieldLabel>
              <select
                value={activeSemanticWeight}
                onChange={(event) =>
                  updateCurrentSizeConfig({
                    semanticWeight: event.target.value as TypographyWeight,
                  })
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {TYPOGRAPHY_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {formatWeightLabel(weight)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <FieldLabel>中英字重偏差</FieldLabel>
              <select
                value={activePresetConfig.latinWeightOffsetSteps}
                onChange={(event) =>
                  setFontDocument((current) =>
                    updateFontLabPresetWeightOffset(
                      current,
                      current.activePreset,
                      clampTypographyLatinWeightOffsetSteps(
                        current.activePreset,
                        Number(event.target.value),
                      ),
                    ),
                  )
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {latinWeightOffsetOptions.map((offset) => (
                  <option key={offset} value={offset}>
                    {formatLatinWeightOffsetLabel(offset)}
                  </option>
                ))}
              </select>
              <Typography
                as="span"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="prose"
                className="mt-2 block text-textMuted"
              >
                {`该模板当前提供 ${presetToken.availableWeights.latin.length} 档英文可用字重；偏差会统一作用到全部语义字重槽位。`}
              </Typography>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <FontSizeField
                label="字号"
                value={activeSizeConfig.fontSize}
                onCommit={(fontSize) => updateCurrentSizeConfig({ fontSize })}
              />

              <NumberField
                label="行高"
                value={activeSizeConfig.lineHeight}
                onCommit={(lineHeight) => updateCurrentSizeConfig({ lineHeight })}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <NumberField
                label="英文相对基线偏移"
                value={activeSizeConfig.latinRelativeOffset}
                onCommit={(latinRelativeOffset) =>
                  updateCurrentSizeConfig({ latinRelativeOffset })
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <NumberField
                label="中文基准校正（高级）"
                value={activeSizeConfig.cjkVerticalOffset}
                onCommit={(cjkVerticalOffset) =>
                  updateCurrentSizeConfig({ cjkVerticalOffset })
                }
                helperText="常规保持 0。改这个值会连同参考线一起移动整行中文锚点。"
              />

              <NumberField
                label="中文水平对齐"
                value={activeSizeConfig.cjkHorizontalOffset}
                onCommit={(cjkHorizontalOffset) =>
                  updateCurrentSizeConfig({ cjkHorizontalOffset })
                }
                helperText="负值向左，正值向右。用于修正中文行首的实际落点。"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <NumberField
                label="英文水平对齐"
                value={activeSizeConfig.latinHorizontalOffset}
                onCommit={(latinHorizontalOffset) =>
                  updateCurrentSizeConfig({ latinHorizontalOffset })
                }
                helperText="负值向左，正值向右。用于修正英文在同一左边缘上的起笔位置。"
              />

              <NumberField
                label="中文字距"
                value={activeSizeConfig.cjkLetterSpacing}
                onCommit={(cjkLetterSpacing) =>
                  updateCurrentSizeConfig({ cjkLetterSpacing })
                }
              />
            </div>

            <NumberField
              label="英文字距"
              value={activeSizeConfig.latinLetterSpacing}
              onCommit={(latinLetterSpacing) =>
                updateCurrentSizeConfig({ latinLetterSpacing })
              }
            />
          </ControlBlock>

          <ControlBlock title="调试层">
            <ToggleField
              checked={layoutState.showGrid}
              label="显示网格"
              onChange={(value) =>
                setLayoutState((current) => ({ ...current, showGrid: value }))
              }
            />
            <ToggleField
              checked={layoutState.showBaseline}
              label="显示逐行基线"
              onChange={(value) =>
                setLayoutState((current) => ({ ...current, showBaseline: value }))
              }
            />
            <ToggleField
              checked={layoutState.showOpticalAlignment}
              label="显示光学对齐线"
              onChange={(value) =>
                setLayoutState((current) => ({ ...current, showOpticalAlignment: value }))
              }
            />
            <ToggleField
              checked={layoutState.showLeftEdge}
              label="显示共享左对齐线"
              onChange={(value) =>
                setLayoutState((current) => ({ ...current, showLeftEdge: value }))
              }
            />
            <ToggleField
              checked={layoutState.showRunHighlight}
              label="高亮脚本分段"
              onChange={(value) =>
                setLayoutState((current) => ({ ...current, showRunHighlight: value }))
              }
            />
          </ControlBlock>
        </aside>

        <section className="col-span-12 lg:col-span-8">
          <div className="relative w-full space-y-8">
            {layoutState.showLeftEdge ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 top-0 left-6 border-l border-dashed border-cyan-300/55 md:left-8"
              />
            ) : null}

            <CalibrationCard
              title="当前字号样本"
              showGrid={layoutState.showGrid}
              showRunHighlight={layoutState.showRunHighlight}
            >
              {isHeadingPreviewSize(activeSize) ? (
                <GuideRow
                  showBaseline={layoutState.showBaseline}
                  showOpticalAlignment={layoutState.showOpticalAlignment}
                  showTick={layoutState.showLeftEdge}
                >
                  <Typography
                    as="p"
                    preset={activePreset}
                    size={activeSize}
                    weight={activeSemanticWeight}
                    wrapPolicy="heading"
                    className="max-w-full text-white"
                  >
                    {CURRENT_HEADING_SAMPLE_TEXT}
                  </Typography>
                </GuideRow>
              ) : (
                <GuideRow
                  showBaseline={layoutState.showBaseline}
                  showOpticalAlignment={layoutState.showOpticalAlignment}
                  showTick={layoutState.showLeftEdge}
                >
                  <Typography
                    as="p"
                    preset={activePreset}
                    size={activeSize}
                    weight={activeSemanticWeight}
                    wrapPolicy="prose"
                    className="max-w-[56ch] text-textPrimary"
                  >
                    {LONG_READING_SAMPLE_TEXT}
                  </Typography>
                </GuideRow>
              )}
            </CalibrationCard>

            <CalibrationCard
              title="极端情况"
              showGrid={layoutState.showGrid}
              showRunHighlight={layoutState.showRunHighlight}
            >
              <div className="space-y-6">
                <GuideRow
                  showBaseline={layoutState.showBaseline}
                  showOpticalAlignment={layoutState.showOpticalAlignment}
                  showTick={layoutState.showLeftEdge}
                >
                  <Typography
                    as="p"
                    preset={activePreset}
                    size={activeSize}
                    weight={activeSemanticWeight}
                    wrapPolicy="prose"
                    className="text-textPrimary"
                  >
                    {EXTREME_MIXED_TEXT}
                  </Typography>
                </GuideRow>

                <GuideRow
                  showBaseline={layoutState.showBaseline}
                  showOpticalAlignment={layoutState.showOpticalAlignment}
                  showTick={layoutState.showLeftEdge}
                >
                  <Typography
                    as="p"
                    preset={activePreset}
                    size={activeSize}
                    weight={activeSemanticWeight}
                    wrapPolicy="heading"
                    className="max-w-[18ch] text-textPrimary"
                  >
                    {EXTREME_NARROW_TEXT}
                  </Typography>
                </GuideRow>

                <GuideRow
                  showBaseline={layoutState.showBaseline}
                  showOpticalAlignment={layoutState.showOpticalAlignment}
                  showTick={layoutState.showLeftEdge}
                >
                  <Typography
                    as="p"
                    preset={activePreset}
                    size={activeSize}
                    weight={activeSemanticWeight}
                    wrapPolicy="url"
                    numericStyle="tabular"
                    className="text-textPrimary"
                  >
                    {EXTREME_URL_TEXT}
                  </Typography>
                </GuideRow>
              </div>
            </CalibrationCard>

            <CalibrationCard
              title="全局混排校验"
              showGrid={layoutState.showGrid}
              showRunHighlight={layoutState.showRunHighlight}
            >
              <div className="space-y-8">
                <Typography
                  as="p"
                  preset="sans-body"
                  size="body-sm"
                  weight="regular"
                  wrapPolicy="prose"
                  className="max-w-[44rem] text-textMuted"
                >
                  这里保留真实系统角色的固定组合，用来验证跨模板共存时的结果。它会继续读取当前已保存的模板细节，但不会整块改成你当前正在编辑的字号档位。
                </Typography>
                {titleSubtitleSupportMessage ? (
                  <UnsupportedCase message={titleSubtitleSupportMessage} />
                ) : (
                  <MixedCaseSection
                    title="标题 + 小标题"
                    showBaseline={layoutState.showBaseline}
                    showOpticalAlignment={layoutState.showOpticalAlignment}
                    showTick={layoutState.showLeftEdge}
                  >
                    <div className="flex max-w-[44rem] flex-wrap items-baseline gap-x-6 gap-y-4">
                      <Typography
                        as="span"
                        preset="luna-editorial"
                        size="display"
                        weight="display"
                        wrapPolicy="nowrap"
                        className="text-white"
                      >
                        After Rain
                      </Typography>
                      <span className="inline-block w-6" />
                      <Typography
                        as="span"
                        preset="luna-editorial"
                        size="title"
                        weight="strong"
                        wrapPolicy="nowrap"
                        className="text-textMuted"
                        style={{ lineHeight: 1 }}
                      >
                        雨后余光
                      </Typography>
                    </div>
                  </MixedCaseSection>
                )}

                {titleBodySupportMessage ? (
                  <UnsupportedCase message={titleBodySupportMessage} />
                ) : (
                  <MixedCaseSection
                    title="标题 + 正文"
                    showBaseline={layoutState.showBaseline}
                    showOpticalAlignment={layoutState.showOpticalAlignment}
                    showTick={layoutState.showLeftEdge}
                  >
                    <div className="flex max-w-[52rem] flex-wrap items-baseline gap-x-6 gap-y-4">
                      <Typography
                        as="span"
                        preset="luna-editorial"
                        size="title"
                        weight="display"
                        wrapPolicy="nowrap"
                        className="text-white"
                      >
                        Lighting Notes
                      </Typography>
                      <span className="inline-block w-6" />
                      <Typography
                        as="span"
                        preset="sans-body"
                        size="body"
                        weight="regular"
                        wrapPolicy="prose"
                        className="max-w-[28ch] text-textPrimary"
                        style={{ lineHeight: 1.2 }}
                      >
                        标题后接正文短句，用来检查展示标题与正文同处一行时的真实关系。
                      </Typography>
                    </div>
                  </MixedCaseSection>
                )}

                {titleMetaSupportMessage ? (
                  <UnsupportedCase message={titleMetaSupportMessage} />
                ) : (
                  <MixedCaseSection
                    title="标题 + Meta / 日期 / 版本号"
                    showBaseline={layoutState.showBaseline}
                    showOpticalAlignment={layoutState.showOpticalAlignment}
                    showTick={layoutState.showLeftEdge}
                  >
                    <div className="flex max-w-[52rem] flex-wrap items-baseline gap-x-6 gap-y-4">
                      <Typography
                        as="span"
                        preset="sans-body"
                        size="title"
                        weight="display"
                        wrapPolicy="nowrap"
                        className="text-white"
                      >
                        Light Study
                      </Typography>
                      <span className="inline-block w-6" />
                      <Typography
                        as="span"
                        preset="gothic-editorial"
                        size="label"
                        weight="medium"
                        wrapPolicy="nowrap"
                        className="text-textPrimary"
                        style={{ lineHeight: 1 }}
                      >
                        Lighting Direction
                      </Typography>
                      <span className="inline-block w-4" />
                      <Typography
                        as="span"
                        preset="sans-body"
                        size="caption"
                        weight="medium"
                        wrapPolicy="nowrap"
                        numericStyle="tabular"
                        className="text-textMuted"
                        style={{ lineHeight: 1 }}
                      >
                        2026.03.11 / build v2.1 / 01
                      </Typography>
                    </div>
                  </MixedCaseSection>
                )}

                {menuLabelSupportMessage ? (
                  <UnsupportedCase message={menuLabelSupportMessage} />
                ) : (
                  <MixedCaseSection
                    title="菜单 + Label"
                    showBaseline={layoutState.showBaseline}
                    showOpticalAlignment={layoutState.showOpticalAlignment}
                    showTick={layoutState.showLeftEdge}
                  >
                    <div className="flex max-w-[48rem] flex-wrap items-baseline gap-x-6 gap-y-4">
                      <Typography
                        as="span"
                        preset="classical-display"
                        size="menu"
                        weight="regular"
                        wrapPolicy="nowrap"
                        className="text-white"
                      >
                        MENU
                      </Typography>
                      <span className="inline-block w-6" />
                      <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="medium"
                        wrapPolicy="nowrap"
                        className="text-textMuted"
                        style={{ lineHeight: 1 }}
                      >
                        Navigation Trigger
                      </Typography>
                    </div>
                  </MixedCaseSection>
                )}

                {bodyUrlSupportMessage ? (
                  <UnsupportedCase message={bodyUrlSupportMessage} />
                ) : (
                  <section className="border-b border-white/8 pb-8">
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="caption"
                      weight="medium"
                      wrapPolicy="label"
                      className="mb-4 text-textMuted"
                    >
                      正文 + URL
                    </Typography>
                    <div className="space-y-4">
                      <GuideRow
                        showBaseline={layoutState.showBaseline}
                        showOpticalAlignment={layoutState.showOpticalAlignment}
                        showTick={layoutState.showLeftEdge}
                      >
                        <Typography
                          as="p"
                          preset="sans-body"
                          size="body"
                          weight="regular"
                          wrapPolicy="prose"
                          className="max-w-[42rem] text-textPrimary"
                        >
                          该案例用于检查正文说明与 URL 行在真实字号下的间距、基线与换行边界。
                        </Typography>
                      </GuideRow>
                      <GuideRow
                        showBaseline={layoutState.showBaseline}
                        showOpticalAlignment={layoutState.showOpticalAlignment}
                        showTick={layoutState.showLeftEdge}
                      >
                        <Typography
                          as="p"
                          preset="sans-body"
                          size="body-sm"
                          weight="regular"
                          wrapPolicy="url"
                          className="max-w-[42rem] text-textMuted"
                        >
                          jiangchengyan.dev/works/lighting
                        </Typography>
                      </GuideRow>
                    </div>
                  </section>
                )}

                {bodyMixedSupportMessage ? (
                  <UnsupportedCase message={bodyMixedSupportMessage} />
                ) : (
                  <MixedCaseSection
                    title="正文 + 中英数字混排"
                    showBaseline={layoutState.showBaseline}
                    showOpticalAlignment={layoutState.showOpticalAlignment}
                    showTick={layoutState.showLeftEdge}
                    className="border-b-0 pb-0"
                  >
                    <Typography
                      as="p"
                      preset="sans-body"
                      size="body"
                      weight="regular"
                      wrapPolicy="prose"
                      className="max-w-[44rem] text-textPrimary"
                    >
                      第 03 幕在 2026 年 03 月 11 日完成 A/B 版本对齐，目标是在中文、English、UI、4K HDR 与 128GB 这类信息并存时仍然保持统一节奏。
                    </Typography>
                  </MixedCaseSection>
                )}
              </div>
            </CalibrationCard>

            <div className="border border-white/10 bg-white/[0.02] px-5 py-5">
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="regular"
                wrapPolicy="prose"
                className="text-textMuted"
              >
                真实组件预览已移出本页。需要做最终组件验收时，请进入 Playground 统一检查页面模块，而不是在 Font Lab 内直接注入真实组件。
              </Typography>
              <Link
                href="/playground"
                className="mt-6 inline-flex items-center border border-white/12 px-4 py-3 text-textPrimary transition-colors hover:border-white/25 hover:text-white"
              >
                <ActionText>打开 Playground 做组件验收</ActionText>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
