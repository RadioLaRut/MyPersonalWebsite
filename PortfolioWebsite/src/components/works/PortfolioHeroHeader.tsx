"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import Typography from "@/components/common/Typography";

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
    return (
        <section className="border-b border-white/10 pt-36 pb-20 md:pt-40 md:pb-24">
            <div className="grid-container">
                <div className="col-span-12">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-8 lg:col-start-2">
                            <Typography
                                as="p"
                                preset="sans-body"
                                size="caption"
                                weight="medium"
                                wrapPolicy="label"
                                className="text-white/38"
                            >
                                CURATED INDEX
                            </Typography>
                            <Typography
                                as="h1"
                                preset="luna-editorial"
                                size="display"
                                weight="display"
                                wrapPolicy="heading"
                                className="mt-5 text-white"
                            >
                                {title}
                            </Typography>
                            <Typography
                                as="h2"
                                preset="luna-editorial"
                                size="title"
                                weight="strong"
                                wrapPolicy="heading"
                                className="mt-3 text-white/42"
                            >
                                {subtitle}
                            </Typography>
                        </div>

                        <div className="lg:col-span-3 lg:col-start-10">
                            <div className="grid content-start justify-items-start lg:pl-4">
                                {descriptionLine1 && (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="caption"
                                        weight="medium"
                                        wrapPolicy="label"
                                        className="text-textMuted"
                                    >
                                        {descriptionLine1}
                                    </Typography>
                                )}
                                {descriptionLine2 && (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="body"
                                        weight="regular"
                                        wrapPolicy="prose"
                                        className="mt-5 text-textPrimary/90"
                                    >
                                        {descriptionLine2}
                                    </Typography>
                                )}
                                {ctaLabel && ctaHref ? (
                                    <Link
                                        href={ctaHref}
                                        onClick={(event) => {
                                            if (editMode) {
                                                event.preventDefault();
                                            }
                                        }}
                                        className="group interactive mt-10 inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                                    >
                                        <span className="h-px w-6 bg-white/30 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                                        <Typography
                                            preset="sans-body"
                                            size="label"
                                            weight="medium"
                                            wrapPolicy="label"
                                            className="text-inherit"
                                        >
                                            {ctaLabel}
                                        </Typography>
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
