"use client";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  getGridColumnStyle,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { getParameterGridItemBounds } from "@/lib/parameter-grid-layout";

interface Parameter {
  name: string;
  value?: string;
  description: string;
}

interface ParameterGridProps {
  mediaSrc: string;
  isVideo?: boolean;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  parameters?: Parameter[];
}

export default function ParameterGrid({
  mediaSrc,
  isVideo = false,
  imagePreset = "ratio-21-9",
  imageFitMode = "x",
  parameters
}: ParameterGridProps) {
  const design = useComponentDesign("ParameterGrid");

  return (
    <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)}`}>
      <div
        className="relative w-full overflow-hidden bg-[#050505]"
        style={{ marginBottom: getSpacingRem(design.mediaBottomSpacing) }}
      >
        {isVideo ? (
          <video
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <PresetImage
            src={mediaSrc}
            alt="PCG Generation Overview"
            preset={imagePreset}
            fitMode={imageFitMode}
            imageClassName="opacity-80"
          />
        )}
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

      {parameters && parameters.length > 0 && (
        <div className="grid-container">
          {parameters.map((param, i) => (
            <div
              key={i}
              className="group w-full border-t border-white/20 pt-6"
              style={getGridColumnStyle(
                getParameterGridItemBounds(design.parametersBounds, design.itemSpan, i),
              )}
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
              {param.value && (
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
                className="max-w-[32ch] text-textMuted"
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
