import React, {
  type ComponentPropsWithRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

import { PresetImage } from "@/components/common/PresetImage";
import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
  getComponentLayoutNode,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getComponentLayoutNodeStyle,
  getResponsiveGridColumnClassName,
  getResponsiveGapStyle,
  getSectionSpacingClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
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

type StyleWithVars = CSSProperties & Record<string, string>;

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
  const splitHeadingGapStyle: StyleWithVars = {
    "--text-split-heading-image-gap": getSpacingRem(resolvedDesign.headingImageGap),
  };
  const paragraphContentItems = React.Children.toArray(paragraphsContent);
  const paragraphContent = paragraphContentItems.length > 0
    ? paragraphContentItems.map((child, occurrence) =>
      isPuckSlotElement(child)
        ? React.cloneElement(child, {
          as: RepeatedBodySlotRoot,
          componentLabAnnotations:
            componentLayout?.componentLabAnnotations,
        })
        : (
          <div
            key={React.isValidElement(child) && child.key !== null
              ? child.key
              : occurrence}
            {...getComponentLabNodeAttributes(
              componentLayout,
              "body.item",
              occurrence,
            )}
          >
            {child}
          </div>
        )
    )
    : (
    <div
      className="grid"
      style={{ rowGap: getSpacingRem(resolvedDesign.paragraphGap) }}
    >
      {paragraphs.map((p, i) => (
        <div
          key={i}
          {...getComponentLabNodeAttributes(
            componentLayout,
            "body.item",
            i,
          )}
        >
          <Typography
            as="p"
            preset="sans-body"
            size={resolvedDesign.bodySize}
            weight="semantic"
            wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"}
            align={bodyAlign}
            className="text-textSecondary"
          >
            {p}
          </Typography>
        </div>
      ))}
    </div>
  );

  if (componentLayout) {
    const headingTypography = getComponentLayoutTypography(componentLayout, "heading");
    const bodyItemTypography = getComponentLayoutTypography(
      componentLayout,
      "body.item",
    );
    const slotLayoutProps = getRepeatedSlotLayoutProps(
      componentLayout,
      "body.item",
      "heading",
    );
    const layoutParagraphContentItems =
      React.Children.toArray(paragraphsContent);
    return (
      <section
        className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}
        style={getComponentSectionStyle(componentLayout)}
      >
        <div className="grid-container items-start">
          <ComponentLayoutNode layout={componentLayout} nodeId="heading">
            <Typography
              as="h3"
              preset={headingTypography?.preset ?? "sans-body"}
              size={headingTypography?.size ?? "title-sm"}
              weight="semantic"
              wrapPolicy={headingTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "heading")}
              className="text-white uppercase"
            >
              {heading}
            </Typography>
          </ComponentLayoutNode>
          {layoutParagraphContentItems.length > 0 ? (
            layoutParagraphContentItems.map((child, occurrence) =>
              isPuckSlotElement(child)
                ? React.cloneElement(child, {
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
                })
                : (
                  <ComponentLayoutNode
                    key={React.isValidElement(child) && child.key !== null
                      ? child.key
                      : occurrence}
                    gapFrom={occurrence === 0 ? "heading" : "body.item"}
                    layout={componentLayout}
                    nodeId="body.item"
                  >
                    {child}
                  </ComponentLayoutNode>
                )
            )
          ) : (
            paragraphs.map((paragraph, index) => (
              <ComponentLayoutNode
                key={index}
                gapFrom={index === 0 ? "heading" : "body.item"}
                layout={componentLayout}
                nodeId="body.item"
              >
                <Typography
                  as="p"
                  preset={bodyItemTypography?.preset ?? "sans-body"}
                  size={bodyItemTypography?.size ?? "body"}
                  weight="semantic"
                  wrapPolicy={bodyItemTypography?.wrap ?? "prose"}
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
            ))
          )}
          {imageSrc ? (
            <ComponentLayoutNode
              gapFrom="body.item"
              layout={componentLayout}
              nodeId="media"
            >
              <div className="relative w-full opacity-90">
                <PresetImage
                  src={imageSrc}
                  alt={imageAlt}
                  preset={imagePreset}
                  fitMode={imageFitMode}
                  mediaProfile={layoutVariant === "stack" ? "grid-10" : "grid-6"}
                  preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload}
                  sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined}
                />
              </div>
            </ComponentLayoutNode>
          ) : null}
        </div>
      </section>
    );
  }

    return (
        <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        <div
                            className={`mb-[var(--text-split-heading-image-gap)] md:mb-0 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitLeftHeadingBounds,
                                resolvedDesign.splitLeftHeadingBounds,
                              ),
                            )}`}
                            style={splitHeadingGapStyle}
                        >
                            <Typography as="h3" preset="sans-body" size={resolvedDesign.splitHeadingSize} weight="light" wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"} className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-6" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        <div
                            className={`grid content-center ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitLeftTextBounds,
                                resolvedDesign.splitLeftTextBounds,
                              ),
                            )}`}
                        >
                            <div className="border-l border-white/5 pl-0 lg:pl-8">
                                {paragraphContent}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        <div
                            className={`order-2 mt-[var(--text-split-heading-image-gap)] grid content-center md:order-1 md:mb-0 md:mt-0 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitRightTextBounds,
                                resolvedDesign.splitRightTextBounds,
                              ),
                            )}`}
                            style={splitHeadingGapStyle}
                        >
                            <div className="border-r border-white/5 pr-0 text-right lg:pr-8 lg:text-left">
                                {paragraphContent}
                            </div>
                        </div>
                        <div
                            className={`order-1 md:order-2 ${getResponsiveGridColumnClassName(
                              createResponsiveGridBounds(
                                { leftCol: 1, rightCol: 12 },
                                resolvedDesign.splitRightHeadingBounds,
                                resolvedDesign.splitRightHeadingBounds,
                              ),
                            )}`}
                        >
                            <Typography as="h3" preset="sans-body" size={resolvedDesign.splitHeadingSize} weight="light" wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"} align="right" className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-6" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {layoutVariant === 'stack' && (
                    <div
                        className={`grid justify-items-center text-center ${getResponsiveGridColumnClassName(
                          createResponsiveGridBounds(
                            { leftCol: 1, rightCol: 12 },
                            { leftCol: 2, rightCol: 11 },
                            resolvedDesign.stackBounds,
                          ),
                        )}`}
                    >
                        <Typography
                            as="h3"
                            preset="sans-body"
                            size={resolvedDesign.stackHeadingSize}
                            weight="strong"
                            wrapPolicy={resolvedDesign.headingAutoWrap ? "heading" : "nowrap"}
                            align="center"
                            className="px-4 text-white uppercase"
                            style={{ marginBottom: getSpacingRem(resolvedDesign.stackTextTopSpacing) }}
                        >
                            {heading}
                        </Typography>
                        <div
                            className="grid max-w-3xl border-t border-white/5"
                            style={{
                                paddingTop: getSpacingRem(resolvedDesign.stackTextTopSpacing),
                                rowGap: getSpacingRem(resolvedDesign.paragraphGap),
                            }}
                        >
                            {paragraphContent}
                        </div>
                        {imageSrc && (
                            <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100" style={{ marginTop: getSpacingRem(resolvedDesign.stackImageTopSpacing) }}>
                                <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} mediaProfile="grid-10" preload={publicMediaHint?.src === imageSrc && publicMediaHint.preload} sizes={publicMediaHint?.src === imageSrc ? publicMediaHint.sizes : undefined} />
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
