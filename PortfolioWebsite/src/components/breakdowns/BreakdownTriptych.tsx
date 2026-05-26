"use client";

import type { CSSProperties, ReactNode } from "react";
import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  getGridColumnClassName,
  getSectionSpacingClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { toPlainText } from "@/lib/editable-text";

interface BreakdownTriptychProps {
  col1Title: ReactNode;
  col1Text: ReactNode;
  col1Img: string;
  col1Preset?: ImagePreset;
  col1FitMode?: ImageFitMode;
  col2Title: ReactNode;
  col2Text: ReactNode;
  col2Img: string;
  col2Preset?: ImagePreset;
  col2FitMode?: ImageFitMode;
  col3Title: ReactNode;
  col3Text: ReactNode;
  col3Img: string;
  col3Preset?: ImagePreset;
  col3FitMode?: ImageFitMode;
}

function TriptychColumn({
  title,
  text,
  img,
  alt,
  boundsClassName,
  preset = "ratio-16-9",
  fitMode = "x",
  className = "",
  style,
}: {
  title: ReactNode;
  text: ReactNode;
  img: string;
  alt: string;
  boundsClassName: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  className?: string;
  style?: CSSProperties;
}) {
  if (!title && !text && !img) return null;

  return (
    <div className={`${boundsClassName} space-y-4 ${className}`} style={style}>
      {title && (
        <Typography as="h4" preset="sans-body" size="label" weight="strong" wrapPolicy="label" className="border-l-2 pl-3 border-white/80 text-white">
          {title}
        </Typography>
      )}
      {text && (
        <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="prose" className="text-textPrimary">
          {text}
        </Typography>
      )}
      {img && (
        <div className="w-full relative overflow-hidden mt-6 border border-white/10">
          <PresetImage src={img} alt={alt} preset={preset} fitMode={fitMode} />
        </div>
      )}
    </div>
  );
}

export default function BreakdownTriptych({
  col1Title,
  col1Text,
  col1Img,
  col1Preset = "ratio-16-9",
  col1FitMode = "x",
  col2Title,
  col2Text,
  col2Img,
  col2Preset = "ratio-16-9",
  col2FitMode = "x",
  col3Title,
  col3Text,
  col3Img,
  col3Preset = "ratio-16-9",
  col3FitMode = "x",
}: BreakdownTriptychProps) {
  const design = useComponentDesign("BreakdownTriptych");
  const col1Alt = toPlainText(col1Title) ?? "Breakdown image 1";
  const col2Alt = toPlainText(col2Title) ?? "Breakdown image 2";
  const col3Alt = toPlainText(col3Title) ?? "Breakdown image 3";
  const col2Style = {
    "--triptych-col-top-spacing": getSpacingRem(design.col2TopSpacing),
  } as CSSProperties;
  const col3Style = {
    "--triptych-col-top-spacing": getSpacingRem(design.col3TopSpacing),
  } as CSSProperties;

  return (
    <section className={`relative z-20 w-full bg-black ${getSectionSpacingClassName(design.sectionSpacing)}`}>
      <div className="grid-container w-full border-t border-white/10 rhythm-divider-top">
        <TriptychColumn
          title={col1Title}
          text={col1Text}
          img={col1Img}
          alt={col1Alt}
          boundsClassName={getGridColumnClassName(design.col1Bounds)}
          preset={col1Preset}
          fitMode={col1FitMode}
        />
        <TriptychColumn
          title={col2Title}
          text={col2Text}
          img={col2Img}
          alt={col2Alt}
          boundsClassName={getGridColumnClassName(design.col2Bounds)}
          preset={col2Preset}
          fitMode={col2FitMode}
          className="mt-[var(--triptych-col-top-spacing)] lg:mt-0"
          style={col2Style}
        />
        <TriptychColumn
          title={col3Title}
          text={col3Text}
          img={col3Img}
          alt={col3Alt}
          boundsClassName={getGridColumnClassName(design.col3Bounds)}
          preset={col3Preset}
          fitMode={col3FitMode}
          className="mt-[var(--triptych-col-top-spacing)] lg:mt-0"
          style={col3Style}
        />
      </div>
    </section>
  );
}
