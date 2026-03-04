"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkItem {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  desc: string;
}

const works: WorkItem[] = [
  {
    id: "lighting-atmosphere",
    title: "LIGHTING ATMOSPHERE",
    category: "Lighting & Environment",
    imageSrc: "/images/TrainStation/2Day.png",
    desc: "Train Station & Urban Environments",
  },
  {
    id: "insight",
    title: "INSIGHT",
    category: "Interactive Narrative Game",
    imageSrc: "/images/Insight/InsightCover.png",
    desc: "Play as an internet opinion regulator modifying the world",
  },
  {
    id: "slay-the-virus",
    title: "SLAY THE VIRUS",
    category: "Deck-Building Game",
    imageSrc: "/images/STV/STVTitle.png",
    desc: "Play as a doctor fighting viruses with smart cells",
  },
  {
    id: "prometheus",
    title: "PROMETHEUS PROJECT",
    category: "Stealth Game",
    imageSrc: "/images/Prometheus/PrometheusTitle.png",
    desc: "A reporter infiltrating a government building",
  },
  {
    id: "holy-tank",
    title: "HOLY TANK",
    category: "Interactive Narrative",
    imageSrc: "/images/HolyTank/7d9ca92e5ade09bfc1c349a49001b2eb.png",
    desc: "Trackball controlled experience of hostile architecture",
  },
  {
    id: "pcg-town",
    title: "HOUDINI PROCEDURAL TOWN",
    category: "Procedural Generation",
    imageSrc: "/images/Others/PCG/PCG01.png",
    desc: "Houdini + UE automated town generation tool",
  },
  {
    id: "atmosphere-practice",
    title: "ATMOSPHERE PRACTICE",
    category: "Environment Art",
    imageSrc: "/images/Others/01.png",
    desc: "Cyberpunk and daily environment lighting practice",
  },
  {
    id: "epic-stage",
    title: "STAGE LIGHTING (EPIC)",
    category: "Stage Design & Lighting",
    imageSrc: "/images/Others/Epic.png",
    desc: "Musical theatre concept lighting choreography",
  },
];

export default function WorksPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const handleInteraction = (index: number) => {
    if (isMobile) {
      if (expandedIndex === index) {
        window.location.href = `/works/${works[index].id}`;
      } else {
        setExpandedIndex(index);
      }
    } else {
      window.location.href = `/works/${works[index].id}`;
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!isMobile) {
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredIndex(null);
    }
  };

  return (
    <main className="min-h-screen bg-black w-full overflow-hidden text-white flex flex-col justify-center pt-32 pb-20">
      <div className="px-8 sm:px-16 mb-16 relative z-20 mix-blend-difference pointer-events-none">
        <h1 className="text-sm tracking-widest text-white/50 uppercase font-medium">
          All Selected Works
        </h1>
      </div>

      <div
        className="flex flex-col w-full border-t border-white/10"
        onMouseLeave={handleMouseLeave}
      >
        {works.map((work, index) => {
          const isActive = isMobile
            ? expandedIndex === index
            : hoveredIndex === index;

          return (
            <div
              key={work.id}
              className="relative w-full border-b border-white/10 group interactive cursor-pointer flex flex-col justify-end h-[250px]"
              onMouseEnter={() => handleMouseEnter(index)}
              onClick={() => handleInteraction(index)}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
                  >
                    <div className="absolute inset-0 bg-black/40 z-10 custom-blend" />

                    <motion.img
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 5, ease: "easeOut" }}
                      src={work.imageSrc}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-center justify-between px-8 sm:px-16 py-8 mix-blend-difference pointer-events-none">
                <h2
                  className={`py-2 pr-4 -my-2 text-4xl sm:text-[6.5vw] font-black tracking-tighter uppercase leading-none whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-700 ease-out font-luna ${isActive ? "text-white [-webkit-text-stroke:1px_transparent]" : "text-transparent [-webkit-text-stroke:1px_#888]"}`}
                >
                  {work.title}
                </h2>
                <div className="hidden sm:block text-white/50 font-serif text-[2vw] tracking-widest">
                  0{index + 1}
                </div>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: isActive ? (isMobile ? "30vh" : "40vh") : "0vh",
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                className="relative z-10 px-8 sm:px-16 overflow-hidden pointer-events-none"
              >
                <div className="h-full flex flex-col justify-end pb-8 mix-blend-difference">
                  {isMobile && (
                    <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
                      Tap again to view details
                    </p>
                  )}
                  <p className="font-serif tracking-widest text-lg sm:text-2xl text-white/80 uppercase">
                    {work.category}
                  </p>
                  <p className="mt-2 text-sm text-white/50 font-mono tracking-wider uppercase">
                    {work.desc}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
