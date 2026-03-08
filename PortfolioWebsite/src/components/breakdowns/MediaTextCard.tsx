'use client';

import React, { type ReactNode } from 'react';
import BilingualText from '@/components/common/BilingualText';
import { PresetImage } from '@/components/common/PresetImage';
import { type ImageFitMode, type ImagePreset } from '@/lib/image-presentation';
import { toParagraphNodes } from '@/lib/editable-text';
import { CANONICAL_PLACEHOLDER_PATH } from '@/lib/public-paths';

interface MediaTextCardProps {
    title: ReactNode;
    description: ReactNode;
    imageSrc?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    tags?: ReactNode[];
}

export default function MediaTextCard({
    title,
    description,
    imageSrc,
    imagePreset = "ratio-16-9",
    imageFitMode = "x",
    tags,
}: MediaTextCardProps) {
    const paragraphs = toParagraphNodes(description);
    const imageAlt = typeof title === "string" ? title : "Media card image";

    return (
        <div className="w-full my-24 grid-container">
            {/* Left Column: Text & Context */}
            <div className="col-span-4 md:col-span-4 flex flex-col justify-start">
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                        {tags.map((tag, i) => (
                            <span key={i} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 border border-white/10 px-2 py-1">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-[0.95] font-futura break-words">
                    {title}
                </h3>

                <div className="text-white/60 tracking-[0.02em] text-base md:text-lg leading-[1.95] space-y-5 max-w-none md:max-w-[36ch]">
                    {paragraphs.map((paragraph, i) => (
                        <p key={i} className="text-balance">
                            <BilingualText text={paragraph} weight="medium" />
                        </p>
                    ))}
                </div>
            </div>

            {/* Right Column: Visual Display */}
            <div className="col-span-4 md:col-span-8 mt-12 md:mt-0 relative group">
                <div className="relative w-full overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] transition-colors duration-500 group-hover:border-white/20">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    <PresetImage
                        src={imageSrc || CANONICAL_PLACEHOLDER_PATH}
                        alt={imageAlt}
                        preset={imagePreset}
                        fitMode={imageFitMode}
                        sizes="100vw"
                        frameClassName={imageSrc ? undefined : "min-h-[400px]"}
                    />
                </div>
            </div>
        </div>
    );
}
