"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import { isCmsPreviewEnabled } from "@/lib/site-mode";

interface LightingCollection {
    id: string;
    number: string;
    title: string;
    colSpanClass: string;
    coverImage: string;
}

const collections: LightingCollection[] = [
    {
        id: "collection-1",
        number: "01",
        title: "CITY ADD",
        colSpanClass: "col-span-12 md:col-start-2 md:col-span-4",
        coverImage: "/images/city-2026/002.webp",
    },
    {
        id: "collection-2",
        number: "02",
        title: "TRAIN STATION",
        colSpanClass: "col-span-12 md:col-start-3 md:col-span-8",
        coverImage: "/images/train-station/2Day.webp",
    },
    {
        id: "collection-3",
        number: "03",
        title: "WEST - DOUBLE COMPOSITION",
        colSpanClass: "col-span-12 md:col-start-1 md:col-span-5",
        coverImage: "/images/west/CDay.webp",
    },
    {
        id: "collection-4",
        number: "04",
        title: "ATMOSPHERE PRACTICE",
        colSpanClass: "col-span-12 md:col-start-7 md:col-span-5",
        coverImage: "/images/penguin/01.webp",
    },
];

export default function LightingPortfolioPage() {
    const cmsPreviewEnabled = isCmsPreviewEnabled();
    const cmsCollectionHref: Record<string, string> = {
        "collection-1": "/p/works/lighting-atmosphere",
        "collection-2": "/p/works/lighting-atmosphere",
        "collection-3": "/p/works/lighting-atmosphere",
        "collection-4": "/p/works/lighting-atmosphere",
    };
    // const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20">
            <CustomCursor />
            <Navigation />

            {/* Hero Header */}
            <section className="pt-40 pb-20 px-4 md:px-12 grid-container">
                <div className="col-span-4 md:col-start-1 md:col-span-12 border-b border-white/10 pb-8">
                    <div className="mb-8">
                        <Link
                            href="/p/works/lighting-portfolio"
                            className="inline-flex items-center border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/85 transition-colors hover:bg-white hover:text-black"
                        >
                            Open CMS Version (/p)
                        </Link>
                    </div>
                    <h1 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna transform translate-y-2">
                        LIGHTING
                    </h1>
                    <div className="flex justify-between items-end mt-4">
                        <h2 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna text-white/40">
                            PORTFOLIO
                        </h2>
                        <div className="text-right pb-2">
                            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                                A Curated Selection
                            </p>
                            <p className="font-futura text-sm tracking-widest text-white/70 mt-2">
                                Unreal Engine 5
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strict Grid Layout: Modular Framing */}
            <section className="px-4 md:px-12 pb-32">
                <div className="grid grid-cols-12 gap-y-32">
                    {collections.map((item) => {
                        const targetHref = cmsPreviewEnabled
                            ? (cmsCollectionHref[item.id] ?? "/p/works/lighting-portfolio")
                            : `/works/lighting-portfolio/${item.id}`;

                        return (
                        <div
                            key={item.id}
                            className="col-span-12 md:col-start-3 md:col-span-8 relative group interactive flex flex-col items-center"
                        >
                            <Link href={targetHref} className="block w-full">
                                {/* Typography decoupled from image border */}
                                <div className="mb-6 flex justify-between items-end w-full border-b border-white/20 pb-2">
                                    <p className="font-mono text-xs text-white/50 tracking-[0.3em] group-hover:text-white transition-colors duration-500">
                                        NO. {item.number}
                                    </p>
                                    <h3 className="font-futura text-sm tracking-widest text-white/80 uppercase">
                                        {item.title}
                                    </h3>
                                </div>

                                {/* High-End Gallery Frame: Strict 21:9 container with horizontal alignment */}
                                <div className="relative w-full aspect-[21/9] bg-[#050505] border border-white/10 flex items-center justify-center overflow-hidden">
                                    <motion.img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover block"
                                    />
                                </div>
                            </Link>
                        </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
