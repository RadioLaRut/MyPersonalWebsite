'use client';

import React, { type ReactNode } from 'react';
import { PresetImage } from '@/components/common/PresetImage';
import Typography from "@/components/common/Typography";
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

export default function TextSplitLayout({
    heading,
    paragraphs,
    imageSrc,
    imagePreset = "ratio-16-9",
    imageFitMode = "x",
    layoutVariant = 'split-left',
    paragraphsContent,
}: TextSplitLayoutProps) {
    const imageAlt = typeof heading === 'string' ? heading : 'TextSplitLayout image';
    const paragraphContent = paragraphsContent ?? (
        <>
            {paragraphs.map((p, i) => (
                <Typography
                    key={i}
                    as="p"
                    preset="sans-body"
                    size="body-lg"
                    weight="semantic"
                    wrapPolicy="prose"
                    className="text-textMuted"
                >
                    {p}
                </Typography>
                ))}
        </>
    );

    return (
        <div className="w-full rhythm-block">
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        {/* Heading Left */}
                        <div className="col-span-5 col-start-1 mb-12 lg:mb-0">
                            <Typography as="h3" preset="sans-body" size="title" weight="light" wrapPolicy="heading" className="mb-8 text-white uppercase">
                                {heading}
                            </Typography>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        {/* Text Right */}
                        <div className="col-span-7 grid content-center">
                            <div className="space-y-14 border-l border-white/5 pl-0 lg:pl-8">
                                {paragraphContent}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        {/* Text Left */}
                        <div className="col-span-5 col-start-1 order-2 mt-12 grid content-center lg:order-1 lg:mb-0 lg:mt-0">
                            <div className="space-y-14 border-r border-white/5 pr-0 text-right lg:pr-8 lg:text-left">
                                {paragraphContent}
                            </div>
                        </div>
                        {/* Heading Right */}
                        <div className="col-span-7 col-start-6 order-1 lg:order-2">
                            <Typography as="h3" preset="sans-body" size="title" weight="light" wrapPolicy="heading" align="right" className="mb-8 text-white uppercase">
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
                    <div className="col-start-3 col-span-8 grid justify-items-center text-center">
                        <Typography as="h3" preset="sans-body" size="display" weight="strong" wrapPolicy="heading" align="center" className="mb-16 px-4 text-white uppercase">
                            {heading}
                        </Typography>
                        <div className="max-w-3xl space-y-14 border-t border-white/5 pt-12">
                            {paragraphContent}
                        </div>
                        {imageSrc && (
                            <div className="relative mt-16 w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
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
