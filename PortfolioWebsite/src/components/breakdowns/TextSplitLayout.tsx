import React, {
  type ComponentPropsWithRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutNode,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import { PresetImage } from "@/components/common/PresetImage";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getComponentLayoutNodeStyle,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGapStyle,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";
import { toPlainText } from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

type TextSplitLayoutProps = {
  heading: ReactNode;
  paragraphs: ReactNode[];
  bodyAlign?: TypographyAlignment;
  imageSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  layoutVariant?: "split-left" | "split-right" | "stack";
  paragraphsContent?: ReactNode;
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"TextSplitLayout"> & ComponentLayoutProps;

type SlotElementProps = {
  allow?: readonly string[];
  as?: ElementType;
  className?: string;
  componentLabAnnotations?: true;
  minEmptyHeight?: CSSProperties["minHeight"] | number;
  style?: CSSProperties;
};

type RepeatedSlotStyle = CSSProperties & {
  "--component-gap-desktop"?: string;
  "--component-gap-mobile"?: string;
  "--component-gap-tablet"?: string;
  "--component-repeated-gap-desktop"?: string;
  "--component-repeated-gap-mobile"?: string;
  "--component-repeated-gap-tablet"?: string;
};

function isPuckSlotElement(
  node: ReactNode,
): node is ReactElement<SlotElementProps> {
  if (!React.isValidElement(node) || typeof node.type === "string") {
    return false;
  }
  const props = node.props as SlotElementProps;
  return props.allow !== undefined || props.minEmptyHeight !== undefined;
}

function getRepeatedItemStyle(
  style: CSSProperties | undefined,
  occurrence: number,
): RepeatedSlotStyle | undefined {
  if (occurrence === 0) return style;
  const repeatedStyle = style as RepeatedSlotStyle | undefined;
  return {
    ...style,
    "--component-gap-desktop":
      repeatedStyle?.["--component-repeated-gap-desktop"] ?? "0px",
    "--component-gap-mobile":
      repeatedStyle?.["--component-repeated-gap-mobile"] ?? "0px",
    "--component-gap-tablet":
      repeatedStyle?.["--component-repeated-gap-tablet"] ?? "0px",
  };
}

function RepeatedBodySlotRoot({
  children,
  className,
  componentLabAnnotations,
  style,
  ...rootProps
}: ComponentPropsWithRef<"div"> & {
  componentLabAnnotations?: true;
}) {
  const items = React.Children.toArray(children);
  const isPuckEditor = Boolean(
    (rootProps as Record<string, unknown>)["data-puck-dropzone"],
  );
  return (
    <div
      {...rootProps}
      className={isPuckEditor ? className : "contents"}
      style={isPuckEditor ? style : undefined}
    >
      {items.map((child, occurrence) => (
        <div
          key={React.isValidElement(child) && child.key !== null
            ? child.key
            : occurrence}
          className={isPuckEditor ? undefined : className}
          {...(componentLabAnnotations
            ? {
              "data-component-lab-node": "body.item",
              "data-component-lab-occurrence": occurrence,
            }
            : {})}
          style={isPuckEditor
            ? undefined
            : getRepeatedItemStyle(style, occurrence)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function getRepeatedSlotLayoutProps(
  layout: NonNullable<ComponentLayoutProps["componentLayout"]>,
  nodeId: string,
  gapFrom: string,
) {
  const node = getComponentLayoutNode(layout, nodeId);
  const firstGapStyle = getResponsiveGapStyle(
    getComponentLayoutGap(layout, gapFrom, nodeId),
  );
  const repeatedGapStyle = getResponsiveGapStyle(
    getComponentLayoutGap(layout, nodeId, nodeId),
  );
  const nodeStyle = getComponentLayoutNodeStyle(node, layout.section);
  const hasGap = Boolean(firstGapStyle || repeatedGapStyle);
  const style: RepeatedSlotStyle = {
    ...firstGapStyle,
    ...nodeStyle,
    "--component-repeated-gap-desktop":
      repeatedGapStyle?.["--component-gap-desktop"] ?? "0px",
    "--component-repeated-gap-mobile":
      repeatedGapStyle?.["--component-gap-mobile"] ?? "0px",
    "--component-repeated-gap-tablet":
      repeatedGapStyle?.["--component-gap-tablet"] ?? "0px",
  };
  return {
    className: [
      getComponentLayoutNodeClassName(node),
      hasGap ? "component-layout-node-gap" : "",
    ].filter(Boolean).join(" "),
    style,
  };
}

export default function TextSplitLayout({
  heading,
  paragraphs,
  bodyAlign = "left",
  componentLayout,
  imageSrc,
  imagePreset = "ratio-16-9",
  imageFitMode = "x",
  layoutVariant = "split-left",
  paragraphsContent,
  publicMediaHint,
  design,
}: TextSplitLayoutProps) {
  const resolvedDesign = resolveComponentDesign("TextSplitLayout", design);
  const imageAlt = toPlainText(heading) ?? "TextSplitLayout image";
  const headingTypography = getComponentLayoutTypography(
    componentLayout,
    "heading",
  );
  const bodyItemTypography = getComponentLayoutTypography(
    componentLayout,
    "body.item",
  );
  const slotLayoutProps = componentLayout
    ? getRepeatedSlotLayoutProps(componentLayout, "body.item", "heading")
    : undefined;
  const paragraphContentItems = React.Children.toArray(paragraphsContent);
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  const bodyContent = paragraphContentItems.length > 0
    ? paragraphContentItems.map((child, occurrence) => {
      const key = React.isValidElement(child) && child.key !== null
        ? child.key
        : occurrence;
      if (isPuckSlotElement(child) && componentLayout && slotLayoutProps) {
        return React.cloneElement(child, {
          as: RepeatedBodySlotRoot,
          className: [
            child.props.className ?? "",
            slotLayoutProps.className,
          ].filter(Boolean).join(" "),
          componentLabAnnotations:
            componentLayout.componentLabAnnotations,
          style: {
            ...child.props.style,
            ...slotLayoutProps.style,
          },
        });
      }
      return (
        <ComponentLayoutNode
          key={key}
          className={!componentLayout ? "col-span-12" : undefined}
          gapFrom={occurrence === 0 ? "heading" : "body.item"}
          layout={componentLayout}
        nodeId="body.item"
        occurrence={occurrence}
      >
          {child}
        </ComponentLayoutNode>
      );
    })
    : paragraphs.map((paragraph, index) => (
      <ComponentLayoutNode
        key={index}
        className={!componentLayout ? "col-span-12" : undefined}
        gapFrom={index === 0 ? "heading" : "body.item"}
        layout={componentLayout}
        nodeId="body.item"
        occurrence={index}
      >
        <Typography
          as="p"
          preset={bodyItemTypography?.preset ?? "sans-body"}
          size={bodyItemTypography?.size ?? resolvedDesign.bodySize}
          weight="semantic"
          wrapPolicy={bodyItemTypography?.wrap ??
            (resolvedDesign.bodyAutoWrap ? "prose" : "nowrap")}
          align={getComponentLayoutAlignment(
            componentLayout,
            "body.item",
            bodyAlign,
          )}
          className="text-textSecondary"
        >
          {paragraph}
        </Typography>
      </ComponentLayoutNode>
    ));

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container items-start">
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          layout={componentLayout}
          nodeId="heading"
        >
          <Typography
            as="h3"
            preset={headingTypography?.preset ?? "sans-body"}
            size={headingTypography?.size ??
              (layoutVariant === "stack"
                ? resolvedDesign.stackHeadingSize
                : resolvedDesign.splitHeadingSize)}
            weight={layoutVariant === "stack" ? "strong" : "light"}
            wrapPolicy={headingTypography?.wrap ??
              (resolvedDesign.headingAutoWrap ? "heading" : "nowrap")}
            align={getComponentLayoutAlignment(
              componentLayout,
              "heading",
              layoutVariant === "split-right" ? "right" : "left",
            )}
            className="text-white uppercase"
          >
            {heading}
          </Typography>
        </ComponentLayoutNode>
        {bodyContent}
        {imageSrc ? (
          <ComponentLayoutNode
            className={!componentLayout ? "col-span-12" : undefined}
            gapFrom="body.item"
            layout={componentLayout}
            nodeId="media"
          >
            <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
              <PresetImage
                src={imageSrc}
                alt={imageAlt}
                preset={imagePreset}
                fitMode={imageFitMode}
                mediaProfile={layoutVariant === "stack"
                  ? "grid-10"
                  : "grid-6"}
                preload={publicMediaHint?.src === imageSrc &&
                  publicMediaHint.preload}
                sizes={publicMediaHint?.src === imageSrc
                  ? publicMediaHint.sizes
                  : undefined}
              />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </div>
          </ComponentLayoutNode>
        ) : null}
      </div>
    </section>
  );
}
