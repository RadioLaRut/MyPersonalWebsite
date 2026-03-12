"use client";

import clsx from "clsx";
import React, {
  Children,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
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
      fontSize: isLatin
        ? `calc(1em * var(--typography-${preset}-latin-scale, 1))`
        : undefined,
      fontWeight: isLatin
        ? `var(--typography-${preset}-${weight}-latin-weight, ${weightPair.latin})`
        : `var(--typography-${preset}-${weight}-cjk-weight, ${weightPair.cjk})`,
      letterSpacing: isLatin
        ? `var(--typography-${preset}-${size}-latin-letter-spacing, ${metricsToken.latinLetterSpacing})`
        : `var(--typography-${preset}-${size}-cjk-letter-spacing, ${metricsToken.cjkLetterSpacing})`,
      left: isLatin
        ? `var(--typography-${preset}-${size}-latin-horizontal-offset, 0em)`
        : `var(--typography-${preset}-${size}-cjk-horizontal-offset, 0em)`,
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
  const resolvedSize = isTypographySizeSupported(preset, size)
    ? size
    : "display";
  const sizeToken = getTypographySizeToken(resolvedSize);
  const wrapToken = getTypographyWrapToken(wrapPolicy);

  const Component = (as ?? "span") as ElementType;
  const baseStyle: StyleWithVars = {
    fontSize: `var(--typography-${preset}-${resolvedSize}-font-size, var(--typography-size-${resolvedSize}-font-size, ${sizeToken.fontSize}))`,
    fontVariantNumeric:
      numericStyle === "tabular"
        ? "tabular-nums"
        : "normal",
    hyphens: wrapToken.hyphens,
    letterSpacing: `var(--typography-${preset}-${resolvedSize}-letter-spacing, var(--typography-size-${resolvedSize}-letter-spacing, ${sizeToken.letterSpacing}))`,
    lineHeight: `var(--typography-${preset}-${resolvedSize}-line-height, var(--typography-size-${resolvedSize}-line-height, ${sizeToken.lineHeight}))`,
    overflowWrap: wrapToken.overflowWrap,
    textAlign: align,
    textWrap:
      wrapPolicy === "heading"
        ? "balance"
        : wrapPolicy === "prose"
          ? "pretty"
          : undefined,
    whiteSpace: wrapToken.whiteSpace,
    wordBreak: wrapToken.wordBreak,
    "--typography-autospace": autospace,
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
      data-typography-preset={preset}
      data-typography-size={resolvedSize}
      data-typography-weight={weight}
      data-typography-autospace={autospace}
      data-typography-numeric={numericStyle}
      data-typography-wrap={wrapPolicy}
    >
      {Children.map(children, (child, index) =>
        processTypographyChildren(
          child,
          `typography-${resolvedSize}-${index}`,
          lang,
          preset,
          resolvedSize,
          weight,
        ),
      )}
    </Component>
  );
}
