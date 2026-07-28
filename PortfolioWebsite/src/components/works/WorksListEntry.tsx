import React, { type ReactNode } from "react";

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
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  resolveEditableText,
  toPlainText,
} from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import WorksListEntryActivation from "./WorksListEntryActivation";

export type WorksListEntryAlias = {
  slug: string;
};

interface WorksListEntryProps extends ComponentDesignOverride<"WorksListEntry">, ComponentLayoutProps {
  aliases?: WorksListEntryAlias[];
  id: string;
  number?: ReactNode;
  href?: string;
  title: ReactNode;
  category: ReactNode;
  imageSrc: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  desc: ReactNode;
  descriptionAlign?: TypographyAlignment;
  editMode?: boolean;
}

export default function WorksListEntry({
  componentLayout,
  number,
  href,
  title,
  category,
  imageSrc,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  desc,
  descriptionAlign = "left",
  editMode = false,
  design: designOverride,
}: WorksListEntryProps) {
  const design = resolveComponentDesign("WorksListEntry", designOverride);
  const plainTitle = toPlainText(title);
  const plainCategory = toPlainText(category);
  const resolvedNumber = resolveEditableText(number, "00");
  const isLinkEnabled = !editMode && Boolean(href);
  const cursorClass = isLinkEnabled ? "cursor-pointer" : "cursor-default";
  const numberBoundsClassName = getResponsiveGridColumnClassName(design.numberBounds);
  const titleBoundsClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 3, rightCol: 12 },
      design.titleBounds.md,
      design.titleBounds.lg,
    ),
  );
  const sidebarBoundsClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 3, rightCol: 12 },
      design.sidebarBounds.md,
      design.sidebarBounds.lg,
    ),
  );
  const numberTypography = getComponentLayoutTypography(
    componentLayout,
    "item.number",
  );
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "item.title",
  );
  const categoryTypography = getComponentLayoutTypography(
    componentLayout,
    "item.category",
  );
  const descriptionTypography = getComponentLayoutTypography(
    componentLayout,
    "item.description",
  );
  const forceLabPreview = componentLayout?.componentLabAnnotations === true;

  return (
    <MotionLink
      href={href || "#"}
      disabled={!isLinkEnabled}
      disabledElement="div"
      interactionPreset="blockLink"
      className={`group relative grid min-h-[calc(var(--site-viewport-unit)*26)] w-full content-center border-b border-white/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-white/70 ${cursorClass} sm:min-h-[calc(var(--site-viewport-unit)*30)] md:min-h-[calc(var(--site-viewport-unit)*34)] lg:min-h-[calc(var(--site-viewport-unit)*42)]`}
      data-active="false"
      data-works-entry=""
      aria-label={
        plainTitle
          ? `打开作品 ${plainTitle}${plainCategory ? `，${plainCategory}` : ""}`
          : "打开作品"
      }
    >
      <div className={`grid-container relative z-10 items-baseline py-8 md:py-12 lg:py-16 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
        <ComponentLayoutNode
          className={!componentLayout
            ? `${numberBoundsClassName} self-baseline`
            : "self-baseline"}
          layout={componentLayout}
          nodeId="item.number"
        >
          <div className="relative grid w-fit">
            <Typography
              preset={numberTypography?.preset ?? "sans-body"}
              size={numberTypography?.size ?? "label"}
              weight="semantic"
              wrapPolicy={numberTypography?.wrap ?? "label"}
              align={getComponentLayoutAlignment(
                componentLayout,
                "item.number",
              )}
              className="text-textMuted transition-colors duration-700 ease-out group-data-[active=true]:text-white/[0.76]"
            >
              {resolvedNumber}
            </Typography>
            <span
              className="absolute top-full mt-3 h-px w-2 bg-white/60 opacity-40 transition-[width,opacity] duration-700 ease-out group-data-[active=true]:w-4 group-data-[active=true]:opacity-100"
              aria-hidden="true"
            />
          </div>
        </ComponentLayoutNode>

        <ComponentLayoutNode
          className={`${!componentLayout ? titleBoundsClassName : ""} grid self-baseline content-center py-4`}
          layout={componentLayout}
          nodeId="item.title"
        >
          <Typography
            as="h2"
            preset={titleTypography?.preset ?? "luna-editorial"}
            size={titleTypography?.size ?? "title"}
            weight="display"
            wrapPolicy={titleTypography?.wrap ?? "heading"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "item.title",
            )}
            className="break-words py-2 uppercase text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.42)] transition-all duration-700 ease-out group-data-[active=true]:text-white/[0.92] group-data-[active=true]:[-webkit-text-stroke:1px_rgba(255,255,255,0)]"
          >
            {title}
          </Typography>
        </ComponentLayoutNode>

        <ComponentLayoutNode
          className={`${!componentLayout ? sidebarBoundsClassName : ""} mt-4 grid self-center content-center md:mt-0 md:pl-6 lg:pl-8`}
          layout={componentLayout}
          nodeId="item.category"
        >
          <div className="grid gap-1">
            {hasEditableTextContent(category) ? (
              <Typography
                as="p"
                preset={categoryTypography?.preset ?? "gothic-editorial"}
                size={categoryTypography?.size ?? "label"}
                weight="semantic"
                wrapPolicy={categoryTypography?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "item.category",
                )}
                className="text-textSecondary uppercase transition-colors duration-700 ease-out group-data-[active=true]:text-textPrimary"
              >
                {category}
              </Typography>
            ) : null}
            {hasEditableTextContent(desc) ? (
              <ComponentLayoutNode
                layout={componentLayout}
                nodeId="item.description"
                style={{ position: "relative", top: "auto", translate: "none" }}
              >
                <div
                  className={`-translate-x-2.5 transition-[opacity,transform] duration-700 ease-out group-data-[active=true]:translate-x-0 group-data-[active=true]:opacity-100 ${
                    forceLabPreview ? "translate-x-0 opacity-100" : "opacity-0"
                  }`}
                >
                  <Typography
                    as="p"
                    preset={descriptionTypography?.preset ?? "sans-body"}
                    size={descriptionTypography?.size ?? "body-sm"}
                    weight="light"
                    wrapPolicy={descriptionTypography?.wrap ?? "prose"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "item.description",
                      descriptionAlign,
                    )}
                    className="mt-4 text-textSecondary"
                  >
                    {desc}
                  </Typography>
                </div>
              </ComponentLayoutNode>
            ) : null}
          </div>
        </ComponentLayoutNode>
      </div>
      {imageSrc ? (
        <WorksListEntryActivation
          componentLabAnnotations={forceLabPreview}
          forceVisible={forceLabPreview}
          imageAlt={plainTitle ?? "Work entry"}
          imageFitMode={imageFitMode}
          imagePreset={imagePreset}
          imageSrc={imageSrc}
        />
      ) : null}
    </MotionLink>
  );
}
