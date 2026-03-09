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
                <div className="col-span-4 md:col-start-1 md:col-span-12 pb-8">
                    {testingMode && ctaLabel && ctaHref ? (
                        <div className="grid grid-cols-4 md:grid-cols-12 gap-4 mb-8">
                            <div className="col-span-4 md:col-start-1 md:col-span-12">
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
                    <div className="grid grid-cols-4 md:grid-cols-12">
                        <div className="col-span-4 md:col-start-1 md:col-span-12">
                            <h1 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna transform translate-y-2 text-white">
                                {title || "TITLE"}
                            </h1>
                            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 mt-4">
                                <h2 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna text-white/40">
                                    {subtitle || "SUBTITLE"}
                                </h2>
                                <div className="md:text-right md:self-end pb-1">
                                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                                        {descriptionLine1 || "Description Line 1"}
                                    </p>
                                    <p className="font-futura text-sm tracking-widest text-white/70 mt-2">
                                        {descriptionLine2 || "Description Line 2"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
