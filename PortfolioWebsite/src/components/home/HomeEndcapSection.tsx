import type { ReactNode } from "react";
import ComponentLayoutNode, {
  getComponentLayoutAlignment,
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
import { MotionLink } from "@/components/motion/MotionLink";
import {
  getGridColumnClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
} from "@/lib/component-design-style";
import { hasEditableTextContent } from "@/lib/editable-text";
import { isExternalWebHref } from "@/lib/puck-href";

type HomeEndcapSectionProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  descriptionAlign?: TypographyAlignment;
  buttonLabel: ReactNode;
  buttonHref: string;
  editMode?: boolean;
} & ComponentDesignOverride<"HomeEndcapSection"> & ComponentLayoutProps;

export default function HomeEndcapSection({
  eyebrow,
  title,
  description,
  descriptionAlign = "center",
  buttonLabel,
  buttonHref,
  componentLayout,
  editMode = false,
  design,
}: HomeEndcapSectionProps) {
  const resolvedDesign = resolveComponentDesign("HomeEndcapSection", design);
  const hasDescription = hasEditableTextContent(description);
  const buttonTopSpacing = getSpacingRem(
    hasDescription ? resolvedDesign.buttonTopSpacing : "32",
  );
  const opensInNewTab = !editMode && isExternalWebHref(buttonHref);
  const eyebrowTypography = getComponentLayoutTypography(
    componentLayout,
    "eyebrow",
  );
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "title",
  );
  const descriptionTypography = getComponentLayoutTypography(
    componentLayout,
    "description",
  );
  const ctaTypography = getComponentLayoutTypography(componentLayout, "cta");
  const fallbackBounds = componentLayout
    ? undefined
    : getGridColumnClassName(resolvedDesign.contentBounds);

  return (
    <section
      className={`relative isolate grid min-h-[calc(var(--site-viewport-unit)*54)] w-full items-center overflow-hidden border-t border-white/10 bg-black md:min-h-[calc(var(--site-viewport-unit)*60)] lg:min-h-[calc(var(--site-viewport-unit)*68)] ${
        componentLayout
          ? getComponentSectionProfileClassName(componentLayout)
          : "rhythm-section-spacious"
      }`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="grid-container relative z-10">
        {hasEditableTextContent(eyebrow) ? (
          <ComponentLayoutNode
            className={fallbackBounds}
            layout={componentLayout}
            nodeId="eyebrow"
          >
            <Typography
              as="p"
              preset={eyebrowTypography?.preset ?? "sans-body"}
              size={eyebrowTypography?.size ?? "caption"}
              weight="semantic"
              wrapPolicy={eyebrowTypography?.wrap ?? "label"}
              align={getComponentLayoutAlignment(
                componentLayout,
                "eyebrow",
                "center",
              )}
              className="text-white/35"
            >
              {eyebrow}
            </Typography>
          </ComponentLayoutNode>
        ) : null}

        <ComponentLayoutNode
          className={fallbackBounds}
          gapFrom={hasEditableTextContent(eyebrow) ? "eyebrow" : undefined}
          layout={componentLayout}
          nodeId="title"
          style={!componentLayout && hasEditableTextContent(eyebrow)
            ? { marginTop: "1.5rem" }
            : undefined}
        >
          <Typography
            as="h2"
            preset={titleTypography?.preset ?? "luna-editorial"}
            size={titleTypography?.size ?? resolvedDesign.titleSize}
            weight="semantic"
            wrapPolicy={titleTypography?.wrap ?? "heading"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "title",
              "center",
            )}
            className="text-white uppercase"
          >
            {title}
          </Typography>
        </ComponentLayoutNode>

        {hasDescription ? (
          <ComponentLayoutNode
            className={fallbackBounds}
            gapFrom="title"
            layout={componentLayout}
            nodeId="description"
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
              weight="medium"
              wrapPolicy={descriptionTypography?.wrap ?? "prose"}
              align={getComponentLayoutAlignment(
                componentLayout,
                "description",
                descriptionAlign,
              )}
              className="mx-auto w-full max-w-3xl text-white/55 uppercase"
            >
              {description}
            </Typography>
          </ComponentLayoutNode>
        ) : null}

        {hasEditableTextContent(buttonLabel) && buttonHref ? (
          <ComponentLayoutNode
            alignmentTarget="box"
            className={fallbackBounds}
            gapFrom={hasDescription ? "description" : "title"}
            layout={componentLayout}
            nodeId="cta"
            style={!componentLayout ? { marginTop: buttonTopSpacing } : undefined}
          >
            <MotionLink
              href={buttonHref}
              scroll
              disabled={editMode}
              target={opensInNewTab ? "_blank" : undefined}
              rel={opensInNewTab ? "noopener noreferrer" : undefined}
              className="interactive inline-grid grid-flow-col auto-cols-max items-center gap-4 border border-white/20 px-6 py-4 text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              <Typography
                preset={ctaTypography?.preset ?? "sans-body"}
                size={ctaTypography?.size ?? "label"}
                weight="semantic"
                wrapPolicy={ctaTypography?.wrap ?? "label"}
                align="center"
                className="text-inherit"
              >
                {buttonLabel}
              </Typography>
            </MotionLink>
          </ComponentLayoutNode>
        ) : null}
      </div>
    </section>
  );
}
