"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isBreakdownPage = pathname?.startsWith("/works/");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const menuItems = [
    { label: "HOME", href: "/" },
    { label: "WORKS", href: "/works" },
    { label: "PLAYGROUND", href: "/playground" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 px-8 py-8 flex justify-between items-center pointer-events-none mix-blend-difference">
        {!isBreakdownPage ? (
          <motion.div
            className="text-xs font-mono text-white/70 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <span className="opacity-40 mr-2">{"//"}</span>
            PORTFOLIO_2026
          </motion.div>
        ) : (
          <div />
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="group pointer-events-auto flex flex-col items-end gap-1.5 interactive p-4"
          aria-label="Menu"
        >
          <span className="w-8 h-[1px] bg-white group-hover:w-12 transition-all duration-300"></span>
          <span className="w-5 h-[1px] bg-white group-hover:w-12 transition-all duration-300 delay-75"></span>
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 w-full sm:w-[40vw] h-screen bg-black/80 backdrop-blur-2xl z-[99] border-l border-white/10"
          >
            <div className="h-full flex flex-col justify-center px-16 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-8 text-white/50 hover:text-white interactive p-4 tracking-widest text-sm"
              >
                CLOSE
              </button>

              <nav className="flex flex-col gap-8">
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                    className="text-4xl sm:text-5xl font-bold tracking-tighter hover-text"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-16 left-16 text-white/30 text-sm tracking-widest font-serif"
              >
                JIANG CHENGYAN © 2026
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
