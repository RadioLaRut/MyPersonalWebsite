'use client';

import React from 'react';
import Image from 'next/image';

interface MediaTextCardProps {
    title: string;
    description: string;
    imageSrc?: string;
    tags?: string[];
}

export default function MediaTextCard({
    title,
    description,
    imageSrc,
    tags
}: MediaTextCardProps) {
    return (
        <div className="w-full my-24 grid-container">
            {/* Left Column: Text & Context */}
            <div className="col-span-4 md:col-span-4 flex flex-col justify-center">
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                        {tags.map((tag, i) => (
                            <span key={i} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 border border-white/10 px-2 py-1">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-[0.9] font-futura">
                    {title}
                </h3>

                <div className="font-futura text-white/60 tracking-wide leading-relaxed space-y-4">
                    {description.split('\\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </div>

            {/* Right Column: Visual Display */}
            <div className="col-span-4 md:col-span-8 mt-12 md:mt-0 relative group">
                {imageSrc ? (
                    <div className="relative w-full overflow-hidden rounded-sm">
                        <Image
                            src={imageSrc}
                            alt={title}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                ) : (
                    <div className="relative w-full h-full min-h-[400px] border border-white/10 bg-[#0a0a0a] overflow-hidden rounded-sm transition-colors duration-500 group-hover:border-white/20 flex flex-col items-center justify-center">
                        {/* Subtle grid background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                        <div className="font-mono text-white/20 text-xs tracking-[0.3em] uppercase z-10">
                            MEDIA AWAITING UPLOAD
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
