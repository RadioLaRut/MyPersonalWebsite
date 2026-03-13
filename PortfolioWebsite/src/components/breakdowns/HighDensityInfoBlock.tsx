'use client';

import React, { type ReactNode } from 'react';
import { PresetImage } from '@/components/common/PresetImage';
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from '@/lib/image-presentation';

interface InfoItem {
    label: ReactNode;
    value: ReactNode;
}

interface HighDensityInfoBlockProps {
    phase1: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; items?: InfoItem[]; label?: ReactNode };
    phase2: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; items?: InfoItem[]; label?: ReactNode };
    phase3: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; imageSrc?: string; imagePreset?: ImagePreset; imageFitMode?: ImageFitMode; label?: ReactNode };
    phase1ItemsContent?: ReactNode;
    phase2ItemsContent?: ReactNode;
}

export default function HighDensityInfoBlock({ phase1, phase2, phase3, phase1ItemsContent, phase2ItemsContent }: HighDensityInfoBlockProps) {
    const phase3ImageAlt = typeof phase3.title === "string" ? phase3.title : "Phase image";

    return (
        <div className="w-full rhythm-block">
            <div className="grid-container border-t border-white/20 rhythm-divider-top">

                {/* Phase 1 Column (Dense text + metadata) */}
                <div className="col-span-3 pr-0 lg:pr-5 mb-12 lg:mb-0 border-r border-white/5">
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase1.label || "PHASE 01 / CONTEXT"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size="title-sm" weight="semantic" wrapPolicy="heading" className="mb-2 text-textPrimary">{phase1.title}</Typography>
                    {phase1.subtitle && <Typography as="h4" preset="sans-body" size="body-sm" weight="light" wrapPolicy="prose" className="mb-6 text-textMuted italic">{phase1.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size="body-sm" weight="medium" wrapPolicy="prose" className="mb-8 pr-0 text-textMuted lg:pr-4">
                        {phase1.content}
                    </Typography>

                    {phase1.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase1.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="div" preset="sans-body" size="body-sm" weight="semantic" wrapPolicy="prose" align="right" className="text-textPrimary text-left lg:text-right max-w-full lg:max-w-[75%] self-start lg:self-end">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase1ItemsContent ? (
                        <div className="mt-8 border-t border-white/10 pt-6">
                            {phase1ItemsContent}
                        </div>
                    ) : null}
                </div>

                {/* Phase 2 Column (Dense text + architecture abstract) */}
                <div className="col-span-4 px-0 lg:px-8 mb-12 lg:mb-0 border-r border-transparent lg:border-white/5">
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase2.label || "PHASE 02 / SYSTEM ARCHITECTURE"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size="title-sm" weight="semantic" wrapPolicy="heading" className="mb-2 text-textPrimary">{phase2.title}</Typography>
                    {phase2.subtitle && <Typography as="h4" preset="sans-body" size="body-sm" weight="light" wrapPolicy="prose" className="mb-6 text-textMuted italic">{phase2.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size="body-sm" weight="medium" wrapPolicy="prose" className="mb-8 text-textMuted">
                        {phase2.content}
                    </Typography>

                    {phase2.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase2.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="span" preset="sans-body" size="body-sm" weight="semantic" wrapPolicy="prose" className="text-textPrimary">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase2ItemsContent ? (
                        <div className="mt-8 border-t border-white/10 pt-6">
                            {phase2ItemsContent}
                        </div>
                    ) : null}
                </div>

                {/* Phase 3 Column (Execution & Visual Result) */}
                <div className="col-span-5 pl-0 lg:pl-8">
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase3.label || "PHASE 03 / EXECUTION & RESULTS"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size="title-sm" weight="semantic" wrapPolicy="heading" className="mb-2 text-textPrimary">{phase3.title}</Typography>
                    {phase3.subtitle && <Typography as="h4" preset="sans-body" size="body-sm" weight="light" wrapPolicy="prose" className="mb-6 text-textMuted italic">{phase3.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size="body-sm" weight="medium" wrapPolicy="prose" className="mb-8 text-textMuted">
                        {phase3.content}
                    </Typography>

                    {phase3.imageSrc && (
                        <div className="relative mt-6 w-full overflow-hidden border border-white/10 bg-neutral-900">
                            <PresetImage
                                src={phase3.imageSrc}
                                alt={phase3ImageAlt}
                                preset={phase3.imagePreset}
                                fitMode={phase3.imageFitMode}
                                imageClassName="opacity-90 transition-all duration-700 hover:scale-105 hover:opacity-100"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
