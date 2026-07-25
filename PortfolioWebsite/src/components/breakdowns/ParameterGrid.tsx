import type { ReactNode } from "react";

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
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { hasEditableTextContent } from "@/lib/editable-text";
import { getParameterGridItemBounds } from "@/lib/parameter-grid-layout";

interface Parameter {
  name: ReactNode;
  value?: ReactNode;
  description: ReactNode;
  descriptionAlign?: TypographyAlignment;
}

type ParameterGridProps = {
  mediaSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  parameters?: Parameter[];
} & ComponentDesignOverride<"ParameterGrid">;

export default function ParameterGrid({
  mediaSrc,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  parameters,
  design,
}: ParameterGridProps) {
  const resolvedDesign = resolveComponentDesign("ParameterGrid", design);

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
