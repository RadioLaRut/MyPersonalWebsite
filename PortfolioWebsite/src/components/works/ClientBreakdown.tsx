"use client";
import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ClientBreakdown({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".fade-in-section").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [data]);

  return (
    <main className="w-full min-h-screen bg-black text-white pb-0 overflow-x-hidden mx-auto font-sans selection:bg-white selection:text-black">
      {/* Top Nav Overlay */}
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-8 py-8 flex justify-between items-center pointer-events-none">
        <a
          href="/works"
          className="flex items-center gap-4 pointer-events-auto hover:opacity-70 transition-opacity interactive"
        >
          <div className="w-8 h-[1px] bg-white relative">
            <div className="absolute left-0 -top-1 w-2 h-[1px] bg-white origin-left rotate-45"></div>
            <div className="absolute left-0 top-1 w-2 h-[1px] bg-white origin-left -rotate-45"></div>
          </div>
          <span className="font-mono text-xs tracking-widest text-white/80">
            INDEX
          </span>
        </a>
      </nav>

      {/* 1. Hero Section */}
      <header
        className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black"
        ref={containerRef}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: heroY }}
        >
          <img
            src={data.heroImage}
            alt={data.title}
            className="w-full h-full object-cover opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_140%)] pointer-events-none"></div>
        </motion.div>

        {/* Title Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-32 pointer-events-none">
          <div className="grid-container w-full fade-in-section opacity-0 translate-y-8 transition-all duration-1000 mix-blend-difference pointer-events-auto">
            <div className="col-span-4 md:col-start-2 md:col-span-10 flex flex-col items-start gap-4">
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/50">
                Project {data.idNum}
              </span>
              <h1 className="text-white text-[12vw] sm:text-[7vw] font-black tracking-normal uppercase leading-[0.85] font-futura">
                {data.title}
              </h1>
              {data.navLink && (
                <a
                  href={data.navLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 border border-white/30 px-6 py-3 text-xs tracking-widest hover:bg-white hover:text-black transition-colors uppercase font-mono interactive mix-blend-normal"
                >
                  播放演示视频 (Bilibili)
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Commentary Block */}
      <article className="w-full py-24 md:py-32 relative z-20 bg-black">
        <div className="grid-container w-full">
          <div className="col-span-4 md:col-start-3 md:col-span-8 fade-in-section opacity-0 translate-y-8 transition-all duration-1000 ease-out">
            <p className="text-xl md:text-[24px] font-medium leading-[2.2] text-white/90 text-justify font-futura tracking-wide">
              {data.description}
            </p>
          </div>
        </div>
      </article>

      {/* 3. Technical Deep Dive Grid */}
      <section className="w-full relative z-20 bg-black pb-32">
        <div className="grid-container w-full fade-in-section opacity-0 translate-y-8 transition-all duration-1000 ease-out pt-16 border-t border-white/10">

          <div className="col-span-4 md:col-span-3 space-y-4">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
              {data.col1.title}
            </h4>
            <p className="text-white/70 text-sm font-medium leading-[2] font-futura">
              {data.col1.text}
            </p>
            <div className="w-full relative overflow-hidden mt-6 border border-white/10">
              <img
                src={data.col1.img}
                alt={data.col1.title}
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>

          <div className="col-span-4 md:col-start-5 md:col-span-4 space-y-4 mt-16 md:mt-0">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
              {data.col2.title}
            </h4>
            <p className="text-white/70 text-sm font-medium leading-[2] font-futura">
              {data.col2.text}
            </p>
            <div className="w-full relative overflow-hidden mt-6 border border-white/10">
              <img
                src={data.col2.img}
                alt={data.col2.title}
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>

          <div className="col-span-4 md:col-start-10 md:col-span-3 space-y-4 mt-16 md:mt-0">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none font-futura">
              {data.col3.title}
            </h4>
            <p className="text-white/70 text-sm font-medium leading-[2] font-futura">
              {data.col3.text}
            </p>
            <div className="w-full relative overflow-hidden mt-6 border border-white/10">
              <img
                src={data.col3.img}
                alt={data.col3.title}
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 4. Fullscreen Gallery Section */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="w-full flex flex-col pt-0 pb-0 gap-y-1 bg-black relative z-10">
          {data.gallery.map((imgSrc: string, index: number) => (
            <div
              key={index}
              className="w-full h-screen relative bg-black fade-in-section opacity-0 translate-y-8 transition-all duration-1000 ease-out"
            >
              <img
                src={imgSrc}
                alt={`${data.title} Gallery ${index}`}
                className="absolute inset-0 w-full h-full object-contain opacity-100 pointer-events-none"
              />
            </div>
          ))}
        </section>
      )}

      {/* Footer / Next Project */}
      <footer className="mt-0 border-t border-white/20 relative z-20">
        <a
          href={`/works/${data.nextId}`}
          className="group block relative h-[40vh] md:h-[60vh] overflow-hidden w-full interactive bg-black"
        >
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 z-10 transition-colors duration-700 pointer-events-none"></div>
          <img
            src={data.nextBg}
            alt="Next Project"
            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-out opacity-40 group-hover:opacity-100"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 mix-blend-difference pointer-events-none">
            <span className="font-mono text-xs text-white/50 tracking-[0.3em] uppercase mb-4 opacity-70 group-hover:opacity-100 transition-all duration-700">
              NEXT PROJECT
            </span>
            <h2 className="text-4xl md:text-[6vw] text-white font-black uppercase tracking-tighter transition-all duration-700 leading-none font-futura">
              {data.nextName}
            </h2>
          </div>
        </a>
        <div className="bg-black py-8 px-8 md:px-12 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-mono text-white/40 tracking-widest border-t border-white/10">
          <span className="mb-2 md:mb-0">© 2026 江承彦 / JIANG CHENGYAN</span>
          <span>Designed for Darkness</span>
        </div>
      </footer>
    </main>
  );
}
