'use client';

import React, { type ReactNode } from 'react';
import BilingualText from '@/components/common/BilingualText';
import { PresetImage } from '@/components/common/PresetImage';
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
                    <p key={i} className="break-words">{typeof p === "string" ? <BilingualText text={p} weight="medium" /> : p}</p>
                ))}
        </>
    );

    return (
        <div className="w-full my-32">
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        {/* Heading Left */}
                        <div className="col-span-6 col-start-1 mb-12 lg:mb-0">
                            <h3 className="text-5xl sm:text-6xl lg:text-[4.2vw] leading-[1.04] tracking-[0.08em] uppercase break-words hyphens-auto text-white mb-8 font-futura font-light">
                                {heading}
                            </h3>
                            {imageSrc && (
                                <div className="relative w-full opacity-90 transition-opacity duration-700 hover:opacity-100">
                                    <PresetImage src={imageSrc} alt={imageAlt} preset={imagePreset} fitMode={imageFitMode} />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        {/* Text Right */}
                        <div className="col-span-5 col-start-8 flex flex-col justify-center">
                            <div className="text-textMuted tracking-[0.02em] text-lg lg:text-xl leading-loose space-y-6 pl-0 lg:pl-8 border-l border-white/5">
                                {paragraphContent}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        {/* Text Left */}
                        <div className="col-span-5 col-start-1 flex flex-col justify-center mb-12 lg:mb-0 order-2 lg:order-1 mt-12 lg:mt-0">
                            <div className="text-textMuted tracking-[0.02em] text-lg lg:text-xl leading-loose space-y-6 pr-0 lg:pr-8 border-r border-white/5 text-right lg:text-left">
                                {paragraphContent}
                            </div>
                        </div>
                        {/* Heading Right */}
                        <div className="col-span-6 col-start-7 order-1 lg:order-2">
                            <h3 className="text-5xl sm:text-6xl lg:text-[4.2vw] font-futura font-light leading-[1.04] tracking-[0.08em] uppercase break-words hyphens-auto text-white mb-8 text-right">
                                {heading}
                            </h3>
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
                    <div className="col-start-3 col-span-8 flex flex-col items-center text-center">
                        <h3 className="text-5xl sm:text-6xl lg:text-[5.6vw] font-futura leading-[1.02] tracking-normal uppercase break-words hyphens-auto text-white mb-16 px-4">
                            {heading}
                        </h3>
                        <div className="text-textMuted tracking-[0.02em] text-lg lg:text-xl leading-loose space-y-6 max-w-3xl border-white/5 border-t pt-12">
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
