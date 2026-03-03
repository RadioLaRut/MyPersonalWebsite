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
    <main className="w-full min-h-screen bg-black text-white pb-0 overflow-x-hidden mx-auto font-display selection:bg-white selection:text-black">
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
        <div className="relative z-10 text-center flex flex-col items-center gap-4 fade-in-section opacity-0 translate-y-8 transition-all duration-1000">
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/50">
            Project {data.idNum}
          </span>
          <h1 className="text-white text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none mix-blend-overlay">
            {data.title}
          </h1>
          {data.navLink && (
            <a
              href={data.navLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 border border-white/30 px-6 py-3 text-xs tracking-widest hover:bg-white hover:text-black transition-colors uppercase font-mono interactive mix-blend-difference"
            >
              播放演示视频 (Bilibili)
            </a>
          )}
        </div>
      </header>

      {/* 2. Commentary Block */}
      <article className="max-w-screen-xl mx-auto px-6 py-24 md:py-32 relative z-20 bg-black">
        <div className="max-w-[70ch] mx-auto text-center fade-in-section opacity-0 translate-y-8 transition-all duration-1000 ease-out">
          <p className="text-lg md:text-[22px] font-light leading-[2] text-white/80 text-justify sm:text-center tracking-wide font-sans">
            {data.description}
          </p>
        </div>
      </article>

      {/* 3. Technical Deep Dive Grid */}
      <section className="max-w-[1920px] mx-auto px-8 md:px-16 pb-32 relative z-20 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-section opacity-0 translate-y-8 transition-all duration-1000 ease-out pt-12 border-t border-white/10">
          <div className="space-y-4">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none">
              {data.col1.title}
            </h4>
            <p className="text-white/60 text-sm font-normal leading-[1.8] font-sans">
              {data.col1.text}
            </p>
            <div className="aspect-cinema w-full relative overflow-hidden mt-4 border border-white/10 group">
              <img
                src={data.col1.img}
                alt={data.col1.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none">
              {data.col2.title}
            </h4>
            <p className="text-white/60 text-sm font-normal leading-[1.8] font-sans">
              {data.col2.text}
            </p>
            <div className="aspect-cinema w-full relative overflow-hidden mt-4 border border-white/10 group">
              <img
                src={data.col2.img}
                alt={data.col2.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-base font-bold tracking-widest uppercase border-l-2 pl-3 border-white/80 leading-none">
              {data.col3.title}
            </h4>
            <p className="text-white/60 text-sm font-normal leading-[1.8] font-sans">
              {data.col3.text}
            </p>
            <div className="aspect-cinema w-full relative overflow-hidden mt-4 border border-white/10 group">
              <img
                src={data.col3.img}
                alt={data.col3.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
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
                className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
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
          <div className="absolute inset-0 bg-black z-10 transition-colors duration-500"></div>
          <img
            src={data.nextBg}
            alt="Next Project"
            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out opacity-40 group-hover:opacity-60"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 mix-blend-difference pointer-events-none">
            <span className="font-mono text-xs text-white/50 tracking-[0.3em] uppercase mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
              Next Project (下一项)
            </span>
            <h2 className="text-4xl md:text-[6vw] text-white font-black uppercase tracking-tighter transition-all duration-700 leading-none">
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
