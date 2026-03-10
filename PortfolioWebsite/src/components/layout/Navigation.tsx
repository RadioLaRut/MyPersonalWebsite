"use client";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isTestingMode } from "@/lib/site-mode";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const testingMode = isTestingMode();
  const keepsSpotlightVisible = pathname === "/contact";

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith("/admin") || !isOpen) {
      return;
    }

    const panelElement = menuPanelRef.current;
    if (!panelElement) {
      return;
    }
    const menuButtonElement = menuButtonRef.current;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    const focusableSelector =
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    const getFocusableElements = () =>
      Array.from(panelElement.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled"),
      );

    const firstFocusable = getFocusableElements()[0];
    (firstFocusable ?? panelElement).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !panelElement.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement || !panelElement.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      } else if (menuButtonElement) {
        menuButtonElement.focus();
      }
    };
  }, [isOpen, pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { label: "HOME", href: "/" },
    { label: "WORKS", href: "/works" },
    ...(testingMode ? [
      { label: "PLAYGROUND", href: "/playground" },
      { label: "EDITOR", href: "/admin" },
    ] : []),
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 px-8 py-8 flex justify-between items-center pointer-events-none mix-blend-difference">
        <div />

        <button
          onClick={() => setIsOpen(true)}
          ref={menuButtonRef}
          className="group pointer-events-auto flex flex-col items-end gap-1.5 interactive p-4"
          aria-label="Menu"
          aria-expanded={isOpen}
          aria-controls="site-navigation-drawer"
        >
          <span className="w-8 h-[1px] bg-white group-hover:w-12 transition-all duration-300"></span>
          <span className="w-5 h-[1px] bg-white group-hover:w-12 transition-all duration-300 delay-75"></span>
        </button>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[99] flex justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 ${keepsSpotlightVisible ? "bg-black/5" : "bg-black/18 backdrop-blur-sm"}`}
              onClick={closeMenu}
              onWheel={closeMenu}
              onTouchMove={closeMenu}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full sm:w-[40vw] h-full min-h-screen min-h-[100dvh] border-l border-white/10 bg-black/92 backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.2)]"
              id="site-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              tabIndex={-1}
              ref={menuPanelRef}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="h-full flex flex-col justify-center px-16 relative">
                <button
                  onClick={closeMenu}
                  className="absolute top-8 right-8 text-textMuted hover:text-white interactive p-4 tracking-widest text-sm"
                  aria-label="Close menu"
                >
                  CLOSE
                </button>

                <nav className="flex flex-col gap-8">
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                    >
                      <Link
                        href={item.href}
                        className="text-4xl sm:text-5xl font-bold tracking-tighter hover-text"
                        onClick={closeMenu}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-16 left-16 text-textMuted text-sm tracking-widest font-futura"
                >
                  JIANG CHENGYAN © 2026
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
