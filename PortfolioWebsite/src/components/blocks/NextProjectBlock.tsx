"use client";

import React from "react";

import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
    getGridColumnClassName,
    getResponsiveGridColumnClassName,
    getSpacingRem,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";

interface NextProjectBlockProps {
    nextId: string;
    nextName: string;
    nextBg: string;
    href?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    editMode?: boolean;
}

export default function NextProjectBlock({
    nextId,
    nextName,
    nextBg,
    href,
    imagePreset = "ratio-21-9",
    imageFitMode = "x",
    editMode = false,
}: NextProjectBlockProps) {
    const design = useComponentDesign("NextProjectBlock");
    const nextHref = href ?? `/works/${nextId}`;
    const backgroundImage = nextBg || CANONICAL_PLACEHOLDER_PATH;

    return (
        <footer className="mt-0 border-t border-white/20 relative z-20">
            <a
                href={nextHref}
                onClick={(event) => {
                    if (editMode) {
                        event.preventDefault();
                    }
                }}
                className={`group block relative h-[40vh] md:h-[60vh] overflow-hidden w-full bg-black ${editMode ? "cursor-default" : "interactive"}`}
            >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 z-10 transition-colors duration-700 pointer-events-none"></div>
                <div className="absolute inset-0 grid place-items-center">
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

                <div className="pointer-events-none absolute inset-0 z-20">
                    <div className="grid-container h-full">
                        <div className={`${getGridColumnClassName(design.overlayBounds)} grid h-full place-items-center text-center mix-blend-difference`}>
                            <div className="rhythm-stack-4">
                                <Typography
                                    preset="sans-body"
                                    size="label"
                                    weight="semantic"
                                    wrapPolicy="label"
                                    className="text-textMuted opacity-70 transition-all duration-700 group-hover:opacity-100"
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
                        </div>
                    </div>
                </div>
            </a>
            <div className="border-t border-white/10 bg-black">
                <div
                    className="grid-container gap-y-2 py-8 text-center md:text-left"
                    style={{ paddingTop: getSpacingRem(design.footerTopSpacing), paddingBottom: getSpacingRem(design.footerTopSpacing) }}
                >
                    <div className="col-span-12 grid grid-cols-12 gap-y-2 text-center lg:items-center lg:text-left">
                        <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="semantic"
                            wrapPolicy="label"
                            className={`${getResponsiveGridColumnClassName(design.footerLeftBounds)} text-textMuted`}
                        >
                            © 2026 江承彦 / JIANG CHENGYAN
                        </Typography>
                        <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="semantic"
                            wrapPolicy="label"
                            className={`${getResponsiveGridColumnClassName(design.footerRightBounds)} text-textMuted lg:text-right lg:justify-self-end`}
                        >
                            Designed for Darkness
                        </Typography>
                    </div>
                </div>
            </div>
        </footer>
    );
}
