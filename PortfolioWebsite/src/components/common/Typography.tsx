"use client";

import clsx from "clsx";
import React, {
  Children,
  createContext,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useContext,
} from "react";
import { twMerge } from "tailwind-merge";

import {
  getTypographyMetricsToken,
  getTypographyPresetToken,
  getTypographySizeToken,
  getTypographyWrapToken,
  isTypographySizeSupported,
  type TypographyAutospace,
  type TypographyNumericStyle,
  type TypographyPreset,
  type TypographyScript,
  type TypographySize,
  type TypographyWeight,
  type TypographyWrapPolicy,
} from "@/lib/typography-tokens";
import { segmentTypographyText } from "@/lib/typography";

type TypographyOverrideMap = Partial<
  Record<
    TypographyPreset,
    Partial<{
      autospace: TypographyAutospace;
      cjkBaselineOffset: string;
      cjkLetterSpacing: string;
      latinBaselineOffset: string;
      latinLetterSpacing: string;
      numericStyle: TypographyNumericStyle;
    }>
  >
> & {
  forcePreset?: TypographyPreset;
  forceSize?: TypographySize;
  forceWeight?: TypographyWeight;
  sizeOverrides?: Partial<
    Record<
      TypographySize,
      Partial<{
        fontSize: string;
        letterSpacing: string;
        lineHeight: string;
      }>
    >
  >;
};

const TypographyOverrideContext = createContext<TypographyOverrideMap | null>(null);

export interface TypographyProviderProps {
  children: ReactNode;
  overrides: TypographyOverrideMap;
}

export function TypographyProvider({
  children,
  overrides,
}: TypographyProviderProps) {
  return (
    <TypographyOverrideContext.Provider value={overrides}>
      {children}
    </TypographyOverrideContext.Provider>
  );
}

type BaseTypographyProps = {
  align?: "left" | "center" | "right";
  autospace?: TypographyAutospace;
  children: ReactNode;
  className?: string;
  lang?: string;
  numericStyle?: TypographyNumericStyle;
  preset: TypographyPreset;
  size: TypographySize;
  style?: CSSProperties;
  weight?: TypographyWeight;
  wrapPolicy?: TypographyWrapPolicy;
};

export type TypographyProps<T extends ElementType = "span"> = BaseTypographyProps & {
  as?: T;
};

type StyleWithVars = CSSProperties & Record<string, string | number | undefined>;

function getRunLang(script: TypographyScript, containerLang: string) {
  if (script === "latin") {
    return "en";
  }

  return containerLang;
}

function renderStringNode(
  text: string,
  keyPrefix: string,
  containerLang: string,
  preset: TypographyPreset,
  size: TypographySize,
  weight: TypographyWeight,
) {
  const presetToken = getTypographyPresetToken(preset);
  const metricsToken = getTypographyMetricsToken(preset, size);
  const weightPair = presetToken.weights[weight];

  return segmentTypographyText(text).map((run, index) => {
    if (run.type === "break") {
      return <br key={`${keyPrefix}-break-${index}`} />;
    }

    const isLatin = run.script === "latin";
    const runStyle: StyleWithVars = {
      fontFamily: isLatin ? presetToken.latinFontFamily : presetToken.cjkFontFamily,
      fontWeight: isLatin ? weightPair.latin : weightPair.cjk,
      letterSpacing: isLatin
        ? `var(--typography-${preset}-${size}-latin-letter-spacing, ${metricsToken.latinLetterSpacing})`
        : `var(--typography-${preset}-${size}-cjk-letter-spacing, ${metricsToken.cjkLetterSpacing})`,
      top: isLatin
        ? `var(--typography-${preset}-${size}-latin-baseline-offset, ${metricsToken.latinBaselineOffset})`
        : `var(--typography-${preset}-${size}-cjk-baseline-offset, ${metricsToken.cjkBaselineOffset})`,
    };

    return (
      <span
        key={`${keyPrefix}-${run.script}-${index}`}
        lang={getRunLang(run.script, containerLang)}
        className={clsx(
          "typography-run",
          isLatin ? "typography-run--latin" : "typography-run--cjk",
        )}
        style={runStyle}
      >
        {run.value}
      </span>
    );
  });
}

function processTypographyChildren(
  node: ReactNode,
  keyPrefix: string,
  containerLang: string,
  preset: TypographyPreset,
  size: TypographySize,
  weight: TypographyWeight,
): ReactNode {
  if (typeof node === "string") {
    return renderStringNode(node, keyPrefix, containerLang, preset, size, weight);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) =>
      processTypographyChildren(
        child,
        `${keyPrefix}-${index}`,
        containerLang,
        preset,
        size,
        weight,
      ),
    );
  }

  if (!isValidElement(node)) {
    return node;
  }

  const element = node as React.ReactElement<{ children?: ReactNode }>;

  if (!element.props.children) {
    return element;
  }

  return React.cloneElement(
    element,
    { key: keyPrefix },
    Children.map(element.props.children, (child, index) =>
      processTypographyChildren(
        child,
        `${keyPrefix}-${index}`,
        containerLang,
        preset,
        size,
        weight,
      ),
    ),
  );
}

export default function Typography<T extends ElementType = "span">({
  as,
  align = "left",
  autospace = "off",
  children,
  className,
  lang = "zh-CN",
  numericStyle = "default",
  preset,
  size,
  style,
  weight = "regular",
  wrapPolicy = "prose",
}: TypographyProps<T>) {
  const overrideContext = useContext(TypographyOverrideContext);
  const effectivePreset = overrideContext?.forcePreset ?? preset;
  const requestedSize = overrideContext?.forceSize ?? size;
  const effectiveWeight = overrideContext?.forceWeight ?? weight;
  const resolvedSize = isTypographySizeSupported(effectivePreset, requestedSize)
    ? requestedSize
    : "display";
  const sizeToken = getTypographySizeToken(resolvedSize);
  const wrapToken = getTypographyWrapToken(wrapPolicy);
  const presetOverride = overrideContext?.[effectivePreset];
  const sizeOverride = overrideContext?.sizeOverrides?.[resolvedSize];

  const Component = (as ?? "span") as ElementType;
  const baseStyle: StyleWithVars = {
    fontSize: `var(--typography-size-${resolvedSize}-font-size, ${sizeOverride?.fontSize ?? sizeToken.fontSize})`,
    fontVariantNumeric:
      (presetOverride?.numericStyle ?? numericStyle) === "tabular"
        ? "tabular-nums"
        : "normal",
    hyphens: wrapToken.hyphens,
    letterSpacing: `var(--typography-size-${resolvedSize}-letter-spacing, ${sizeOverride?.letterSpacing ?? sizeToken.letterSpacing})`,
    lineHeight: `var(--typography-size-${resolvedSize}-line-height, ${sizeOverride?.lineHeight ?? sizeToken.lineHeight})`,
    overflowWrap: wrapToken.overflowWrap,
    textAlign: align,
    textWrap: wrapPolicy === "heading" ? "balance" : "pretty",
    whiteSpace: wrapToken.whiteSpace,
    wordBreak: wrapToken.wordBreak,
    "--typography-autospace": presetOverride?.autospace ?? autospace,
    [`--typography-${effectivePreset}-${resolvedSize}-cjk-baseline-offset`]:
      presetOverride?.cjkBaselineOffset,
    [`--typography-${effectivePreset}-${resolvedSize}-cjk-letter-spacing`]:
      presetOverride?.cjkLetterSpacing,
    [`--typography-${effectivePreset}-${resolvedSize}-latin-baseline-offset`]:
      presetOverride?.latinBaselineOffset,
    [`--typography-${effectivePreset}-${resolvedSize}-latin-letter-spacing`]:
      presetOverride?.latinLetterSpacing,
  };

  return (
    <Component
      lang={lang}
      className={twMerge(
        clsx(
          "typography-root",
          align === "center" && "mx-auto text-center",
          align === "right" && "ml-auto text-right",
          wrapPolicy === "label" && "uppercase",
        ),
        className,
      )}
      style={{ ...baseStyle, ...style }}
      data-typography-preset={effectivePreset}
      data-typography-size={resolvedSize}
      data-typography-weight={effectiveWeight}
      data-typography-autospace={presetOverride?.autospace ?? autospace}
      data-typography-numeric={
        presetOverride?.numericStyle ?? numericStyle
      }
      data-typography-wrap={wrapPolicy}
    >
      {Children.map(children, (child, index) =>
        processTypographyChildren(
          child,
          `typography-${resolvedSize}-${index}`,
          lang,
          effectivePreset,
          resolvedSize,
          effectiveWeight,
        ),
      )}
    </Component>
  );
}
