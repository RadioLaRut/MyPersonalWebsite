"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ContentCard from "@/components/breakdowns/ContentCard";
import Typography, { TypographyProvider } from "@/components/common/Typography";
import HeroSection from "@/components/home/HeroSection";
import LightingCollectionHeader from "@/components/works/LightingCollectionHeader";
import LightingProjectCard from "@/components/works/LightingProjectCard";
import PortfolioHeroHeader from "@/components/works/PortfolioHeroHeader";
import WorksListEntry from "@/components/works/WorksListEntry";
import {
  getTypographyMetricsToken,
  getTypographyPresetToken,
  getTypographySizeToken,
  TYPOGRAPHY_PRESETS,
  TYPOGRAPHY_WEIGHTS,
  TYPOGRAPHY_WRAP_POLICIES,
  type TypographyAutospace,
  type TypographyNumericStyle,
  type TypographyPreset,
  type TypographySize,
  type TypographyWeight,
  type TypographyWrapPolicy,
} from "@/lib/typography-tokens";
import {
  isTypographyAutospace,
  isTypographyNumericStyle,
  isTypographyPreset,
  isTypographySize,
  isTypographyWeight,
  isTypographyWrapPolicy,
} from "@/lib/typography";

type FontLabState = {
  align: "left" | "center" | "right";
  autospace: TypographyAutospace;
  cjkBaselineOffset: number;
  cjkLetterSpacing: number;
  fontSize: string;
  latinBaselineOffset: number;
  latinLetterSpacing: number;
  lineHeight: number;
  numericStyle: TypographyNumericStyle;
  preset: TypographyPreset;
  previewWidth: number;
  showBaseline: boolean;
  showGrid: boolean;
  showLeftEdge: boolean;
  showRunHighlight: boolean;
  size: TypographySize;
  tracking: number;
  weight: TypographyWeight;
  wrapPolicy: TypographyWrapPolicy;
};

function parseBoolean(value: string | null, fallback: boolean) {
  if (value == null) {
    return fallback;
  }

  return value === "1";
}

function parseNumber(value: string | null, fallback: number) {
  if (value == null) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createInitialState(): FontLabState {
  const fallbackPreset: TypographyPreset = "sans-body";
  const fallbackSize: TypographySize = "body";
  const sizeToken = getTypographySizeToken(fallbackSize);
  const metricsToken = getTypographyMetricsToken(fallbackPreset, fallbackSize);

  if (typeof window === "undefined") {
    return {
      align: "left",
      autospace: "off",
      cjkBaselineOffset: Number.parseFloat(metricsToken.cjkBaselineOffset),
      cjkLetterSpacing: Number.parseFloat(metricsToken.cjkLetterSpacing),
      fontSize: sizeToken.fontSize,
      latinBaselineOffset: Number.parseFloat(metricsToken.latinBaselineOffset),
      latinLetterSpacing: Number.parseFloat(metricsToken.latinLetterSpacing),
      lineHeight: Number.parseFloat(sizeToken.lineHeight),
      numericStyle: "default",
      preset: fallbackPreset,
      previewWidth: 960,
      showBaseline: true,
      showGrid: false,
      showLeftEdge: true,
      showRunHighlight: false,
      size: fallbackSize,
      tracking: Number.parseFloat(sizeToken.letterSpacing),
      weight: "regular",
      wrapPolicy: "prose",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const preset = params.get("preset");
  const size = params.get("size");
  const weight = params.get("weight");
  const wrapPolicy = params.get("wrap");
  const autospace = params.get("autospace");
  const numeric = params.get("numeric");
  const resolvedPreset = preset && isTypographyPreset(preset) ? preset : fallbackPreset;
  const resolvedSize = size && isTypographySize(size) ? size : fallbackSize;
  const resolvedWeight = weight && isTypographyWeight(weight) ? weight : "regular";
  const resolvedWrap = wrapPolicy && isTypographyWrapPolicy(wrapPolicy) ? wrapPolicy : "prose";
  const resolvedAutospace =
    autospace && isTypographyAutospace(autospace) ? autospace : "off";
  const resolvedNumeric =
    numeric && isTypographyNumericStyle(numeric) ? numeric : "default";
  const resolvedSizeToken = getTypographySizeToken(resolvedSize);
  const resolvedMetrics = getTypographyMetricsToken(resolvedPreset, resolvedSize);

  return {
    align:
      params.get("align") === "center" || params.get("align") === "right"
        ? (params.get("align") as "center" | "right")
        : "left",
    autospace: resolvedAutospace,
    cjkBaselineOffset: parseNumber(
      params.get("cjkBaseline"),
      Number.parseFloat(resolvedMetrics.cjkBaselineOffset),
    ),
    cjkLetterSpacing: parseNumber(
      params.get("cjkTracking"),
      Number.parseFloat(resolvedMetrics.cjkLetterSpacing),
    ),
    fontSize: params.get("fontSize") ?? resolvedSizeToken.fontSize,
    latinBaselineOffset: parseNumber(
      params.get("latinBaseline"),
      Number.parseFloat(resolvedMetrics.latinBaselineOffset),
    ),
    latinLetterSpacing: parseNumber(
      params.get("latinTracking"),
      Number.parseFloat(resolvedMetrics.latinLetterSpacing),
    ),
    lineHeight: parseNumber(
      params.get("lineHeight"),
      Number.parseFloat(resolvedSizeToken.lineHeight),
    ),
    numericStyle: resolvedNumeric,
    preset: resolvedPreset,
    previewWidth: parseNumber(params.get("width"), 960),
    showBaseline: parseBoolean(params.get("baseline"), true),
    showGrid: parseBoolean(params.get("grid"), false),
    showLeftEdge: parseBoolean(params.get("edge"), true),
    showRunHighlight: parseBoolean(params.get("runs"), false),
    size: resolvedSize,
    tracking: parseNumber(
      params.get("tracking"),
      Number.parseFloat(resolvedSizeToken.letterSpacing),
    ),
    weight: resolvedWeight,
    wrapPolicy: resolvedWrap,
  };
}

function stringifyState(state: FontLabState) {
  const params = new URLSearchParams();
  params.set("preset", state.preset);
  params.set("size", state.size);
  params.set("weight", state.weight);
  params.set("wrap", state.wrapPolicy);
  params.set("align", state.align);
  params.set("autospace", state.autospace);
  params.set("numeric", state.numericStyle);
  params.set("width", String(state.previewWidth));
  params.set("fontSize", state.fontSize);
  params.set("lineHeight", String(state.lineHeight));
  params.set("tracking", String(state.tracking));
  params.set("latinBaseline", String(state.latinBaselineOffset));
  params.set("cjkBaseline", String(state.cjkBaselineOffset));
  params.set("latinTracking", String(state.latinLetterSpacing));
  params.set("cjkTracking", String(state.cjkLetterSpacing));
  params.set("grid", state.showGrid ? "1" : "0");
  params.set("baseline", state.showBaseline ? "1" : "0");
  params.set("edge", state.showLeftEdge ? "1" : "0");
  params.set("runs", state.showRunHighlight ? "1" : "0");
  return params.toString();
}

function buildCssVars(state: FontLabState) {
  return {
    [`--typography-size-${state.size}-font-size`]: state.fontSize,
    [`--typography-size-${state.size}-letter-spacing`]: `${state.tracking}em`,
    [`--typography-size-${state.size}-line-height`]: String(state.lineHeight),
    [`--typography-${state.preset}-${state.size}-cjk-baseline-offset`]:
      `${state.cjkBaselineOffset}em`,
    [`--typography-${state.preset}-${state.size}-cjk-letter-spacing`]:
      `${state.cjkLetterSpacing}em`,
    [`--typography-${state.preset}-${state.size}-latin-baseline-offset`]:
      `${state.latinBaselineOffset}em`,
    [`--typography-${state.preset}-${state.size}-latin-letter-spacing`]:
      `${state.latinLetterSpacing}em`,
  } as Record<string, string>;
}

function buildPreviewOverrides(state: FontLabState) {
  return {
    forcePreset: state.preset,
    forceSize: state.size,
    forceWeight: state.weight,
    [state.preset]: {
      autospace: state.autospace,
      cjkBaselineOffset: `${state.cjkBaselineOffset}em`,
      cjkLetterSpacing: `${state.cjkLetterSpacing}em`,
      latinBaselineOffset: `${state.latinBaselineOffset}em`,
      latinLetterSpacing: `${state.latinLetterSpacing}em`,
      numericStyle: state.numericStyle,
    },
    sizeOverrides: {
      [state.size]: {
        fontSize: state.fontSize,
        letterSpacing: `${state.tracking}em`,
        lineHeight: String(state.lineHeight),
      },
    },
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
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

function ActionText({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      as="span"
      preset="sans-body"
      size="caption"
      weight="medium"
      wrapPolicy="label"
      className="text-current"
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

function ControlBlock({
  children,
  title,
}: {
  children: React.ReactNode;
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
        className="mb-4 text-textMuted"
      >
        {title}
      </Typography>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function FontLabClient() {
  const [state, setState] = useState<FontLabState>(createInitialState);
  const presetToken = getTypographyPresetToken(state.preset);
  const metricsToken = getTypographyMetricsToken(state.preset, state.size);
  const sizeToken = getTypographySizeToken(state.size);
  const cssVars = useMemo(() => buildCssVars(state), [state]);
  const previewOverrides = useMemo(() => buildPreviewOverrides(state), [state]);
  const supportedSizes = presetToken.supportedSizes;

  useEffect(() => {
    const query = stringifyState(state);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(cssVars);

    entries.forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      entries.forEach(([key]) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVars]);

  const copyTokenConfig = async () => {
    const payload = {
      preset: state.preset,
      presetLabel: presetToken.label,
      size: state.size,
      sizeToken: {
        defaultFontSize: sizeToken.fontSize,
        defaultLetterSpacing: sizeToken.letterSpacing,
        defaultLineHeight: sizeToken.lineHeight,
        overrideFontSize: state.fontSize,
        overrideLetterSpacing: `${state.tracking}em`,
        overrideLineHeight: state.lineHeight,
      },
      weight: state.weight,
      wrapPolicy: state.wrapPolicy,
      autospace: state.autospace,
      numericStyle: state.numericStyle,
    };

    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  const copyMetricsConfig = async () => {
    const payload = {
      preset: state.preset,
      size: state.size,
      defaults: metricsToken,
      overrides: {
        cjkBaselineOffset: `${state.cjkBaselineOffset}em`,
        cjkLetterSpacing: `${state.cjkLetterSpacing}em`,
        latinBaselineOffset: `${state.latinBaselineOffset}em`,
        latinLetterSpacing: `${state.latinLetterSpacing}em`,
      },
    };

    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 md:pt-32 md:pb-24">
      <div className="grid-container items-start gap-y-10">
        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 self-start space-y-4">
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
                  INTERNAL TYPOGRAPHY WORKBENCH
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
              当前页面会把选中的 token 覆盖写入页面级 CSS 变量。顶部全局导航也会同步吃到这些覆盖。
            </Typography>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyTokenConfig}
                className="border border-white/12 px-4 py-3 text-textPrimary transition-colors hover:border-white/25 hover:text-white"
              >
                <ActionText>复制 Token 配置</ActionText>
              </button>
              <button
                type="button"
                onClick={copyMetricsConfig}
                className="border border-white/12 px-4 py-3 text-textPrimary transition-colors hover:border-white/25 hover:text-white"
              >
                <ActionText>复制 Metrics 配置</ActionText>
              </button>
            </div>
          </div>

          <ControlBlock title="组合">
            <label className="block">
              <FieldLabel>Preset</FieldLabel>
              <select
                value={state.preset}
                onChange={(event) => {
                  const nextPreset = event.target.value as TypographyPreset;
                  const nextPresetToken = getTypographyPresetToken(nextPreset);
                  const nextSize = nextPresetToken.supportedSizes.includes(state.size)
                    ? state.size
                    : nextPresetToken.supportedSizes[0];
                  const nextSizeToken = getTypographySizeToken(nextSize);
                  const nextMetrics = getTypographyMetricsToken(nextPreset, nextSize);
                  setState((current) => ({
                    ...current,
                    cjkBaselineOffset: Number.parseFloat(nextMetrics.cjkBaselineOffset),
                    cjkLetterSpacing: Number.parseFloat(nextMetrics.cjkLetterSpacing),
                    fontSize: nextSizeToken.fontSize,
                    latinBaselineOffset: Number.parseFloat(nextMetrics.latinBaselineOffset),
                    latinLetterSpacing: Number.parseFloat(nextMetrics.latinLetterSpacing),
                    lineHeight: Number.parseFloat(nextSizeToken.lineHeight),
                    preset: nextPreset,
                    size: nextSize,
                    tracking: Number.parseFloat(nextSizeToken.letterSpacing),
                  }));
                }}
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {TYPOGRAPHY_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Size</FieldLabel>
              <select
                value={state.size}
                onChange={(event) => {
                  const nextSize = event.target.value as TypographySize;
                  const nextSizeToken = getTypographySizeToken(nextSize);
                  const nextMetrics = getTypographyMetricsToken(state.preset, nextSize);
                  setState((current) => ({
                    ...current,
                    cjkBaselineOffset: Number.parseFloat(nextMetrics.cjkBaselineOffset),
                    cjkLetterSpacing: Number.parseFloat(nextMetrics.cjkLetterSpacing),
                    fontSize: nextSizeToken.fontSize,
                    latinBaselineOffset: Number.parseFloat(nextMetrics.latinBaselineOffset),
                    latinLetterSpacing: Number.parseFloat(nextMetrics.latinLetterSpacing),
                    lineHeight: Number.parseFloat(nextSizeToken.lineHeight),
                    size: nextSize,
                    tracking: Number.parseFloat(nextSizeToken.letterSpacing),
                  }));
                }}
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {supportedSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Weight</FieldLabel>
              <select
                value={state.weight}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    weight: event.target.value as TypographyWeight,
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {TYPOGRAPHY_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
            </label>
          </ControlBlock>

          <ControlBlock title="排版参数">
            <label className="block">
              <FieldLabel>Font Size</FieldLabel>
              <input
                value={state.fontSize}
                onChange={(event) =>
                  setState((current) => ({ ...current, fontSize: event.target.value }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
            <label className="block">
              <FieldLabel>Line Height</FieldLabel>
              <input
                type="number"
                step="0.01"
                value={state.lineHeight}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    lineHeight: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
            <label className="block">
              <FieldLabel>Tracking</FieldLabel>
              <input
                type="number"
                step="0.001"
                value={state.tracking}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    tracking: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
          </ControlBlock>

          <ControlBlock title="脚本补偿">
            <label className="block">
              <FieldLabel>Latin Baseline Offset</FieldLabel>
              <input
                type="number"
                step="0.001"
                value={state.latinBaselineOffset}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    latinBaselineOffset: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
            <label className="block">
              <FieldLabel>CJK Baseline Offset</FieldLabel>
              <input
                type="number"
                step="0.001"
                value={state.cjkBaselineOffset}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    cjkBaselineOffset: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
            <label className="block">
              <FieldLabel>Latin Letter Spacing</FieldLabel>
              <input
                type="number"
                step="0.001"
                value={state.latinLetterSpacing}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    latinLetterSpacing: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
            <label className="block">
              <FieldLabel>CJK Letter Spacing</FieldLabel>
              <input
                type="number"
                step="0.001"
                value={state.cjkLetterSpacing}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    cjkLetterSpacing: Number(event.target.value),
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              />
            </label>
          </ControlBlock>

          <ControlBlock title="行为">
            <label className="block">
              <FieldLabel>Wrap Policy</FieldLabel>
              <select
                value={state.wrapPolicy}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    wrapPolicy: event.target.value as TypographyWrapPolicy,
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                {TYPOGRAPHY_WRAP_POLICIES.map((wrapPolicy) => (
                  <option key={wrapPolicy} value={wrapPolicy}>
                    {wrapPolicy}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Align</FieldLabel>
              <select
                value={state.align}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    align: event.target.value as "left" | "center" | "right",
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Autospace</FieldLabel>
              <select
                value={state.autospace}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    autospace: event.target.value as TypographyAutospace,
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                <option value="off">off</option>
                <option value="normal">normal</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Numeric Style</FieldLabel>
              <select
                value={state.numericStyle}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    numericStyle: event.target.value as TypographyNumericStyle,
                  }))
                }
                className="w-full border border-white/10 bg-black px-3 py-3"
              >
                <option value="default">default</option>
                <option value="tabular">tabular</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Preview Width</FieldLabel>
              <input
                type="range"
                min="360"
                max="1440"
                step="10"
                value={state.previewWidth}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    previewWidth: Number(event.target.value),
                  }))
                }
                className="w-full"
              />
              <Typography
                as="span"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="label"
                className="mt-2 block text-textMuted"
              >
                {state.previewWidth}px
              </Typography>
            </label>
          </ControlBlock>

          <ControlBlock title="调试层">
            <ToggleField
              checked={state.showGrid}
              label="显示网格"
              onChange={(value) =>
                setState((current) => ({ ...current, showGrid: value }))
              }
            />
            <ToggleField
              checked={state.showBaseline}
              label="显示基线"
              onChange={(value) =>
                setState((current) => ({ ...current, showBaseline: value }))
              }
            />
            <ToggleField
              checked={state.showLeftEdge}
              label="显示左边缘"
              onChange={(value) =>
                setState((current) => ({ ...current, showLeftEdge: value }))
              }
            />
            <ToggleField
              checked={state.showRunHighlight}
              label="高亮脚本分段"
              onChange={(value) =>
                setState((current) => ({ ...current, showRunHighlight: value }))
              }
            />
          </ControlBlock>
        </aside>

        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div
            className={[
              "relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 md:p-8",
              state.showGrid ? "font-lab-grid" : "",
              state.showBaseline ? "font-lab-baseline" : "",
              state.showLeftEdge ? "font-lab-left-edge" : "",
              state.showRunHighlight ? "font-lab-run-highlight" : "",
            ].join(" ")}
            style={{ ...cssVars, width: "100%", maxWidth: `${state.previewWidth}px` }}
          >
            <Typography
              as="p"
              preset="sans-body"
              size="caption"
              weight="medium"
              wrapPolicy="label"
              className="mb-6 text-textMuted"
            >
              STANDARD SAMPLES
            </Typography>
            <div className="space-y-8">
              <Typography
                as="p"
                preset={state.preset}
                size={state.size}
                weight={state.weight}
                wrapPolicy={state.wrapPolicy}
                align={state.align}
                autospace={state.autospace}
                numericStyle={state.numericStyle}
                className="text-white"
              >
                SHADOW OVER HANGZHOU / 雨后余光
              </Typography>
              <Typography
                as="p"
                preset={state.preset}
                size={state.size}
                weight={state.weight}
                wrapPolicy="heading"
                align={state.align}
                autospace={state.autospace}
                className="max-w-[18ch] text-white"
              >
                当雾气压低到江面，Lighting Direction 仍然需要保持叙事聚焦。
              </Typography>
              <Typography
                as="p"
                preset={state.preset}
                size="body"
                weight="regular"
                wrapPolicy="prose"
                autospace={state.autospace}
                numericStyle={state.numericStyle}
                className="max-w-[44ch] text-textPrimary"
              >
                这是正文测试段落。2026 年 03 月 11 日，版本 v2.1.0 在 Unreal Engine 5.3 环境下完成迭代；设计目标是让中英混排、数字、单位、URL 与中文标点共处时仍保持稳定基线与左边缘。
              </Typography>
              <Typography
                as="p"
                preset={state.preset}
                size="body-sm"
                weight="regular"
                wrapPolicy="url"
                autospace={state.autospace}
                className="max-w-[34ch] text-textMuted"
              >
                https://portfolio.example.com/works/lighting-lab?scene=rainy-night&build=v2.1.0
              </Typography>
              <Typography
                as="p"
                preset={state.preset}
                size="body-sm"
                weight="regular"
                wrapPolicy="prose"
                autospace={state.autospace}
                className="max-w-[40ch] text-textMuted whitespace-pre-wrap"
              >
                {"人工换行测试：\n第一行是中文说明。\nSecond line keeps English punctuation (A/B testing)."}
              </Typography>
            </div>
          </div>

          <div
            className={[
              "relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 md:p-8",
              state.showGrid ? "font-lab-grid" : "",
              state.showBaseline ? "font-lab-baseline" : "",
              state.showLeftEdge ? "font-lab-left-edge" : "",
              state.showRunHighlight ? "font-lab-run-highlight" : "",
            ].join(" ")}
            style={{ ...cssVars, width: "100%", maxWidth: `${state.previewWidth}px` }}
          >
            <Typography
              as="p"
              preset="sans-body"
              size="caption"
              weight="medium"
              wrapPolicy="label"
              className="mb-6 text-textMuted"
            >
              EXTREME CASES
            </Typography>
            <div className="space-y-6">
              <Typography as="p" preset={state.preset} size="body-sm" weight="regular" wrapPolicy="prose" className="text-textPrimary">
                中文（English）与“引号”混排，A/B、UI、GPU、Lumen、Nanite、5.3ms、128GB、4K HDR 全部同时出现。
              </Typography>
              <Typography as="p" preset={state.preset} size="body-sm" weight="regular" wrapPolicy="heading" className="max-w-[16ch] text-textPrimary">
                Pneumonoultramicroscopicsilicovolcanoconiosis 在极窄宽度下的断行表现。
              </Typography>
              <Typography as="p" preset={state.preset} size="body-sm" weight="regular" wrapPolicy="url" numericStyle="tabular" className="text-textPrimary">
                contact@jiangchengyan.dev / build-2026.03.11-night-pass-04 / 001-2048-4096
              </Typography>
            </div>
          </div>

          <TypographyProvider overrides={previewOverrides}>
            <div className="space-y-8">
              <Typography
                as="p"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted"
              >
                REAL COMPONENT PREVIEWS
              </Typography>
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="regular"
                wrapPolicy="prose"
                className="max-w-[56ch] text-textMuted"
              >
                该区域会把当前选中的 preset、size 与 weight 强制注入所有真实组件预览，确保每次参数变化都能即时反映到真实布局。
              </Typography>
              <div className="border border-white/10 bg-black">
                <HeroSection
                  eyebrow="FONT LAB / LIVE HERO"
                  title="JIANG CHENGYAN"
                  subtitle="Typography calibration"
                  description="在这里直接看真实 Hero 模块如何响应字体 token、基线补偿和换行策略。"
                  primaryCtaLabel="VIEW WORKS"
                  primaryCtaHref="/works"
                  secondaryCtaLabel="BACK"
                  secondaryCtaHref="/playground"
                  imageSrc="/images/covers/2026/ShotForCrewWithoutWord.0004.webp"
                  imageAlt="Font Lab hero background"
                />
              </div>
              <div className="border border-white/10 bg-black px-6 py-10">
                <PortfolioHeroHeader
                  title="ALL WORKS"
                  subtitle="CURATED TYPOGRAPHY"
                  descriptionLine1="LIVE COMPONENT"
                  descriptionLine2="这里的页面头图标题与说明会直接读取当前 Typography token。"
                  ctaLabel="ABOUT"
                  ctaHref="/about"
                />
              </div>
              <div className="border border-white/10 bg-black px-6 py-10">
                <WorksListEntry
                  id="font-lab-work-1"
                  number="07"
                  title="CITY AFTER RAIN"
                  category="Lighting / Atmosphere / Look Dev"
                  imageSrc="/images/city-2026/002.webp"
                  desc="在霓虹、体积雾与反射面之间建立可控节奏。Typography 应该在多行与高反差背景里保持稳定。"
                  href="/works/lighting-portfolio/collection-1"
                />
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="border border-white/10 bg-black">
                  <LightingCollectionHeader
                    title="CITY ADD"
                    number="01"
                    description="灯光集合页的标题与说明文字也会进入同一套排版系统。"
                  />
                </div>
                <div className="border border-white/10 bg-black p-6">
                  <LightingProjectCard
                    number="03"
                    title="OVERPASS GLOW"
                    coverImage="/images/city-2026/001.webp"
                    href="/works/lighting-portfolio/collection-1"
                  />
                </div>
              </div>
              <div className="border border-white/10 bg-black px-6 py-10">
                <ContentCard
                  title="Font Lab Narrative Sample"
                  description="This card uses the same Typography base component. 你可以在这里观察正文、标题与 URL 换行策略是否同时成立。"
                  imageSrc="/images/train-station/2Night.webp"
                  tags={["Typography", "Mixed Script", "Baseline"]}
                />
              </div>
            </div>
          </TypographyProvider>

          <div className="border border-white/10 bg-white/[0.02] px-5 py-5">
            <Typography
              as="p"
              preset="sans-body"
              size="body-sm"
              weight="regular"
              wrapPolicy="prose"
              className="text-textMuted"
            >
              顶部全局 Navigation 已使用当前页面注入的 CSS 变量；它不在这里重复渲染，但会随着当前配置同步变化。
            </Typography>
          </div>
        </section>
      </div>
    </main>
  );
}
