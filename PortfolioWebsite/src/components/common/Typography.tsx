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
import {
  areResponsiveTypographyRenderVariantsEqual,
  getTypographyEdgeScripts,
  resolveResponsiveTypographyRenderVariants,
  segmentTypographyText,
  type ResponsiveTypographyValue,
} from "@/lib/typography";
import {
  getTypographyAlignmentStyle,
  type TypographyAlignment,
  type TypographyAlignmentValue,
  isResponsiveTypographyAlignment,
} from "@/lib/typography-alignment";
import { getInlineEditableTextValue } from "@/lib/editable-text";

export type {
  ResponsiveTypographyAlignment,
  TypographyAlignment,
  TypographyAlignmentValue,
} from "@/lib/typography-alignment";

type TypographyWeightMode = TypographyWeight | "semantic";

type BaseTypographyProps = {
  align?: TypographyAlignmentValue;
  autospace?: TypographyAutospace;
  children: ReactNode;
  className?: string;
  lang?: string;
  numericStyle?: TypographyNumericStyle;
  style?: CSSProperties;
  weight?: TypographyWeightMode;
};

type ScalarTypographyProps<T extends ElementType = "span"> =
  BaseTypographyProps & {
    as?: T;
    preset: TypographyPreset;
    size: TypographySize;
    wrapPolicy?: TypographyWrapPolicy;
  };

export type TypographyProps<T extends ElementType = "span"> =
  BaseTypographyProps & {
    as?: T;
    preset: TypographyPreset | ResponsiveTypographyValue<TypographyPreset>;
    size: TypographySize | ResponsiveTypographyValue<TypographySize>;
    wrapPolicy?:
      | TypographyWrapPolicy
      | ResponsiveTypographyValue<TypographyWrapPolicy>;
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

  const inlineEditableText = getInlineEditableTextValue(node);
  if (inlineEditableText !== undefined) {
    return inlineEditableText;
  }

  const element = node as React.ReactElement<{ children?: ReactNode }>;
  return extractTypographyPlainText(element.props.children);
}

function removeGenericFontFamily(fontFamily: string) {
  return fontFamily.replace(/,\s*(?:sans-serif|serif)\s*$/, "");
}

function getRootTypographyFallbackStyle(
  text: string,
  preset: TypographyPreset,
  size: TypographySize,
  weight: TypographyWeightMode,
): Pick<StyleWithVars, "fontFamily" | "fontWeight"> {
  const presetToken = getTypographyPresetToken(preset);
  const scripts = segmentTypographyText(text)
    .filter((run) => run.type !== "break")
    .map((run) => run.script);
  const hasLatin = scripts.includes("latin");
  const hasCjk = scripts.includes("cjk");
  const firstScript = scripts[0] ?? "latin";
  const resolvedWeight =
    weight === "semantic"
      ? getDefaultTypographySemanticWeight(size)
      : weight;
  const weightPair = presetToken.weights[resolvedWeight];
  const scriptType = firstScript === "latin" ? "latin" : "cjk";
  const baseWeight = firstScript === "latin" ? weightPair.latin : weightPair.cjk;
  const fontWeight = weight === "semantic"
    ? `var(--typography-${preset}-${size}-semantic-${scriptType}-weight, var(--typography-${preset}-${resolvedWeight}-${scriptType}-weight, ${baseWeight}))`
    : `var(--typography-${preset}-${resolvedWeight}-${scriptType}-weight, ${baseWeight})`;
  const fontFamily = hasLatin && hasCjk
    ? `${removeGenericFontFamily(presetToken.latinFontFamily)}, ${presetToken.cjkFontFamily}`
    : hasCjk
      ? presetToken.cjkFontFamily
      : presetToken.latinFontFamily;

  return { fontFamily, fontWeight };
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

function TypographyScalar<T extends ElementType = "span">({
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
}: ScalarTypographyProps<T>) {
  const resolvedSize = isTypographySizeSupported(preset, size)
    ? size
    : "display";
  const sizeToken = getTypographySizeToken(resolvedSize);
  const wrapToken = getTypographyWrapToken(wrapPolicy);
  const plainText = extractTypographyPlainText(children);
  const edgeScripts = getTypographyEdgeScripts(plainText);
  const rootTypographyFallbackStyle = getRootTypographyFallbackStyle(
    plainText,
    preset,
    resolvedSize,
    weight,
  );
  function getEdgeOffset(script: TypographyScript | null): string {
    if (!script) return "0em";
    const scriptType = script === "latin" ? "latin" : "cjk";
    return `var(--typography-${preset}-${resolvedSize}-${scriptType}-edge-offset, 0em)`;
  }

  const leadingEdgeOffset = getEdgeOffset(edgeScripts.leading);
  const trailingEdgeOffset = getEdgeOffset(edgeScripts.trailing);

  function getTranslateX(value: TypographyAlignment): string {
    if (value === "right") return `calc(var(--typography-trailing-edge-offset, 0em) * -1)`;
    if (value === "center" || value === "justify") return "0em";
    return `var(--typography-leading-edge-offset, 0em)`;
  }

  const responsiveAlignment = isResponsiveTypographyAlignment(align)
    ? align
    : null;
  const baseAlignment: TypographyAlignment = responsiveAlignment
    ? responsiveAlignment.mobile
    : align as TypographyAlignment;
  const translateX = getTranslateX(baseAlignment);

  function getTextWrap(): "balance" | "pretty" | undefined {
    if (wrapPolicy === "heading") return "balance";
    if (wrapPolicy === "prose") return "pretty";
    return undefined;
  }

  const Component = (as ?? "span") as ElementType;
  const alignmentStyle = responsiveAlignment
    ? {}
    : getTypographyAlignmentStyle(baseAlignment);
  const baseStyle: StyleWithVars = {
    ...rootTypographyFallbackStyle,
    fontSize: `var(--typography-${preset}-${resolvedSize}-font-size, var(--typography-size-${resolvedSize}-font-size, ${sizeToken.fontSize}))`,
    fontVariantNumeric: numericStyle === "tabular" ? "tabular-nums" : "normal",
    hyphens: wrapToken.hyphens,
    letterSpacing: `var(--typography-${preset}-${resolvedSize}-letter-spacing, var(--typography-size-${resolvedSize}-letter-spacing, ${sizeToken.letterSpacing}))`,
    lineHeight: `var(--typography-${preset}-${resolvedSize}-line-height, var(--typography-size-${resolvedSize}-line-height, ${sizeToken.lineHeight}))`,
    overflowWrap: wrapToken.overflowWrap,
    ...alignmentStyle,
    textWrapStyle: getTextWrap(),
    transform: responsiveAlignment || translateX === "0em"
      ? undefined
      : `translateX(${translateX})`,
    whiteSpace: wrapToken.whiteSpace,
    wordBreak: wrapToken.wordBreak,
    "--typography-autospace": autospace,
    "--typography-leading-edge-offset": leadingEdgeOffset,
    "--typography-trailing-edge-offset": trailingEdgeOffset,
    ...(responsiveAlignment
      ? {
        "--typography-align-desktop": responsiveAlignment.desktop,
        "--typography-align-last-desktop":
          responsiveAlignment.desktop === "justify" ? "justify" : "auto",
        "--typography-align-mobile": responsiveAlignment.mobile,
        "--typography-align-last-mobile":
          responsiveAlignment.mobile === "justify" ? "justify" : "auto",
        "--typography-align-tablet": responsiveAlignment.tablet,
        "--typography-align-last-tablet":
          responsiveAlignment.tablet === "justify" ? "justify" : "auto",
        "--typography-translate-desktop": getTranslateX(
          responsiveAlignment.desktop,
        ),
        "--typography-translate-mobile": getTranslateX(
          responsiveAlignment.mobile,
        ),
        "--typography-translate-tablet": getTranslateX(
          responsiveAlignment.tablet,
        ),
      }
      : {}),
  };

  return (
    <Component
      lang={lang}
      className={twMerge(
        clsx(
          "typography-root",
          responsiveAlignment && "typography-responsive-alignment",
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
      data-typography-align={baseAlignment}
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

export default function Typography<T extends ElementType = "span">(
  props: TypographyProps<T>,
) {
  const wrapPolicy = props.wrapPolicy ?? "prose";
  const responsiveVariants = resolveResponsiveTypographyRenderVariants({
    preset: props.preset,
    size: props.size,
    wrapPolicy,
  });

  if (!responsiveVariants) {
    return (
      <TypographyScalar
        {...props}
        preset={props.preset as TypographyPreset}
        size={props.size as TypographySize}
        wrapPolicy={wrapPolicy as TypographyWrapPolicy}
      />
    );
  }

  if (areResponsiveTypographyRenderVariantsEqual(responsiveVariants)) {
    const firstVariant = responsiveVariants[0]!;
    return (
      <TypographyScalar
        {...props}
        preset={firstVariant.preset}
        size={firstVariant.size}
        wrapPolicy={firstVariant.wrapPolicy}
      />
    );
  }

  return (
    <>
      {responsiveVariants.map((variant) => (
        <TypographyScalar
          {...props}
          key={variant.breakpoint}
          className={twMerge(
            "typography-responsive-variant",
            `typography-responsive-variant--${variant.breakpoint}`,
            props.className,
          )}
          preset={variant.preset}
          size={variant.size}
          wrapPolicy={variant.wrapPolicy}
        />
      ))}
    </>
  );
}
