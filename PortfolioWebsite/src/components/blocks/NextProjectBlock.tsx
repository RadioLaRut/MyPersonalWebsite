import React from "react";

import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";

interface NextProjectBlockProps {
    nextId: string;
    nextName: string;
    nextBg: string;
    href?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
}

export default function NextProjectBlock({
    nextId,
    nextName,
    nextBg,
    href,
    imagePreset = "ratio-21-9",
    imageFitMode = "x",
}: NextProjectBlockProps) {
    const nextHref = href ?? `/works/${nextId}`;
    const backgroundImage = nextBg || CANONICAL_PLACEHOLDER_PATH;

    return (
        <footer className="mt-0 border-t border-white/20 relative z-20">
            <a
                href={nextHref}
                className="group block relative h-[40vh] md:h-[60vh] overflow-hidden w-full interactive bg-black"
            >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 z-10 transition-colors duration-700 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <PresetImage
                        src={backgroundImage}
                        alt="Next Project"
                        preset={imagePreset}
                        fitMode={imageFitMode}
                        sizes="100vw"
                        frameClassName="w-full"
                        imageClassName="scale-100 transition-all duration-700 ease-out opacity-40 group-hover:scale-105 group-hover:opacity-100"
                    />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 mix-blend-difference pointer-events-none">
                    <span className="font-mono text-xs text-textMuted tracking-[0.3em] uppercase mb-4 opacity-70 group-hover:opacity-100 transition-all duration-700">
                        NEXT PROJECT
                    </span>
                    <h2 className="text-4xl md:text-[6vw] text-white font-black uppercase tracking-tighter transition-all duration-700 leading-none font-futura">
                        {nextName}
                    </h2>
                </div>
            </a>
            <div className="bg-black py-8 px-8 md:px-12 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-mono text-textMuted tracking-widest border-t border-white/10">
                <span className="mb-2 md:mb-0">© 2026 江承彦 / JIANG CHENGYAN</span>
                <span>Designed for Darkness</span>
            </div>
        </footer>
    );
}
