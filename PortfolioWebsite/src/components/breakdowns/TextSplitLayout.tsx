'use client';

import React, { type CSSProperties, type ReactNode } from 'react';

import { PresetImage } from '@/components/common/PresetImage';
import Typography from "@/components/common/Typography";
import { useComponentDesign } from '@/components/layout/ComponentDesignProvider';
import {
  getGridColumnStyle,
  getSectionSpacingClassName,
  getSpacingRem,
} from '@/lib/component-design-style';
import { type ImageFitMode, type ImagePreset } from '@/lib/image-presentation';

interface TextSplitLayoutProps {
    heading: ReactNode;
    paragraphs: ReactNode[];
    imageSrc?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    layoutVariant?: 'split-left' | 'split-right' | 'stack';
    paragraphsContent?: ReactNode;
}

type StyleWithVars = CSSProperties & Record<string, string>;

export default function TextSplitLayout({
    heading,
    paragraphs,
    imageSrc,
    imagePreset = "ratio-16-9",
    imageFitMode = "x",
    layoutVariant = 'split-left',
    paragraphsContent,
}: TextSplitLayoutProps) {
    const design = useComponentDesign('TextSplitLayout');
    const imageAlt = typeof heading === 'string' ? heading : 'TextSplitLayout image';
    const splitHeadingGapStyle: StyleWithVars = {
        "--text-split-heading-image-gap": getSpacingRem(design.headingImageGap),
    };
    const paragraphContent = paragraphsContent ?? (
        <div
            className="grid"
            style={{ rowGap: getSpacingRem(design.paragraphGap) }}
        >
            {paragraphs.map((p, i) => (
                <Typography
                    key={i}
                    as="p"
                    preset="sans-body"
                    size={design.bodySize}
                    weight="semantic"
                    wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"}
                    className="text-textMuted"
                >
                    {p}
                </Typography>
                ))}
        </div>
    );

    return (
        <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)}`}>
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        <div
                            className="mb-[var(--text-split-heading-image-gap)] lg:mb-0"
                            style={{
                                ...splitHeadingGapStyle,
                                ...getGridColumnStyle(design.splitLeftHeadingBounds),
                            }}
                        >
                            <Typography as="h3" preset="sans-body" size={design.splitHeadingSize} weight="light" wrapPolicy={design.headingAutoWrap ? "heading" : "nowrap"} className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        <div
                            className="grid content-center"
                            style={getGridColumnStyle(design.splitLeftTextBounds)}
                        >
                            <div className="border-l border-white/5 pl-0 lg:pl-8">
                                {paragraphContent}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        <div
                            className="order-2 mt-[var(--text-split-heading-image-gap)] grid content-center lg:order-1 lg:mb-0 lg:mt-0"
                            style={{
                                ...splitHeadingGapStyle,
                                ...getGridColumnStyle(design.splitRightTextBounds),
                            }}
                        >
                            <div className="border-r border-white/5 pr-0 text-right lg:pr-8 lg:text-left">
                                {paragraphContent}
                            </div>
                        </div>
                        <div
                            className="order-1 lg:order-2"
                            style={getGridColumnStyle(design.splitRightHeadingBounds)}
                        >
                            <Typography as="h3" preset="sans-body" size={design.splitHeadingSize} weight="light" wrapPolicy={design.headingAutoWrap ? "heading" : "nowrap"} align="right" className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {layoutVariant === 'stack' && (
                    <div
                        className="grid justify-items-center text-center"
                        style={getGridColumnStyle(design.stackBounds)}
                    >
                        <Typography
                            as="h3"
                            preset="sans-body"
                            size={design.stackHeadingSize}
                            weight="strong"
                            wrapPolicy={design.headingAutoWrap ? "heading" : "nowrap"}
                            align="center"
                            className="px-4 text-white uppercase"
                            style={{ marginBottom: getSpacingRem(design.stackTextTopSpacing) }}
                        >
                            {heading}
                        </Typography>
                        <div
                            className="grid max-w-3xl border-t border-white/5"
                            style={{
                                paddingTop: getSpacingRem(design.stackTextTopSpacing),
                                rowGap: getSpacingRem(design.paragraphGap),
                            }}
                        >
                            {paragraphContent}
                        </div>
                        {imageSrc && (
                            <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100" style={{ marginTop: getSpacingRem(design.stackImageTopSpacing) }}>
                                <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} />
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
