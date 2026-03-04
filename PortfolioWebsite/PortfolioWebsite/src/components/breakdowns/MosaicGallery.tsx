'use client';

import React from 'react';
import Image from 'next/image';

interface MosaicGalleryProps {
    images: {
        src: string;
        caption?: string;
    }[];
}

export default function MosaicGallery({ images }: MosaicGalleryProps) {
    if (!images || images.length === 0) return null;

    return (
        <div className="w-full my-32">
            <div className="grid-container gap-y-6 md:gap-y-0">

                {/* Main Large Image (Left Side) */}
                {images[0] && (
                    <div className="col-span-4 md:col-span-8 group relative overflow-hidden">
                        <Image
                            src={images[0].src}
                            alt={images[0].caption || 'Iteration Main'}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto transition-opacity duration-1000"
                        />
                        {images[0].caption && (
                            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 text-white font-mono text-xs tracking-widest translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 border border-white/10">
                                {images[0].caption}
                            </div>
                        )}
                    </div>
                )}

                {/* Secondary Smaller Images (Right Side Stack) */}
                <div className="col-span-4 md:col-span-4 flex flex-col gap-6">

                    {images[1] && (
                        <div className="relative group overflow-hidden">
                            <Image
                                src={images[1].src}
                                alt={images[1].caption || 'Iteration Step 2'}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto opacity-60 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                            />
                            {images[1].caption && (
                                <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 text-white font-mono text-[10px] tracking-widest border border-white/10">
                                    {images[1].caption}
                                </div>
                            )}
                        </div>
                    )}

                    {images[2] && (
                        <div className="relative group overflow-hidden">
                            <Image
                                src={images[2].src}
                                alt={images[2].caption || 'Iteration Step 3'}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto opacity-60 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                            />
                            {images[2].caption && (
                                <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 text-white font-mono text-[10px] tracking-widest border border-white/10">
                                    {images[2].caption}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
