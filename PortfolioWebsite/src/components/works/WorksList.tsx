"use client";
import React, { type ReactNode } from "react";

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
        return <div className="p-12 text-white/50 text-center font-mono text-xs">No works available. Add some works to the list.</div>
    }

    return (
        <div className="w-full text-white flex flex-col justify-center pt-32 pb-20">
            <div className={`px-8 sm:px-16 mb-16 relative z-20 ${editMode ? "pointer-events-auto" : "mix-blend-difference pointer-events-none"}`}>
                <h1 className="text-sm tracking-widest text-white/50 uppercase font-medium">
                    {heading}
                </h1>
            </div>

            {entriesContent ? (
                <div className="flex flex-col w-full border-t border-white/10">{entriesContent}</div>
            ) : (
                <div className="flex flex-col w-full border-t border-white/10">
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
