import React from "react";
import Link from "next/link";
import { ProjectCover } from "@/components/common/ProjectCover";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";

interface LightingProjectCardProps {
    id: string;
    number: string;
    title: string;
    coverImage: string;
    href?: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
}

export default function LightingProjectCard({
    id,
    number,
    title,
    coverImage,
    href,
    imagePreset = "ratio-21-9",
    imageFitMode = "x",
}: LightingProjectCardProps) {
    const cardHref = href ?? `/works/lighting-portfolio/${id}`;
    const normalizedCoverImage = coverImage || CANONICAL_PLACEHOLDER_PATH;

    return (
        <section className="px-4 md:px-12 pb-32">
            <div className="grid grid-cols-12 gap-y-32">
                <div className="col-span-12 md:col-start-3 md:col-span-8 relative group interactive flex flex-col items-center">
                    <Link href={cardHref} className="block w-full">
                        {/* Typography decoupled from image border */}
                        <div className="mb-6 flex justify-between items-end w-full border-b border-white/20 pb-2">
                            <p className="font-mono text-xs text-white/50 tracking-[0.3em] group-hover:text-white transition-colors duration-500">
                                NO. {number || "00"}
                            </p>
                            <h3 className="font-futura text-sm tracking-widest text-white/80 uppercase">
                                {title || "UNTITLED PROJECT"}
                            </h3>
                        </div>

                        {/* High-End Gallery Frame: Strict 21:9 container with horizontal alignment */}
                        <div className="relative w-full bg-[#050505] border border-white/10 flex items-center justify-center overflow-hidden">
                            <ProjectCover
                                src={normalizedCoverImage}
                                alt={title}
                                preset={imagePreset}
                                fitMode={imageFitMode}
                                className="opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
