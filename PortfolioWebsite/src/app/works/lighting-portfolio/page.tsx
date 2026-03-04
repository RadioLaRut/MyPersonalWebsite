"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";

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
        coverImage: "/images/City2026Add/002.PNG",
    },
    {
        id: "collection-2",
        number: "02",
        title: "RAINFOREST ECHO",
        colSpanClass: "col-span-12 md:col-start-7 md:col-span-5",
        coverImage: "/images/雨林/Version2Output.0029.png",
    },
    {
        id: "collection-3",
        number: "03",
        title: "TRAIN STATION",
        colSpanClass: "col-span-12 md:col-start-3 md:col-span-8",
        coverImage: "/images/TrainStation/2Day.png",
    },
    {
        id: "collection-4",
        number: "04",
        title: "WEST - DOUBLE COMPOSITION",
        colSpanClass: "col-span-12 md:col-start-1 md:col-span-5",
        coverImage: "/images/West/CDay.jpeg",
    },
    {
        id: "collection-5",
        number: "05",
        title: "ATMOSPHERE PRACTICE",
        colSpanClass: "col-span-12 md:col-start-7 md:col-span-5",
        coverImage: "/images/Others/01.png",
    },
];

export default function LightingPortfolioPage() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20">
            <CustomCursor />
            <Navigation />

            {/* Hero Header */}
            <section className="pt-40 pb-20 px-4 md:px-12 grid-container">
                <div className="col-span-4 md:col-start-1 md:col-span-12 border-b border-white/10 pb-8">
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
                            <p className="font-serif text-sm tracking-widest text-white/70 mt-2">
                                Unreal Engine 5
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Collections */}
            <section className="px-4 md:px-12 pb-32">
                <div className="grid-container gap-y-24">
                    {collections.map((item) => (
                        <div
                            key={item.id}
                            className={`${item.colSpanClass} relative group interactive`}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <Link href={`/works/lighting-portfolio/${item.id}`} className="block w-full">
                                {/* Number identifier */}
                                <div className="absolute -top-6 left-0 font-mono text-xs text-white/30 tracking-[0.3em] group-hover:text-white transition-colors duration-500 z-10">
                                    {item.number} — {item.title}
                                </div>

                                {/* Image Container preserving original aspect ratio */}
                                <div className="relative w-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-4">

                                    <motion.img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="w-full h-auto object-contain transition-all duration-700 ease-out"
                                    />

                                    {/* Decorative corner accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 z-20" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 z-20" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
