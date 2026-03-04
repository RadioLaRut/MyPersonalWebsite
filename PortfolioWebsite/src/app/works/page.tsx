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
                <div className="hidden md:block col-span-1 text-white/40 font-serif text-xl tracking-widest">
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
                  <p className="font-serif tracking-widest text-sm sm:text-base text-white/90 uppercase">
                    {work.category}
                  </p>
                  <p className="mt-3 text-[10px] sm:text-xs text-white/50 font-mono tracking-widest uppercase leading-loose">
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
