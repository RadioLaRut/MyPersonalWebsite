'use client';

import React from 'react';
import Image from 'next/image';

interface TextSplitLayoutProps {
    heading: string;
    paragraphs: string[];
    imageSrc?: string;
    layoutVariant?: 'split-left' | 'split-right' | 'stack';
}

export default function TextSplitLayout({
    heading,
    paragraphs,
    imageSrc,
    layoutVariant = 'split-left'
}: TextSplitLayoutProps) {
    return (
        <div className="w-full my-32">
            <div className="grid-container items-start">

                {layoutVariant === 'split-left' && (
                    <>
                        {/* Heading Left */}
                        <div className="col-span-4 md:col-span-5 md:col-start-1 mb-12 md:mb-0">
                            <h3 className="text-[10vw] md:text-[5vw] font-luna leading-[0.85] tracking-tighter uppercase break-words text-white mb-8">
                                {heading}
                            </h3>
                            {imageSrc && (
                                <div className="w-full aspect-[4/3] relative opacity-90 hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute inset-0 bg-neutral-900" />
                                    <Image src={imageSrc} alt={heading} fill className="object-cover" />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                        {/* Text Right */}
                        <div className="col-span-4 md:col-span-6 md:col-start-7 flex flex-col justify-center">
                            <div className="font-serif text-white/60 tracking-wide text-lg md:text-xl leading-[1.8] space-y-8 pl-0 md:pl-8 border-l border-white/5">
                                {paragraphs.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {layoutVariant === 'split-right' && (
                    <>
                        {/* Text Left */}
                        <div className="col-span-4 md:col-span-6 md:col-start-1 flex flex-col justify-center mb-12 md:mb-0 order-2 md:order-1 mt-12 md:mt-0">
                            <div className="font-serif text-white/60 tracking-wide text-lg md:text-xl leading-[1.8] space-y-8 pr-0 md:pr-8 border-r border-white/5 text-right md:text-left">
                                {paragraphs.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                        {/* Heading Right */}
                        <div className="col-span-4 md:col-span-5 md:col-start-8 order-1 md:order-2">
                            <h3 className="text-[10vw] md:text-[5vw] font-luna leading-[0.85] tracking-tighter uppercase break-words text-white mb-8 text-right">
                                {heading}
                            </h3>
                            {imageSrc && (
                                <div className="w-full aspect-[4/3] relative opacity-90 hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute inset-0 bg-neutral-900" />
                                    <Image src={imageSrc} alt={heading} fill className="object-cover" />
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {layoutVariant === 'stack' && (
                    <div className="col-span-4 md:col-start-3 md:col-span-8 flex flex-col items-center text-center">
                        <h3 className="text-[8vw] md:text-[6vw] font-luna leading-[0.85] tracking-tighter uppercase text-white mb-16">
                            {heading}
                        </h3>
                        <div className="font-serif text-white/60 tracking-wide text-lg md:text-xl leading-[1.8] space-y-8 max-w-3xl border-white/5 border-t pt-12">
                            {paragraphs.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                        {imageSrc && (
                            <div className="w-full relative aspect-[21/9] mt-16 opacity-90 hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 bg-neutral-900" />
                                <Image src={imageSrc} alt={heading} fill className="object-cover" />
                                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
