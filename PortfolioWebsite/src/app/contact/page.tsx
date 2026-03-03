"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const MASK_RADIUS = 350;

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
    <div className="max-w-5xl mx-auto space-y-24 w-full">
      <section className="space-y-8 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[12vw] sm:text-[8vw] font-black tracking-tighter mix-blend-normal leading-none"
        >
          JIANG CHENGYAN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-xl lg:text-3xl leading-[2] font-medium text-center max-w-3xl mix-blend-normal"
        >
          中国传媒大学 2028届 <br />
          游戏设计系<br /> <br />
          艺术与科技（数字娱乐方向）
        </motion.p>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left w-full border-t border-current pt-16"
      >
        <div className="space-y-6">
          <span className="text-sm uppercase tracking-[0.3em] font-mono opacity-50 mix-blend-normal">
            经历 & 学历
          </span>
          <ul className="space-y-4 text-xl font-bold mix-blend-normal leading-relaxed">
            <li>中国传媒大学 (CUC) GPA 3.8 / 4.0</li>
            <li>腾讯 - 光子艺术部 (灯光技术美术)</li>
            <li>Slay the Virus - 核心 UI 与策划</li>
            <li>暗喻之间 (Insight) - 叙事主程序</li>
            <li>企鹅贸易公司 - 主策划与 PM</li>
          </ul>
        </div>

        <div className="space-y-6">
          <span className="text-sm uppercase tracking-[0.3em] font-mono opacity-50 mix-blend-normal">
            技术栈
          </span>
          <ul className="space-y-4 text-xl font-bold mix-blend-normal leading-relaxed">
            <li>Unreal Engine 5 (Lumen / Nanite)</li>
            <li>Houdini Procedural Generation</li>
            <li>UI / UX 设计与美术规范</li>
            <li>Blueprint / C++ / Python 工具流</li>
            <li>Level Design 与电影级光影打光</li>
          </ul>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="w-full space-y-8 pt-16 flex flex-col items-center"
      >
        <span className="text-sm uppercase tracking-[0.3em] font-mono opacity-50 mix-blend-normal">
          联系我
        </span>
        <div className="flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm uppercase tracking-[0.3em] font-mono opacity-70 mix-blend-normal">
              WECHAT
            </span>
            <div className="block text-4xl sm:text-[5vw] font-black mix-blend-normal leading-none interactive">
              radiowithouthead
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm uppercase tracking-[0.3em] font-mono opacity-70 mix-blend-normal">
              Email
            </span>
            <a
              href="mailto:3115437519@qq.com"
              className="block text-4xl sm:text-[5vw] font-black mix-blend-normal leading-none interactive"
            >
              3115437519@qq.com
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );

  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] flex flex-col items-center px-6 py-32 overflow-x-hidden font-body selection:bg-white selection:text-black cursor-none">
      {/* Scrollable Container for both layers */}
      <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
        {/* Base Layer (Dark Text) */}
        <div className="text-[#1a1a1a] z-10 select-none pointer-events-none">
          {contentData}
        </div>

        {/* Reveal Layer (White Text masked by cursor) */}
        <div
          className="absolute inset-0 text-white z-20"
          style={{
            WebkitMaskImage: `radial-gradient(${MASK_RADIUS}px circle at ${mousePos.x} ${mousePos.y}, black 0%, transparent 100%)`,
            maskImage: `radial-gradient(${MASK_RADIUS}px circle at ${mousePos.x} ${mousePos.y}, black 0%, transparent 100%)`,
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
