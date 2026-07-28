import type { ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getGridColumnClassName,
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { hasEditableTextContent } from "@/lib/editable-text";

type LightingCollectionHeroHeaderProps = {
  title: ReactNode;
  subtitle: ReactNode;
  descriptionLine1: ReactNode;
  descriptionLine2: ReactNode;
  descriptionAlign?: TypographyAlignment;
  ctaLabel?: ReactNode;
  ctaHref?: string;
  editMode?: boolean;
} & ComponentDesignOverride<"PortfolioHeroHeader"> & ComponentLayoutProps;

export default function LightingCollectionHeroHeader({
  title,
  subtitle,
  descriptionLine1,
  descriptionLine2,
  descriptionAlign = "left",
  ctaLabel,
  ctaHref,
  componentLayout,
  editMode = false,
  design,
}: LightingCollectionHeroHeaderProps) {
  const resolvedDesign = resolveComponentDesign(
    "PortfolioHeroHeader",
    design,
  );
  const hasSubtitle = hasEditableTextContent(subtitle);
  const hasDescriptionLine1 = hasEditableTextContent(descriptionLine1);
  const hasDescriptionLine2 = hasEditableTextContent(descriptionLine2);
  const hasCta = hasEditableTextContent(ctaLabel) && Boolean(ctaHref);
  const hasSideRail = hasDescriptionLine1 || hasDescriptionLine2 || hasCta;
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "title",
  );
  const subtitleTypography = getComponentLayoutTypography(
    componentLayout,
    "subtitle",
  );
  const eyebrowTypography = getComponentLayoutTypography(
    componentLayout,
    "sideEyebrow",
  );
  const descriptionTypography = getComponentLayoutTypography(
    componentLayout,
    "description",
  );
  const ctaTypography = getComponentLayoutTypography(
    componentLayout,
    "cta",
  );

  return (
    <section
      className={`border-b border-white/10 ${
        componentLayout
          ? getComponentSectionProfileClassName(componentLayout)
          : "rhythm-section-hero"
      }`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container">
        <div className="grid-subgrid col-span-12 lg:items-end">
          <div
            className={componentLayout
              ? "contents"
              : hasSideRail
                ? getResponsiveGridColumnClassName(
                  resolvedDesign.titleBounds,
                )
                : getGridColumnClassName(
                  resolvedDesign.singleColumnBounds,
                )}
          >
            <ComponentLayoutNode
              layout={componentLayout}
              nodeId="title"
              className={hasSideRail
                ? "max-w-[52rem]"
                : "max-w-[64rem]"}
            >
              <Typography
                as="h1"
                preset={titleTypography?.preset ?? "luna-editorial"}
                size={titleTypography?.size ?? "display"}
                weight="semantic"
                wrapPolicy={titleTypography?.wrap ?? "heading"}
                align={getComponentLayoutAlignment(componentLayout, "title")}
                className="text-white"
              >
                {title}
              </Typography>
            </ComponentLayoutNode>
            {hasSubtitle ? (
              <ComponentLayoutNode
                gapFrom="title"
                layout={componentLayout}
                nodeId="subtitle"
                style={!componentLayout
                  ? { marginTop: "0.25rem" }
                  : undefined}
              >
                <Typography
                  as="h2"
                  preset={subtitleTypography?.preset ?? "luna-editorial"}
                  size={subtitleTypography?.size ?? "title"}
                  weight="display"
                  wrapPolicy={subtitleTypography?.wrap ?? "heading"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "subtitle",
                  )}
                  className="text-white/82"
                >
                  {subtitle}
                </Typography>
              </ComponentLayoutNode>
            ) : null}
          </div>

          {hasSideRail ? (
            <div
              className={componentLayout
                ? "contents"
                : getResponsiveGridColumnClassName(
                  resolvedDesign.sideBounds,
                )}
            >
              {hasDescriptionLine1 ? (
                <ComponentLayoutNode
                  layout={componentLayout}
                  nodeId="sideEyebrow"
                  className={!componentLayout ? "lg:pl-4" : undefined}
                >
                  <Typography
                    as="p"
                    preset={eyebrowTypography?.preset ?? "sans-body"}
                    size={eyebrowTypography?.size ?? "caption"}
                    weight="semantic"
                    wrapPolicy={eyebrowTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "sideEyebrow",
                    )}
                    className="text-textMuted"
                  >
                    {descriptionLine1}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {hasDescriptionLine2 ? (
                <ComponentLayoutNode
                  gapFrom={hasDescriptionLine1
                    ? "sideEyebrow"
                    : undefined}
                  layout={componentLayout}
                  nodeId="description"
                  className={!componentLayout ? "lg:pl-4" : undefined}
                  style={!componentLayout
                    ? {
                      marginTop: getSpacingRem(
                        resolvedDesign.descriptionTopSpacing,
                      ),
                    }
                    : undefined}
                >
                  <Typography
                    as="p"
                    preset={descriptionTypography?.preset ?? "sans-body"}
                    size={descriptionTypography?.size ?? "body"}
                    weight="semantic"
                    wrapPolicy={descriptionTypography?.wrap ?? "prose"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "description",
                      descriptionAlign,
                    )}
                    className="text-textPrimary/90"
                  >
                    {descriptionLine2}
                  </Typography>
                </ComponentLayoutNode>
              ) : null}
              {hasCta && ctaHref ? (
                <ComponentLayoutNode
                  alignmentTarget="box"
                  gapFrom={hasDescriptionLine2
                    ? "description"
                    : hasDescriptionLine1
                      ? "sideEyebrow"
                      : undefined}
                  layout={componentLayout}
                  nodeId="cta"
                  className={!componentLayout ? "lg:ml-4" : undefined}
                  style={!componentLayout
                    ? {
                      marginTop: getSpacingRem(
                        resolvedDesign.ctaTopSpacing,
                      ),
                    }
                    : undefined}
                >
                  <MotionLink
                    href={ctaHref}
                    disabled={editMode}
                    className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                  >
                    <span className="h-px w-6 bg-white/30 transition-all duration-300 group-hover:w-10 group-hover:bg-white" />
                    <Typography
                      preset={ctaTypography?.preset ?? "sans-body"}
                      size={ctaTypography?.size ?? "label"}
                      weight="semantic"
                      wrapPolicy={ctaTypography?.wrap ?? "label"}
                      align="center"
                      className="text-inherit"
                    >
                      {ctaLabel}
                    </Typography>
                  </MotionLink>
                </ComponentLayoutNode>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
