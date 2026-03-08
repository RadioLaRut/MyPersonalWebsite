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
        <section className="pt-40 pb-20 px-4 md:px-12 grid-container">
            <div className="col-span-4 md:col-start-1 md:col-span-12 border-b border-white/10 pb-8">
                {testingMode && ctaLabel && ctaHref ? (
                    <div className="mb-8">
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
                ) : null}
                <h1 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna transform translate-y-2 text-white">
                    {title || "TITLE"}
                </h1>
                <div className="flex justify-between items-end mt-4">
                    <h2 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna text-white/40">
                        {subtitle || "SUBTITLE"}
                    </h2>
                    <div className="text-right pb-2">
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                            {descriptionLine1 || "Description Line 1"}
                        </p>
                        <p className="font-futura text-sm tracking-widest text-white/70 mt-2">
                            {descriptionLine2 || "Description Line 2"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
