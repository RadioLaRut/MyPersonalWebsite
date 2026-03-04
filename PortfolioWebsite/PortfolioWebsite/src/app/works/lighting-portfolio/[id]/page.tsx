"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import BeforeAfterSlider from "@/components/works/BeforeAfterSlider";
import Link from "next/link";
import { useParams } from "next/navigation";

// Demo data mapping for the breakdown pages
const collectionData: Record<string, { title: string; number: string; images: { lit: string; unlit?: string; caption: string }[] }> = {
    "collection-1": {
        title: "CITY ADD",
        number: "01",
        images: [
            { lit: "/images/City2026Add/001.PNG", caption: "DAY" },
            { lit: "/images/City2026Add/002.PNG", caption: "DUSK" },
            { lit: "/images/City2026Add/003.PNG", caption: "NIGHT" },
        ],
    },
    "collection-2": {
        title: "RAINFOREST ECHO",
        number: "02",
        images: [
            { lit: "/images/雨林/Version2Output.0029.png", caption: "DAY" },
            { lit: "/images/雨林/Shot005.0002.png", caption: "ATMOSPHERE 1" },
            { lit: "/images/雨林/Output.0050.png", caption: "ATMOSPHERE 2" },
            { lit: "/images/雨林/Output.0101.png", caption: "NIGHT" },
        ],
    },
    "collection-3": {
        title: "TRAIN STATION",
        number: "03",
        images: [
            { lit: "/images/TrainStation/2Day.png", caption: "DAY" },
            { lit: "/images/TrainStation/2Dust.png", caption: "DUSK" },
            { lit: "/images/TrainStation/2Fog.png", caption: "FOG" },
            { lit: "/images/TrainStation/2Night.png", caption: "NIGHT" },
            {
                lit: "/images/TrainStation/2Day.png", // lit image (DAY)
                unlit: "/images/TrainStation/2NoLight.png", // unlit image
                caption: "LIGHTING COMPARISON"
            },
        ],
    },
    "collection-4": {
        title: "WEST - DOUBLE COMPOSITION",
        number: "04",
        images: [
            // Composition 1
            { lit: "/images/West/Day.jpeg", caption: "COMPOSITION ONE - DAY" },
            { lit: "/images/West/Dust.jpeg", caption: "COMPOSITION ONE - DUSK" },
            { lit: "/images/West/Night.jpeg", caption: "COMPOSITION ONE - NIGHT" },
            {
                lit: "/images/West/Day.jpeg",
                unlit: "/images/West/NoLight.jpg",
                caption: "COMPOSITION ONE - LIGHTING COMPARISON"
            },
            // Composition 2
            { lit: "/images/West/CDay.jpeg", caption: "COMPOSITION TWO - DAY" },
            { lit: "/images/West/CDust.jpeg", caption: "COMPOSITION TWO - DUSK" },
            { lit: "/images/West/CNight.jpeg", caption: "COMPOSITION TWO - NIGHT" },
            {
                lit: "/images/West/CDay.jpeg",
                unlit: "/images/West/CNoLight.jpg",
                caption: "COMPOSITION TWO - LIGHTING COMPARISON"
            },
        ],
    },
    "collection-5": {
        title: "ATMOSPHERE PRACTICE",
        number: "05",
        images: [
            { lit: "/images/Others/01.png", caption: "CYBERPUNK ALLEY" },
            { lit: "/images/Others/02.png", caption: "INTERIOR SCENE" },
            { lit: "/images/Others/CyberRestaurant.png", caption: "CYBER RESTAURANT" },
        ],
    },
};

export default function LightingBreakdownPage() {
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
                <Link href="/works/lighting-portfolio" className="inline-flex items-center text-white/40 hover:text-white transition-colors uppercase tracking-widest text-xs font-mono mb-12">
                    BACK TO PORTFOLIO
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="font-mono text-white/40 tracking-[0.4em] text-sm mb-4">COLLECTION {data.number}</p>
                        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase font-luna text-white">
                            {data.title}
                        </h1>
                    </div>
                    <p className="font-serif tracking-widest text-white/60 text-sm max-w-sm">
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
                                        <BeforeAfterSlider
                                            beforeImage={img.unlit}
                                            afterImage={img.lit}
                                            beforeAlt="Unlit pass"
                                            afterAlt="Lit pass"
                                        />
                                    ) : (
                                        <img
                                            src={img.lit}
                                            alt={img.caption}
                                            className="w-full h-auto object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between items-center px-2">
                                    <p className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
                                        SLIDE {index + 1} OF {data.images.length}
                                    </p>
                                    <p className="font-serif text-xs md:text-sm tracking-widest text-white/80">
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
