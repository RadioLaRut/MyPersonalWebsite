'use client';

import React from 'react';
import Image from 'next/image';

interface Parameter {
    name: string;
    value?: string;
    description: string;
}

interface ParameterGridProps {
    mediaSrc: string; // Video or GIF showing generation
    isVideo?: boolean;
    parameters?: Parameter[];
}

export default function ParameterGrid({
    mediaSrc,
    isVideo = false,
    parameters
}: ParameterGridProps) {
    return (
        <div className="w-full my-32">
            {/* 1. Full-width Media */}
            <div className="w-full aspect-video md:aspect-[21/9] relative bg-[#050505] overflow-hidden mb-12">
                {isVideo ? (
                    <video
                        src={mediaSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <Image
                        src={mediaSrc}
                        alt="PCG Generation Overview"
                        fill
                        className="object-cover opacity-80"
                    />
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-white font-mono text-xs tracking-widest border border-white/10">
                    PROCEDURAL GENERATION PREVIEW
                </div>
            </div>

            {/* 2. Grid of Parameters */}
            {parameters && parameters.length > 0 && (
                <div className="grid-container">
                    {parameters.map((param, i) => (
                        <div key={i} className="col-span-2 md:col-span-3 border-t border-white/20 pt-6 group">
                            <h4 className="font-mono text-white/50 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 transition-colors group-hover:text-white">
                                {param.name}
                            </h4>
                            {param.value && (
                                <div className="text-4xl md:text-5xl font-luna font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,1)] group-hover:ml-2 mb-4">
                                    {param.value}
                                </div>
                            )}
                            <p className="font-serif text-white/50 text-sm md:text-base leading-relaxed">
                                {param.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
