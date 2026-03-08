"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import ImageSlider from "@/components/breakdowns/ImageSlider";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isCmsPreviewEnabled } from "@/lib/site-mode";

// Demo data mapping for the breakdown pages
const collectionData: Record<string, { title: string; number: string; images: { lit: string; unlit?: string; caption: string }[] }> = {
    "collection-1": {
        title: "CITY ADD",
        number: "01",
        images: [
            { lit: "/images/city-2026/001.webp", caption: "DAY" },
            { lit: "/images/city-2026/002.webp", caption: "DUSK" },
            { lit: "/images/city-2026/003.webp", caption: "NIGHT" },
        ],
    },
    "collection-2": {
        title: "RAINFOREST ECHO",
        number: "02",
        images: [
            { lit: "/images/rainforest/Version2Output.0029.webp", caption: "DAY" },
            { lit: "/images/rainforest/Shot005.0002.webp", caption: "ATMOSPHERE 1" },
            { lit: "/images/rainforest/Output.0050.webp", caption: "ATMOSPHERE 2" },
            { lit: "/images/rainforest/Output.0101.webp", caption: "NIGHT" },
        ],
    },
    "collection-3": {
        title: "TRAIN STATION",
        number: "03",
        images: [
            { lit: "/images/train-station/2Day.webp", caption: "DAY" },
            { lit: "/images/train-station/2Dust.webp", caption: "DUSK" },
            { lit: "/images/train-station/2Fog.webp", caption: "FOG" },
            { lit: "/images/train-station/2Night.webp", caption: "NIGHT" },
            {
                lit: "/images/train-station/2Day.webp", // lit image (DAY)
                unlit: "/images/train-station/2NoLight.webp", // unlit image
                caption: "LIGHTING COMPARISON"
            },
        ],
    },
    "collection-4": {
        title: "WEST - DOUBLE COMPOSITION",
        number: "04",
        images: [
            // Composition 1
            { lit: "/images/west/Day.webp", caption: "COMPOSITION ONE - DAY" },
            { lit: "/images/west/Dust.webp", caption: "COMPOSITION ONE - DUSK" },
            { lit: "/images/west/Night.webp", caption: "COMPOSITION ONE - NIGHT" },
            {
                lit: "/images/west/Day.webp",
                unlit: "/images/west/NoLight.webp",
                caption: "COMPOSITION ONE - LIGHTING COMPARISON"
            },
            // Composition 2
            { lit: "/images/west/CDay.webp", caption: "COMPOSITION TWO - DAY" },
            { lit: "/images/west/CDust.webp", caption: "COMPOSITION TWO - DUSK" },
            { lit: "/images/west/CNight.webp", caption: "COMPOSITION TWO - NIGHT" },
            {
                lit: "/images/west/CDay.webp",
                unlit: "/images/west/CNoLight.webp",
                caption: "COMPOSITION TWO - LIGHTING COMPARISON"
            },
        ],
    },
    "collection-5": {
        title: "ATMOSPHERE PRACTICE",
        number: "05",
        images: [
            { lit: "/images/penguin/01.webp", caption: "CYBERPUNK ALLEY" },
            { lit: "/images/penguin/02.webp", caption: "INTERIOR SCENE" },
            { lit: "/images/penguin/CyberRestaurant.webp", caption: "CYBER RESTAURANT" },
        ],
    },
};

export default function LightingBreakdownPage() {
    const cmsPreviewEnabled = isCmsPreviewEnabled();
    const params = useParams();
    const id = params?.id as string;
    const [data, setData] = useState(collectionData["collection-1"]); // Default fallback

    useEffect(() => {
        if (id && collectionData[id]) {
            setData(collectionData[id]);
        }
    }, [id]);

    if (!data) return null;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/20">
            <CustomCursor />
            <Navigation />

            {/* Header section */}
            <section className="pt-40 pb-20 px-8 md:px-16 border-b border-white/10">
                <Link href={cmsPreviewEnabled ? "/p/works/lighting-portfolio" : "/works/lighting-portfolio"} className="inline-flex items-center text-white/40 hover:text-white transition-colors uppercase tracking-widest text-xs font-mono mb-12">
                    BACK TO PORTFOLIO
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="font-mono text-white/40 tracking-[0.4em] text-sm mb-4">COLLECTION {data.number}</p>
                        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase font-luna text-white">
                            {data.title}
                        </h1>
                    </div>
                    <p className="font-futura tracking-widest text-white/60 text-sm max-w-sm">
                        A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for {data.title.toLowerCase()}.
                    </p>
                </div>
            </section>

            {/* Parallax Content Section */}
            <section className="py-24">
                {data.images.map((img, index) => (
                    <div key={index} className="mb-32 last:mb-0 px-4 md:px-0">
                        <div className="grid-container max-w-[100vw]">
                            {/* Asymmetric layout depending on odd/even or specific indices like 12-col */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                                className="col-span-4 md:col-start-2 md:col-span-10"
                            >
                                <div className="w-full bg-white/5 border border-white/10 relative overflow-hidden group">
                                    {img.unlit ? (
                                        <ImageSlider
                                            unlitSrc={img.unlit}
                                            litSrc={img.lit}
                                            alt={img.caption}
                                            className="my-0"
                                        />
                                    ) : (
                                        <OptimizedImage
                                            src={img.lit}
                                            alt={img.caption}
                                            width={1920}
                                            height={1080}
                                            className="w-full h-auto object-contain"
                                        />
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between items-center px-2">
                                    <p className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
                                        SLIDE {index + 1} OF {data.images.length}
                                    </p>
                                    <p className="font-futura text-xs md:text-sm tracking-widest text-white/80">
                                        {img.caption}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
