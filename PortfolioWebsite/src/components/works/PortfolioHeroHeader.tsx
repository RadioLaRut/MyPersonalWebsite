"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";

import { isTestingMode } from "@/lib/site-mode";

interface LightingCollectionHeroHeaderProps {
    title: ReactNode;
    subtitle: ReactNode;
    descriptionLine1: ReactNode;
    descriptionLine2: ReactNode;
    ctaLabel?: string;
    ctaHref?: string;
    editMode?: boolean;
}

export default function LightingCollectionHeroHeader({
    title,
    subtitle,
    descriptionLine1,
    descriptionLine2,
    ctaLabel,
    ctaHref,
    editMode = false,
}: LightingCollectionHeroHeaderProps) {
    const testingMode = isTestingMode();

    return (
        <section className="pt-40 pb-20 border-b border-white/10">
            <div className="grid-container">
                <div className="col-span-4 lg:col-start-1 lg:col-span-12 pb-8">
                    {testingMode && ctaLabel && ctaHref ? (
                        <div className="grid grid-cols-4 lg:grid-cols-12 gap-4 mb-8">
                            <div className="col-span-4 lg:col-start-1 lg:col-span-12">
                                <Link
                                    href={ctaHref}
                                    onClick={(event) => {
                                        if (editMode) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="inline-flex items-center border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/85 transition-colors hover:bg-white hover:text-black"
                                >
                                    {ctaLabel}
                                </Link>
                            </div>
                        </div>
                    ) : null}
                    <div className="grid grid-cols-4 lg:grid-cols-12">
                        <div className="col-span-4 lg:col-start-1 lg:col-span-12">
                            <h1 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna transform translate-y-2 text-white break-words">
                                {title}
                            </h1>
                            <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-4 mt-4">
                                <h2 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna text-textMuted break-words">
                                    {subtitle}
                                </h2>
                                <div className="lg:text-right lg:self-end pb-1">
                                    {descriptionLine1 && (
                                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-textMuted break-words">
                                            {descriptionLine1}
                                        </p>
                                    )}
                                    {descriptionLine2 && (
                                        <p className="font-futura text-sm tracking-widest text-textPrimary mt-2 break-words">
                                            {descriptionLine2}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
