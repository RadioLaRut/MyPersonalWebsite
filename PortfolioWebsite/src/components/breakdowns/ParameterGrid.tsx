import type { ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLabNodeAttributes,
  getComponentLayoutAlignment,
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
  createResponsiveGridBounds,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { hasEditableTextContent } from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";
import { getParameterGridItemBounds } from "@/lib/parameter-grid-layout";

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
  const resolvedMediaLabel = hasEditableTextContent(mediaLabel)
    ? mediaLabel
    : "PROCEDURAL GENERATION PREVIEW";
  const mediaLabelTypography = getComponentLayoutTypography(
    componentLayout,
    "mediaLabel",
  );
  const nameTypography = getComponentLayoutTypography(
    componentLayout,
    "item.name",
  );
  const valueTypography = getComponentLayoutTypography(
    componentLayout,
    "item.value",
  );
  const descriptionTypography = getComponentLayoutTypography(
    componentLayout,
    "item.description",
  );
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      {mediaSrc ? (
        <div
          className="relative w-full overflow-hidden bg-[#050505]"
          style={!componentLayout
            ? {
              marginBottom: getSpacingRem(
                resolvedDesign.mediaBottomSpacing,
              ),
            }
            : undefined}
        >
          <div {...getComponentLabNodeAttributes(componentLayout, "media")}>
            <PresetImage
              src={mediaSrc}
              alt={mediaAlt || "PCG Generation Overview"}
              preset={imagePreset}
              fitMode={imageFitMode}
              preload={publicMediaHint?.src === mediaSrc &&
                publicMediaHint.preload}
              mediaProfile="full-bleed"
              sizes={publicMediaHint?.src === mediaSrc
                ? publicMediaHint.sizes
                : undefined}
              imageClassName="opacity-80"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="grid-container h-full">
              <ComponentLayoutNode
                className="pointer-events-auto self-start pt-4"
                layout={componentLayout}
                nodeId="mediaLabel"
              >
                <Typography
                  as="span"
                  preset={mediaLabelTypography?.preset ?? "sans-body"}
                  size={mediaLabelTypography?.size ?? "caption"}
                  weight="semantic"
                  wrapPolicy={mediaLabelTypography?.wrap ?? "label"}
                  align={getComponentLayoutAlignment(
                    componentLayout,
                    "mediaLabel",
                  )}
                  className="inline-block w-fit border border-white/10 bg-black/60 px-3 py-1 text-white backdrop-blur-md"
                >
                  {resolvedMediaLabel}
                </Typography>
              </ComponentLayoutNode>
            </div>
          </div>
        </div>
      ) : null}

      {parameters && parameters.length > 0 ? (
        <div className="grid-container">
          <ComponentLayoutNode
            className={`grid-subgrid ${
              componentLayout
                ? ""
                : getResponsiveGridColumnClassName(
                  createResponsiveGridBounds(
                    { leftCol: 1, rightCol: 12 },
                    { leftCol: 1, rightCol: 12 },
                    resolvedDesign.parametersBounds,
                  ),
                )
            }`}
            gapFrom={mediaSrc ? "media" : undefined}
            layout={componentLayout}
            nodeId="items"
          >
            {parameters.map((parameter, index) => (
              <article
                key={index}
                className={`group grid-subgrid w-full border-t border-white/20 pt-6 ${
                  getResponsiveGridColumnClassName(
                    createResponsiveGridBounds(
                      getParameterGridItemBounds(
                        { leftCol: 1, rightCol: 12 },
                        12,
                        index,
                      ),
                      getParameterGridItemBounds(
                        { leftCol: 1, rightCol: 12 },
                        6,
                        index,
                      ),
                      getParameterGridItemBounds(
                        { leftCol: 1, rightCol: 12 },
                        resolvedDesign.itemSpan,
                        index,
                      ),
                    ),
                  )
                }`}
              >
                <ComponentLayoutNode
                  layout={componentLayout}
                  nodeId="item.name"
                  occurrence={index}
                >
                  <Typography
                    as="h4"
                    preset={nameTypography?.preset ?? "sans-body"}
                    size={nameTypography?.size ?? "caption"}
                    weight="semantic"
                    wrapPolicy={nameTypography?.wrap ?? "label"}
                    align={getComponentLayoutAlignment(
                      componentLayout,
                      "item.name",
                    )}
                    className="mb-4 text-textMuted transition-colors group-hover:text-white"
                  >
                    {parameter.name}
                  </Typography>
                </ComponentLayoutNode>
                {hasEditableTextContent(parameter.value) ? (
                  <ComponentLayoutNode
                    gapFrom="item.name"
                    layout={componentLayout}
                    nodeId="item.value"
                    occurrence={index}
                  >
                    <Typography
                      as="div"
                      preset={valueTypography?.preset ?? "sans-body"}
                      size={valueTypography?.size ?? "title"}
                      weight="display"
                      wrapPolicy={valueTypography?.wrap ?? "heading"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "item.value",
                      )}
                      className="mb-4 text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:ml-2 group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,1)]"
                    >
                      {parameter.value}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(parameter.description) ? (
                  <ComponentLayoutNode
                    gapFrom={hasEditableTextContent(parameter.value)
                      ? "item.value"
                      : "item.name"}
                    layout={componentLayout}
                    nodeId="item.description"
                    occurrence={index}
                  >
                    <Typography
                      as="p"
                      preset={descriptionTypography?.preset ?? "sans-body"}
                      size={descriptionTypography?.size ?? "body"}
                      weight="light"
                      wrapPolicy={descriptionTypography?.wrap ?? "prose"}
                      align={getComponentLayoutAlignment(
                        componentLayout,
                        "item.description",
                        parameter.descriptionAlign ?? "left",
                      )}
                      className="max-w-[32ch] text-textSecondary"
                    >
                      {parameter.description}
                    </Typography>
                  </ComponentLayoutNode>
                ) : null}
              </article>
            ))}
          </ComponentLayoutNode>
        </div>
      ) : null}
    </section>
  );
}
