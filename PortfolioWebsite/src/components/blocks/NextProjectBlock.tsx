import React from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
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
                    <Typography
                        preset="sans-body"
                        size="label"
                        weight="medium"
                        wrapPolicy="label"
                        className="mb-4 text-textMuted opacity-70 transition-all duration-700 group-hover:opacity-100"
                    >
                        NEXT PROJECT
                    </Typography>
                    <Typography
                        as="h2"
                        preset="sans-body"
                        size="title"
                        weight="display"
                        wrapPolicy="heading"
                        align="center"
                        className="text-white uppercase transition-all duration-700"
                    >
                        {nextName}
                    </Typography>
                </div>
            </a>
            <div className="flex flex-col items-center justify-between border-t border-white/10 bg-black px-8 py-8 md:flex-row md:px-12">
                <Typography
                    as="span"
                    preset="sans-body"
                    size="caption"
                    weight="medium"
                    wrapPolicy="label"
                    className="mb-2 text-textMuted md:mb-0"
                >
                    © 2026 江承彦 / JIANG CHENGYAN
                </Typography>
                <Typography
                    as="span"
                    preset="sans-body"
                    size="caption"
                    weight="medium"
                    wrapPolicy="label"
                    className="text-textMuted"
                >
                    Designed for Darkness
                </Typography>
            </div>
        </footer>
    );
}
