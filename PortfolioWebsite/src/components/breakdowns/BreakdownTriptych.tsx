"use client";

import React from "react";

interface BreakdownTriptychProps {
  col1Title: string;
  col1Text: string;
  col1Img: string;
  col2Title: string;
  col2Text: string;
  col2Img: string;
  col3Title: string;
  col3Text: string;
  col3Img: string;
}

export default function BreakdownTriptych({
  col1Title,
  col1Text,
  col1Img,
  col2Title,
  col2Text,
  col2Img,
  col3Title,
  col3Text,
  col3Img,
}: BreakdownTriptychProps) {
  return (
    <section className="w-full relative z-20 bg-black pb-32">
      <div className="grid-container w-full pt-16 border-t border-white/10">
        <div className="col-span-4 md:col-span-3 space-y-4">
          <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
            {col1Title}
          </h4>
          <p className="text-white/70 text-sm font-medium leading-[2] font-futura">{col1Text}</p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <img src={col1Img} alt={col1Title} className="w-full h-auto object-contain block" />
          </div>
        </div>

        <div className="col-span-4 md:col-start-5 md:col-span-4 space-y-4 mt-16 md:mt-0">
          <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
            {col2Title}
          </h4>
          <p className="text-white/70 text-sm font-medium leading-[2] font-futura">{col2Text}</p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <img src={col2Img} alt={col2Title} className="w-full h-auto object-contain block" />
          </div>
        </div>

        <div className="col-span-4 md:col-start-10 md:col-span-3 space-y-4 mt-16 md:mt-0">
          <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
            {col3Title}
          </h4>
          <p className="text-white/70 text-sm font-medium leading-[2] font-futura">{col3Text}</p>
          <div className="w-full relative overflow-hidden mt-6 border border-white/10">
            <img src={col3Img} alt={col3Title} className="w-full h-auto object-contain block" />
          </div>
        </div>
      </div>
    </section>
  );
}
