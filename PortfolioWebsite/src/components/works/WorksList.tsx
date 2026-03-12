"use client";
import React, { type ReactNode } from "react";

import Typography from "@/components/common/Typography";
import WorksListEntry from "@/components/works/WorksListEntry";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

interface WorkItem {
    number?: string;
    id: string;
    href?: string;
    title: ReactNode;
    category: ReactNode;
    imageSrc: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    desc: ReactNode;
}

export interface WorksListProps {
    heading?: ReactNode;
    works?: WorkItem[];
    entriesContent?: ReactNode;
    editMode?: boolean;
}

export default function WorksList({ heading = "All Selected Works", works = [], entriesContent, editMode = false }: WorksListProps) {
    const hasLegacyWorks = works && works.length > 0;
    const hasEntriesContent = Boolean(entriesContent);

    if (!hasLegacyWorks && !hasEntriesContent) {
        return (
            <div className="p-12 text-center">
                <Typography
                    as="p"
                    preset="sans-body"
                    size="caption"
                    weight="semantic"
                    wrapPolicy="label"
                    className="text-textMuted"
                >
                    No works available. Add some works to the list.
                </Typography>
            </div>
        );
    }

    return (
        <div className="grid w-full content-center text-white rhythm-section-normal">
            <div className={`grid-container relative z-20 mb-16 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
                <div className="col-start-2 col-span-10 border-b border-white/10 pb-8">
                    <Typography
                        as="h1"
                        preset="sans-body"
                        size="caption"
                        weight="semantic"
                        wrapPolicy="label"
                        className="text-textMuted"
                    >
                        {heading}
                    </Typography>
                </div>
            </div>

            {entriesContent ? (
                <div className="grid w-full border-t border-white/10">{entriesContent}</div>
            ) : (
                <div className="grid w-full border-t border-white/10">
                    {works.map((work, index) => (
                        <WorksListEntry
                            key={work.id || index}
                            id={work.id}
                            number={work.number ?? `0${index + 1}`}
                            href={work.href ?? `/works/${work.id}`}
                            title={work.title}
                            category={work.category}
                            imageSrc={work.imageSrc}
                            imagePreset={work.imagePreset}
                            imageFitMode={work.imageFitMode}
                            desc={work.desc}
                            editMode={editMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
