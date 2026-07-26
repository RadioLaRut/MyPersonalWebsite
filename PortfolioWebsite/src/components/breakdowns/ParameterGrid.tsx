import type { ReactNode } from "react";

import { PresetImage } from "@/components/common/PresetImage";
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
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
  getComponentSectionProfileClassName,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { hasEditableTextContent } from "@/lib/editable-text";
import { getParameterGridItemBounds } from "@/lib/parameter-grid-layout";
import type { PublicMediaHint } from "@/lib/media-layout";

interface Parameter {
  name: ReactNode;
  value?: ReactNode;
  description: ReactNode;
  descriptionAlign?: TypographyAlignment;
}

type ParameterGridProps = {
  mediaAlt?: string;
  mediaLabel?: ReactNode;
  mediaSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  parameters?: Parameter[];
  publicMediaHint?: PublicMediaHint;
} & ComponentDesignOverride<"ParameterGrid"> & ComponentLayoutProps;

export default function ParameterGrid({
  componentLayout,
  mediaAlt = "",
  mediaLabel,
  mediaSrc,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  parameters,
  publicMediaHint,
  design,
}: ParameterGridProps) {
  const resolvedDesign = resolveComponentDesign("ParameterGrid", design);

  if (componentLayout) {
    const mediaLabelTypography = getComponentLayoutTypography(componentLayout, "mediaLabel");
    const nameTypography = getComponentLayoutTypography(componentLayout, "item.name");
    const valueTypography = getComponentLayoutTypography(componentLayout, "item.value");
    const descriptionTypography = getComponentLayoutTypography(componentLayout, "item.description");
    return (
      <section className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}>
        {mediaSrc ? (
          <div className="relative w-full overflow-hidden bg-[#050505]">
            <div data-component-lab-node="media">
              <PresetImage
                src={mediaSrc}
                alt={mediaAlt}
                preset={imagePreset}
                fitMode={imageFitMode}
                preload={publicMediaHint?.src === mediaSrc && publicMediaHint.preload}
                mediaProfile="full-bleed"
                sizes={publicMediaHint?.src === mediaSrc ? publicMediaHint.sizes : undefined}
                imageClassName="opacity-80"
              />
            </div>
            {hasEditableTextContent(mediaLabel) ? (
              <div className="grid-container absolute inset-x-0 top-4 z-10">
                <ComponentLayoutNode layout={componentLayout} nodeId="mediaLabel">
                  <Typography
                    as="span"
                    preset={mediaLabelTypography?.preset ?? "sans-body"}
                    size={mediaLabelTypography?.size ?? "label"}
                    weight="semantic"
                    wrapPolicy={mediaLabelTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(componentLayout, "mediaLabel")}
                    className="bg-black/60 px-3 py-1 text-white"
                  >
                    {mediaLabel}
                  </Typography>
                </ComponentLayoutNode>
              </div>
            ) : null}
          </div>
        ) : null}
        {parameters && parameters.length > 0 ? (
          <div className="grid-container">
            {parameters.flatMap((parameter, index) => [
              <ComponentLayoutNode
                key={`name-${index}`}
                gapFrom={index === 0 && mediaSrc ? "media" : undefined}
                layout={componentLayout}
                nodeId="item.name"
                className="border-t border-white/20 pt-6"
              >
                <Typography
                  as="h4"
                  preset={nameTypography?.preset ?? "sans-body"}
                  size={nameTypography?.size ?? "label"}
                  weight="semantic"
                  wrapPolicy={nameTypography?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(componentLayout, "item.name")}
                  className="text-textMuted"
                >
                  {parameter.name}
                </Typography>
              </ComponentLayoutNode>,
              hasEditableTextContent(parameter.value) ? (
                <ComponentLayoutNode
                  key={`value-${index}`}
                  gapFrom="item.name"
                  layout={componentLayout}
                  nodeId="item.value"
                >
                  <Typography
                    as="div"
                    preset={valueTypography?.preset ?? "sans-body"}
                    size={valueTypography?.size ?? "body"}
                    weight="display"
                    wrapPolicy={valueTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(componentLayout, "item.value")}
                    className="text-white"
                  >
                    {parameter.value}
                  </Typography>
                </ComponentLayoutNode>
              ) : null,
              hasEditableTextContent(parameter.description) ? (
                <ComponentLayoutNode
                  key={`description-${index}`}
                  gapFrom={hasEditableTextContent(parameter.value) ? "item.value" : "item.name"}
                  layout={componentLayout}
                  nodeId="item.description"
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
                      parameter.descriptionAlign ?? "left",
                    )}
                    className="text-textSecondary"
                  >
                    {parameter.description}
                  </Typography>
                </ComponentLayoutNode>
              ) : null,
            ])}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
      {mediaSrc ? (
        <div
          className="relative w-full overflow-hidden bg-[#050505]"
          style={{ marginBottom: getSpacingRem(resolvedDesign.mediaBottomSpacing) }}
        >
          <PresetImage
            src={mediaSrc}
            alt="PCG Generation Overview"
            preset={imagePreset}
            fitMode={imageFitMode}
            preload={publicMediaHint?.src === mediaSrc && publicMediaHint.preload}
            mediaProfile="full-bleed"
            sizes={publicMediaHint?.src === mediaSrc ? publicMediaHint.sizes : undefined}
            imageClassName="opacity-80"
          />
          <div className="absolute top-4 left-4 border border-white/10 bg-black/60 px-3 py-1 backdrop-blur-md">
            <Typography
              as="span"
              preset="sans-body"
              size="caption"
              weight="semantic"
              wrapPolicy="label"
              className="text-white"
            >
              PROCEDURAL GENERATION PREVIEW
            </Typography>
          </div>
        </div>
      ) : null}

      {parameters && parameters.length > 0 && (
        <div className="grid-container">
          {parameters.map((param, i) => (
            <div
              key={i}
              className={`group w-full border-t border-white/20 pt-6 ${getResponsiveGridColumnClassName(
                createResponsiveGridBounds(
                  getParameterGridItemBounds({ leftCol: 1, rightCol: 12 }, 12, i),
                  getParameterGridItemBounds({ leftCol: 1, rightCol: 12 }, 6, i),
                  getParameterGridItemBounds(resolvedDesign.parametersBounds, resolvedDesign.itemSpan, i),
                ),
              )}`}
            >
              <Typography
                as="h4"
                preset="sans-body"
                size="caption"
                weight="semantic"
                wrapPolicy="label"
                className="mb-4 text-textMuted transition-colors group-hover:text-white"
              >
                {param.name}
              </Typography>
              {hasEditableTextContent(param.value) && (
                <Typography
                  as="div"
                  preset="sans-body"
                  size="title"
                  weight="display"
                  wrapPolicy="heading"
                  className="mb-4 text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,1)] group-hover:ml-2"
                >
                  {param.value}
                </Typography>
              )}
              <Typography
                as="p"
                preset="sans-body"
                size="body"
                weight="light"
                wrapPolicy="prose"
                align={param.descriptionAlign ?? "left"}
                className="max-w-[32ch] text-textSecondary"
              >
                {param.description}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
