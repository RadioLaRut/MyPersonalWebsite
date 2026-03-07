'use client';

import React from 'react';
import BilingualText from '@/components/common/BilingualText';
import { OptimizedImage } from '@/components/common/OptimizedImage';

interface InfoItem {
    label: string;
    value: string;
}

interface HighDensityInfoBlockProps {
    phase1: { title: string; subtitle?: string; content: string; items?: InfoItem[] };
    phase2: { title: string; subtitle?: string; content: string; items?: InfoItem[] };
    phase3: { title: string; subtitle?: string; content: string; imageSrc?: string };
}

export default function HighDensityInfoBlock({ phase1, phase2, phase3 }: HighDensityInfoBlockProps) {
    return (
        <div className="w-full my-32">
            <div className="grid-container border-t border-white/20 pt-16">

                {/* Phase 1 Column (Dense text + metadata) */}
                <div className="col-span-4 md:col-span-3 pr-0 md:pr-5 mb-12 md:mb-0 border-r border-white/5">
                    <div className="font-mono text-white/40 text-[10px] tracking-[0.2em] mb-4">PHASE 01 / CONTEXT</div>
                    <h3 className="text-xl md:text-2xl font-futura text-white/90 mb-2 break-words">{phase1.title}</h3>
                    {phase1.subtitle && <h4 className="text-sm font-futura italic text-white/50 mb-6">{phase1.subtitle}</h4>}
                    <p className="text-white/60 text-sm md:text-[15px] leading-[1.95] mb-8 pr-0 md:pr-4 break-words">
                        <BilingualText text={phase1.content} />
                    </p>

                    {phase1.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase1.items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 text-xs">
                                    <span className="font-mono text-white/40 break-words">{item.label}</span>
                                    <span className="font-mono text-white/80 text-left md:text-right max-w-full md:max-w-[75%] self-start md:self-end break-words leading-relaxed">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phase 2 Column (Dense text + architecture abstract) */}
                <div className="col-span-4 md:col-span-4 px-0 md:px-8 mb-12 md:mb-0 border-r border-transparent md:border-white/5">
                    <div className="font-mono text-white/40 text-[10px] tracking-[0.2em] mb-4">PHASE 02 / SYSTEM ARCHITECTURE</div>
                    <h3 className="text-xl md:text-2xl font-futura text-white/90 mb-2 break-words">{phase2.title}</h3>
                    {phase2.subtitle && <h4 className="text-sm font-futura italic text-white/50 mb-6">{phase2.subtitle}</h4>}
                    <p className="text-white/60 text-sm md:text-[15px] leading-[1.95] mb-8 break-words">
                        <BilingualText text={phase2.content} />
                    </p>

                    {phase2.items && (
                        <div className="space-y-3 mt-8 pt-6 border-t border-white/10">
                            {phase2.items.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 text-xs">
                                    <span className="font-mono text-white/40 break-words">{item.label}</span>
                                    <span className="font-futura text-white/80 leading-[1.85] break-words">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phase 3 Column (Execution & Visual Result) */}
                <div className="col-span-4 md:col-span-5 pl-0 md:pl-8">
                    <div className="font-mono text-white/40 text-[10px] tracking-[0.2em] mb-4">PHASE 03 / EXECUTION & RESULTS</div>
                    <h3 className="text-xl md:text-2xl font-futura text-white/90 mb-2 break-words">{phase3.title}</h3>
                    {phase3.subtitle && <h4 className="text-sm font-futura italic text-white/50 mb-6">{phase3.subtitle}</h4>}
                    <p className="text-white/60 text-sm md:text-[15px] leading-[1.95] mb-8 break-words">
                        <BilingualText text={phase3.content} />
                    </p>

                    {phase3.imageSrc && (
                        <div className="relative w-full aspect-[4/3] border border-white/10 bg-neutral-900 overflow-hidden mt-6">
                            <OptimizedImage
                                src={phase3.imageSrc}
                                alt={phase3.title}
                                fill
                                className="object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-700"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
