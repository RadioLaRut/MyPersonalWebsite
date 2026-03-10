'use client';

import React, { type ReactNode } from 'react';
import BilingualText from '@/components/common/BilingualText';
import { PresetImage } from '@/components/common/PresetImage';
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
        <div className="w-full my-32">
            <div className="grid-container border-t border-white/20 pt-16">

                {/* Phase 1 Column (Dense text + metadata) */}
                <div className="col-span-4 lg:col-span-3 pr-0 lg:pr-5 mb-12 lg:mb-0 border-r border-white/5">
                    <div className="font-mono text-textMuted text-[10px] tracking-[0.2em] mb-4">{phase1.label || "PHASE 01 / CONTEXT"}</div>
                    <h3 className="text-xl lg:text-2xl font-futura text-textPrimary mb-2 break-words">{phase1.title}</h3>
                    {phase1.subtitle && <h4 className="text-sm font-futura italic text-textMuted mb-6">{phase1.subtitle}</h4>}
                    <p className="text-textMuted text-sm lg:text-[15px] leading-[1.95] mb-8 pr-0 lg:pr-4 break-words">
                        <BilingualText text={phase1.content} weight="medium" />
                    </p>

                    {phase1.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase1.items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 text-xs">
                                    <span className="font-mono text-textMuted break-words">{item.label}</span>
                                    <span className="font-mono text-textPrimary text-left lg:text-right max-w-full lg:max-w-[75%] self-start lg:self-end break-words leading-relaxed">{item.value}</span>
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
                <div className="col-span-4 lg:col-span-4 px-0 lg:px-8 mb-12 lg:mb-0 border-r border-transparent lg:border-white/5">
                    <div className="font-mono text-textMuted text-[10px] tracking-[0.2em] mb-4">{phase2.label || "PHASE 02 / SYSTEM ARCHITECTURE"}</div>
                    <h3 className="text-xl lg:text-2xl font-futura text-textPrimary mb-2 break-words">{phase2.title}</h3>
                    {phase2.subtitle && <h4 className="text-sm font-futura italic text-textMuted mb-6">{phase2.subtitle}</h4>}
                    <p className="text-textMuted text-sm lg:text-[15px] leading-[1.95] mb-8 break-words">
                        <BilingualText text={phase2.content} weight="medium" />
                    </p>

                    {phase2.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase2.items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 text-xs">
                                    <span className="font-mono text-textMuted break-words">{item.label}</span>
                                    <span className="font-futura text-textPrimary leading-[1.85] break-words">{item.value}</span>
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
                <div className="col-span-4 lg:col-span-5 pl-0 lg:pl-8">
                    <div className="font-mono text-textMuted text-[10px] tracking-[0.2em] mb-4">{phase3.label || "PHASE 03 / EXECUTION & RESULTS"}</div>
                    <h3 className="text-xl lg:text-2xl font-futura text-textPrimary mb-2 break-words">{phase3.title}</h3>
                    {phase3.subtitle && <h4 className="text-sm font-futura italic text-textMuted mb-6">{phase3.subtitle}</h4>}
                    <p className="text-textMuted text-sm lg:text-[15px] leading-[1.95] mb-8 break-words">
                        <BilingualText text={phase3.content} weight="medium" />
                    </p>

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
