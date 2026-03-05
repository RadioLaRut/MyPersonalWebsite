"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkItem {
  id: string;
  href?: string;
  title: string;
  category: string;
  imageSrc: string;
  desc: string;
}

const works: WorkItem[] = [
  {
    id: "lighting-portfolio",
    href: "/p/works/lighting-portfolio",
    title: "LIGHTING PORTFOLIO",
    category: "Lighting Art",
    imageSrc: "/images/TrainStation/2Day.png",
    desc: "A curated collection of lighting and mood practices",
  },
  {
    id: "slay-the-virus",
    title: "SLAY THE VIRUS",
    category: "UI / Poster / Game Design",
    imageSrc: "/images/STV/STVTitle.png",
    desc: "A deck-building and inventory management game",
  },
  {
    id: "wow-otto",
    title: "WOW, OTTO!",
    category: "Lead Designer",
    imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
    desc: "Trackball narrative experience",
  },
  {
    id: "im-explode",
    title: "I'M EXPLODE WITH U",
    category: "Lead Designer",
    imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
    desc: "Multiplayer platformer with pushback mechanics",
  },
  {
    id: "prometheus",
    title: "THE PROMETHEUS",
    category: "Lead Designer / Lighting",
    imageSrc: "/images/Prometheus/PrometheusTitle.png",
    desc: "Stealth tactical game with dramatic lighting contrasts",
  },
  {
    id: "parallax",
    title: "SOMEWHERE BETWEEN PARALLAX",
    category: "UI Design",
    imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
    desc: "Interactive VR experience in fragmented memory",
  },
  {
    id: "insight",
    title: "INSIGHT",
    category: "Lead Designer / Programmer",
    imageSrc: "/images/Insight/InsightCover.png",
    desc: "Play as an internet opinion regulator controlling the narrative",
  },
  {
    id: "penguin",
    title: "PENGUIN TRADING CO.",
    category: "Lead Designer / PM / Tech Art",
    imageSrc: "/images/Others/CyberRestaurant.png", // Placeholder
    desc: "Simulation management game with asset lock systems",
  },
  {
    id: "houdini-pcg",
    title: "HOUDINI PROCEDURAL GENERATION",
    category: "Tech Art",
    imageSrc: "/images/Others/PCG/PCG01.png",
    desc: "Procedural environment generation with Houdini and UE5",
  },
  {
    id: "epic-stage",
    title: "EPIC STAGE LIGHTING",
    category: "Tech Art / Lighting",
    imageSrc: "/images/Others/Epic.png",
    desc: "Musical theatre concept lighting choreography",
  },
];

export default function WorksPage() {
  const isCmsPreviewEnabled =
    process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" || process.env.NEXT_PUBLIC_USE_JSON === "true";
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
    const fallbackHref = isCmsPreviewEnabled ? `/p/works/${works[index].id}` : `/works/${works[index].id}`;
    const targetHref = works[index].href ?? fallbackHref;
    if (isMobile) {
      if (expandedIndex === index) {
        window.location.href = targetHref;
      } else {
        setExpandedIndex(index);
      }
    } else {
      window.location.href = targetHref;
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
              className="relative w-full border-b border-white/10 group interactive cursor-pointer min-h-[30vh] sm:min-h-[40vh] flex flex-col justify-center"
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
                    <div className="absolute inset-0 bg-black/60 z-10 custom-blend" />

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

              <div className="grid-container relative z-10 pointer-events-none items-center py-12">
                {/* Index Number - Col 1 */}
                <div className="hidden md:block col-span-1 text-white/40 font-futura text-xl tracking-widest">
                  0{index + 1}
                </div>

                {/* Title - Col 2-8 */}
                <div className="col-span-4 md:col-start-2 md:col-span-7 flex flex-col justify-center py-4">
                  <h2
                    className={`text-6xl sm:text-[4vw] font-black tracking-tighter uppercase leading-none font-luna transition-all duration-700 ease-out whitespace-normal break-words py-2 ${isActive ? "text-white [-webkit-text-stroke:1px_transparent] translate-x-4" : "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]"}`}
                  >
                    {work.title}
                  </h2>
                </div>

                {/* Details - Col 9-12 */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    x: isActive ? 0 : -20
                  }}
                  transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                  className="col-span-4 md:col-start-9 md:col-span-4 flex flex-col justify-center md:border-l md:border-white/20 md:pl-8 mt-6 md:mt-0"
                >
                  {isMobile && (
                    <p className="text-white/40 text-[10px] tracking-widest uppercase mb-4">
                      Tap again to view details
                    </p>
                  )}
                  <p className="font-serif font-semibold tracking-widest text-sm sm:text-base text-white/90 uppercase">
                    {work.category}
                  </p>
                  <p className="mt-3 text-[10px] sm:text-xs text-white/60 font-futura font-medium tracking-[0.14em] uppercase leading-loose">
                    {work.desc}
                  </p>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
