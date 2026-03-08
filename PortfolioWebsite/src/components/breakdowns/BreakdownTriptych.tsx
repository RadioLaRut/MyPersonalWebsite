"use client";

import React from "react";
import BilingualText from "@/components/common/BilingualText";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

interface BreakdownTriptychProps {
  col1Title: string;
  col1Text: string;
  col1Img: string;
  col1Preset?: ImagePreset;
  col1FitMode?: ImageFitMode;
  col2Title: string;
  col2Text: string;
  col2Img: string;
  col2Preset?: ImagePreset;
  col2FitMode?: ImageFitMode;
  col3Title: string;
  col3Text: string;
  col3Img: string;
  col3Preset?: ImagePreset;
  col3FitMode?: ImageFitMode;
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
  return (
    <section className="w-full relative z-20 bg-black pb-32">
      <div className="grid-container w-full pt-16 border-t border-white/10">
        <div className="col-span-4 md:col-span-3 space-y-4">
          <h4 className="text-white text-base font-bold tracking-[0.18em] uppercase border-l-2 pl-3 border-white/80 leading-snug font-futura break-words">
            {col1Title}
          </h4>
          <p className="text-white/70 text-sm md:text-[15px] leading-[1.95] break-words"><BilingualText text={col1Text} weight="medium" /></p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <PresetImage src={col1Img} alt={col1Title} preset={col1Preset} fitMode={col1FitMode} />
          </div>
        </div>

        <div className="col-span-4 md:col-start-5 md:col-span-4 space-y-4 mt-16 md:mt-0">
          <h4 className="text-white text-base font-bold tracking-[0.18em] uppercase border-l-2 pl-3 border-white/80 leading-snug font-futura break-words">
            {col2Title}
          </h4>
          <p className="text-white/70 text-sm md:text-[15px] leading-[1.95] break-words"><BilingualText text={col2Text} weight="medium" /></p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <PresetImage src={col2Img} alt={col2Title} preset={col2Preset} fitMode={col2FitMode} />
          </div>
        </div>

        <div className="col-span-4 md:col-start-10 md:col-span-3 space-y-4 mt-16 md:mt-0">
          <h4 className="text-white text-base font-bold tracking-[0.18em] uppercase border-l-2 pl-3 border-white/80 leading-snug font-futura break-words">
            {col3Title}
          </h4>
          <p className="text-white/70 text-sm md:text-[15px] leading-[1.95] break-words"><BilingualText text={col3Text} weight="medium" /></p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <PresetImage src={col3Img} alt={col3Title} preset={col3Preset} fitMode={col3FitMode} />
          </div>
        </div>
      </div>
    </section>
  );
}
