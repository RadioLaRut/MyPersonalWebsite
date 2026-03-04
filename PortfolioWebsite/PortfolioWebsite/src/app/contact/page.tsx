"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const MASK_RADIUS = 500;

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    let lastClientX = window.innerWidth / 2;
    let lastClientY = window.innerHeight / 2;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = lastClientX - rect.left;
      const relativeY = lastClientY - rect.top;
      const minX = -MASK_RADIUS;
      const maxX = rect.width + MASK_RADIUS;
      const minY = -MASK_RADIUS;
      const maxY = rect.height + MASK_RADIUS;
      const x = Math.min(Math.max(relativeX, minX), maxX);
      const y = Math.min(Math.max(relativeY, minY), maxY);
      setMousePos({ x: `${x}px`, y: `${y}px` });
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      updatePosition();
    };

    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    updatePosition();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const contentData = (
    <div className="grid-container w-full py-16 sm:py-32">
      <section className="col-span-4 md:col-start-3 md:col-span-8 flex flex-col gap-6 mb-16 sm:mb-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[12vw] sm:text-[9vw] font-black tracking-tighter mix-blend-normal leading-none font-luna"
        >
          JIANG CHENGYAN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-xl sm:text-2xl lg:text-3xl leading-[2] font-semibold text-left max-w-2xl mix-blend-normal font-serif tracking-widest mt-8"
        >
          艺术与科技 / 交互叙事设计 / 游戏设计
          <br />
          <span className="text-sm font-mono opacity-50 tracking-[0.2em]">CUC &apos;2028</span>
        </motion.p>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="col-span-4 md:col-start-4 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-current pt-16"
      >
        <div className="space-y-8">
          <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
            Experience History
          </span>
          <ul className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif">
            <li className="flex flex-col">
              <span>腾讯光子工作室</span>
              <span className="text-sm font-mono opacity-50 mt-1">Lighing Technical Art Intern</span>
            </li>
            <li className="flex flex-col">
              <span>企鹅贸易公司 (Penguin Trading)</span>
              <span className="text-sm font-mono opacity-50 mt-1">Lead Designer & PM</span>
            </li>
            <li className="flex flex-col">
              <span>暗喻之间 (Insight)</span>
              <span className="text-sm font-mono opacity-50 mt-1">Lead Narrative System & Engineering</span>
            </li>
            <li className="flex flex-col">
              <span>杀毒奇兵 (Slay the Virus)</span>
              <span className="text-sm font-mono opacity-50 mt-1">Core UI & UX Direction</span>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
            Creative Direction
          </span>
          <ul className="space-y-6 text-lg sm:text-xl font-medium mix-blend-normal leading-relaxed font-serif tracking-wide">
            <li className="flex flex-col">
              <span>交互叙事与关卡设计</span>
              <span className="text-sm font-mono opacity-50 mt-1">Interactive Narrative & Level Design</span>
            </li>
            <li className="flex flex-col">
              <span>光影表现与视觉引导</span>
              <span className="text-sm font-mono opacity-50 mt-1">Lighting Atmosphere & Visual Guidance</span>
            </li>
            <li className="flex flex-col">
              <span>程序化生成与创作工具链</span>
              <span className="text-sm font-mono opacity-50 mt-1">Procedural Generation & Toolchains</span>
            </li>
            <li className="flex flex-col">
              <span>UI系统与交互原型落地</span>
              <span className="text-sm font-mono opacity-50 mt-1">UI Systems & Rapid Prototyping</span>
            </li>
          </ul>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="col-span-4 md:col-start-6 md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-current pt-16 mt-24"
      >
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
            WeChat / Social
          </span>
          <div className="text-2xl sm:text-3xl font-medium mix-blend-normal tracking-tight font-serif">
            radiowithouthead
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.4em] font-mono opacity-40 mix-blend-normal">
            Email / Contact
          </span>
          <div className="text-xl sm:text-2xl font-medium mix-blend-normal tracking-tight font-serif break-all">
            3115437519@qq.com
          </div>
        </div>
      </motion.section>
    </div>
  );

  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center overflow-x-hidden font-luna selection:bg-white selection:text-black cursor-none">
      {/* Scrollable Container for both layers */}
      <div ref={containerRef} className="relative w-full mx-auto pb-12">
        {/* Base Layer (Dark Text) */}
        <div className="text-white/40 z-10 select-none pointer-events-none transition-colors duration-300">
          {contentData}
        </div>

        {/* Reveal Layer (White Text masked by cursor) */}
        <div
          className="absolute inset-0 text-white z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
          style={{
            WebkitMaskImage: `radial-gradient(${MASK_RADIUS}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black 40%, transparent 100%)`,
            maskImage: `radial-gradient(${MASK_RADIUS}px circle at ${mousePos.x} ${mousePos.y}, black 0%, black 40%, transparent 100%)`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {contentData}
        </div>
      </div>
    </main>
  );
}
