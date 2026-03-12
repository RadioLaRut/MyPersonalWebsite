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

function hasNodeContent(value: ReactNode) {
    if (value === null || value === undefined || value === false) {
        return false;
    }

    if (typeof value === "string") {
        return value.trim().length > 0;
    }

    return true;
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
    const hasSubtitle = hasNodeContent(subtitle);
    const hasDescriptionLine1 = hasNodeContent(descriptionLine1);
    const hasDescriptionLine2 = hasNodeContent(descriptionLine2);
    const hasCta = hasNodeContent(ctaLabel) && Boolean(ctaHref);
    const hasSideRail = hasDescriptionLine1 || hasDescriptionLine2 || hasCta;

    const titleLockup = (
        <div className={hasSideRail ? "max-w-[52rem]" : "max-w-[64rem]"}>
            <Typography
                as="h1"
                preset="luna-editorial"
                size="display"
                weight="semantic"
                wrapPolicy="heading"
                className="text-white"
            >
                {title}
            </Typography>
            {hasSubtitle ? (
                <div className="mt-1 lg:mt-2">
                    <Typography
                        as="h2"
                        preset="luna-editorial"
                        size="title"
                        weight="display"
                        wrapPolicy="heading"
                        className="text-white/82"
                    >
                        {subtitle}
                    </Typography>
                </div>
            ) : null}
        </div>
    );

    return (
        <section className="border-b border-white/10 rhythm-section-hero">
            <div className="grid-container">
                {hasSideRail ? (
                    <div className="col-span-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7 lg:col-start-2">
                            {titleLockup}
                        </div>

                        <div className="lg:col-span-3 lg:col-start-10">
                            <div className="grid content-start justify-items-start lg:pl-4">
                                {hasDescriptionLine1 ? (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="caption"
                                        weight="semantic"
                                        wrapPolicy="label"
                                        className="text-textMuted"
                                    >
                                        {descriptionLine1}
                                    </Typography>
                                ) : null}
                                {hasDescriptionLine2 ? (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="body"
                                        weight="semantic"
                                        wrapPolicy="prose"
                                        className="mt-6 text-textPrimary/90"
                                    >
                                        {descriptionLine2}
                                    </Typography>
                                ) : null}
                                {ctaLabel && ctaHref ? (
                                    <Link
                                        href={ctaHref}
                                        onClick={(event) => {
                                            if (editMode) {
                                                event.preventDefault();
                                            }
                                        }}
                                        className="group interactive mt-12 inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                                    >
                                        <span className="h-px w-6 bg-white/30 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                                        <Typography
                                            preset="sans-body"
                                            size="label"
                                            weight="semantic"
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
                ) : (
                    <div className="grid-content">
                        {titleLockup}
                    </div>
                )}
            </div>
        </section>
    );
}
