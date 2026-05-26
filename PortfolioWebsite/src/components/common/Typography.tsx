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
  getDefaultTypographySemanticWeight,
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
import { getTypographyEdgeScripts, segmentTypographyText } from "@/lib/typography";

type TypographyWeightMode = TypographyWeight | "semantic";

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
  weight?: TypographyWeightMode;
  wrapPolicy?: TypographyWrapPolicy;
};

export type TypographyProps<T extends ElementType = "span"> = BaseTypographyProps & {
  as?: T;
};

type StyleWithVars = CSSProperties & Record<string, string | number | undefined>;

function extractTypographyPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => extractTypographyPlainText(child)).join("");
  }

  if (!isValidElement(node)) {
    return "";
  }

  const element = node as React.ReactElement<{ children?: ReactNode }>;
  return extractTypographyPlainText(element.props.children);
}

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
  weight: TypographyWeightMode,
) {
  const presetToken = getTypographyPresetToken(preset);
  const metricsToken = getTypographyMetricsToken(preset, size);
  const resolvedWeight =
    weight === "semantic"
      ? getDefaultTypographySemanticWeight(size)
      : weight;
  const weightPair = presetToken.weights[resolvedWeight];

  return segmentTypographyText(text).map((run, index) => {
    if (run.type === "break") {
      return <br key={`${keyPrefix}-break-${index}`} />;
    }

    const isLatin = run.script === "latin";
    const scriptType = isLatin ? "latin" : "cjk";
    const baseWeight = isLatin ? weightPair.latin : weightPair.cjk;

    const configuredFontWeight = weight === "semantic"
      ? `var(--typography-${preset}-${size}-semantic-${scriptType}-weight, var(--typography-${preset}-${resolvedWeight}-${scriptType}-weight, ${baseWeight}))`
      : `var(--typography-${preset}-${resolvedWeight}-${scriptType}-weight, ${baseWeight})`;
    const runStyle: StyleWithVars = {
      fontFamily: isLatin ? presetToken.latinFontFamily : presetToken.cjkFontFamily,
      fontSize: isLatin
        ? `calc(1em * var(--typography-${preset}-latin-scale, 1))`
        : undefined,
      fontWeight: configuredFontWeight,
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
  weight: TypographyWeightMode,
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
  const edgeScripts = getTypographyEdgeScripts(extractTypographyPlainText(children));
  function getEdgeOffset(script: TypographyScript | null): string {
    if (!script) return "0em";
    const scriptType = script === "latin" ? "latin" : "cjk";
    return `var(--typography-${preset}-${resolvedSize}-${scriptType}-edge-offset, 0em)`;
  }

  const leadingEdgeOffset = getEdgeOffset(edgeScripts.leading);
  const trailingEdgeOffset = getEdgeOffset(edgeScripts.trailing);

  function getTranslateX(): string {
    if (align === "right") return `calc(var(--typography-trailing-edge-offset, 0em) * -1)`;
    if (align === "center") return "0em";
    return `var(--typography-leading-edge-offset, 0em)`;
  }

  const translateX = getTranslateX();

  function getTextWrap(): "balance" | "pretty" | undefined {
    if (wrapPolicy === "heading") return "balance";
    if (wrapPolicy === "prose") return "pretty";
    return undefined;
  }

  const Component = (as ?? "span") as ElementType;
  const baseStyle: StyleWithVars = {
    fontSize: `var(--typography-${preset}-${resolvedSize}-font-size, var(--typography-size-${resolvedSize}-font-size, ${sizeToken.fontSize}))`,
    fontVariantNumeric: numericStyle === "tabular" ? "tabular-nums" : "normal",
    hyphens: wrapToken.hyphens,
    letterSpacing: `var(--typography-${preset}-${resolvedSize}-letter-spacing, var(--typography-size-${resolvedSize}-letter-spacing, ${sizeToken.letterSpacing}))`,
    lineHeight: `var(--typography-${preset}-${resolvedSize}-line-height, var(--typography-size-${resolvedSize}-line-height, ${sizeToken.lineHeight}))`,
    overflowWrap: wrapToken.overflowWrap,
    textAlign: align,
    textWrap: getTextWrap(),
    transform: translateX === "0em" ? undefined : `translateX(${translateX})`,
    whiteSpace: wrapToken.whiteSpace,
    wordBreak: wrapToken.wordBreak,
    "--typography-autospace": autospace,
    "--typography-leading-edge-offset": leadingEdgeOffset,
    "--typography-trailing-edge-offset": trailingEdgeOffset,
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
      data-typography-leading-script={edgeScripts.leading ?? "none"}
      data-typography-trailing-script={edgeScripts.trailing ?? "none"}
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
