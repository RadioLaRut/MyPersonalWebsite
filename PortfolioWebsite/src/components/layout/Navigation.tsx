"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Typography from "@/components/common/Typography";
import { isTestingMode } from "@/lib/site-mode";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const testingMode = isTestingMode();
  const keepsSpotlightVisible = pathname === "/about";
  const headerDuration = 0.4;
  const overlayDuration = 0.65;
  const panelDuration = 0.82;
  const menuItemDuration = 0.52;
  const menuItemDelayStep = 0.12;
  const menuItemInitialDelay = 0.16;
  const footerDelay = 0.66;
  const overlayTransition = { duration: overlayDuration, ease: [0.22, 1, 0.36, 1] as const };
  const panelTransition = { duration: panelDuration, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen || !isOverlayActive) {
      return;
    }

    const overlayTeardownTimer = window.setTimeout(() => {
      setIsOverlayActive(false);
    }, panelDuration * 1000);

    return () => window.clearTimeout(overlayTeardownTimer);
  }, [isOpen, isOverlayActive, panelDuration]);

  useLayoutEffect(() => {
    if (pathname?.startsWith("/admin") || !isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen, pathname]);

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

      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      } else if (menuButtonElement) {
        menuButtonElement.focus();
      }
    };
  }, [isOpen, pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const openMenu = () => {
    setIsOverlayActive(true);
    setIsOpen(true);
  };
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Lighting", href: "/works/lighting-portfolio" },
    { label: "All Works", href: "/works" },
    { label: "About", href: "/about" },
    ...(testingMode ? [
      { label: "Playground", href: "/playground" },
      { label: "Editor", href: "/admin" },
    ] : []),
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? "none" : "auto" }}
        transition={{ duration: headerDuration, ease: "easeOut" }}
        className="fixed left-0 top-0 z-40 w-full px-5 py-6 md:px-8 md:py-8"
      >
        <div className="flex items-center justify-end">
          <button
            onClick={openMenu}
            ref={menuButtonRef}
            className="group interactive pointer-events-auto relative flex items-center gap-3 transition-colors duration-300 text-edge-shadow"
            aria-label="Menu"
            aria-expanded={isOpen}
            aria-controls="site-navigation-drawer"
          >
            <span aria-hidden="true" className="absolute -inset-3 md:-inset-4" />
            <Typography
              as="span"
              preset="sans-body"
              size="label"
              weight="medium"
              wrapPolicy="label"
              className="relative z-10 text-white/80 transition-colors duration-300 group-hover:text-white"
            >
              MENU
            </Typography>
            <span className="relative z-10 flex flex-col items-end gap-[7px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <span className="h-[1.5px] w-10 bg-white/90 transition-all duration-300 group-hover:w-14 group-hover:bg-white md:w-12"></span>
              <span className="h-[1.5px] w-6 bg-white/90 transition-all duration-300 group-hover:w-14 group-hover:bg-white md:w-8"></span>
            </span>
          </button>
        </div>
      </motion.header>

      <div
        className={`fixed inset-0 z-[99] flex justify-end ${isOverlayActive ? "pointer-events-auto" : "pointer-events-none"}`}
        data-lenis-prevent="true"
        aria-hidden={!isOverlayActive}
      >
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={overlayTransition}
          className={`absolute inset-0 ${keepsSpotlightVisible ? "bg-black/5" : "bg-black/18 backdrop-blur-md"}`}
        />

        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={overlayTransition}
          className="absolute inset-0 cursor-pointer"
          onClick={closeMenu}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          aria-hidden="true"
        />

        <AnimatePresence>
          {isOverlayActive && (
            <motion.div
              initial={{ x: "100%", opacity: 1 }}
              animate={{ x: isOpen ? 0 : "100%", opacity: 1 }}
              exit={{ x: "100%", opacity: 1 }}
              transition={panelTransition}
              style={{ willChange: "transform" }}
              className="relative flex min-h-[100dvh] w-full flex-col overflow-y-auto overscroll-contain border-l border-white/10 bg-[linear-gradient(180deg,rgba(8,8,8,0.98)_0%,rgba(5,5,5,0.94)_100%)] shadow-[-24px_0_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:w-[40vw] sm:min-w-[400px]"
              id="site-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              tabIndex={-1}
              ref={menuPanelRef}
              data-lenis-prevent="true"
              onClick={(event) => event.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="relative flex min-h-[100dvh] flex-col justify-start px-8 pt-28 pb-16 md:px-16 md:pt-32 md:pb-20">
                <div className="absolute right-5 top-6 md:right-8 md:top-8 flex justify-end text-edge-shadow">
                  <button
                    onClick={closeMenu}
                    className="group interactive outline-none focus:outline-none focus-visible:outline-none flex items-center gap-3 transition-colors duration-300"
                    aria-label="Close menu"
                  >
                    <Typography
                      as="span"
                      preset="sans-body"
                      size="label"
                      weight="medium"
                      wrapPolicy="label"
                      className="text-white/50 transition-colors duration-300 group-hover:text-white"
                    >
                      CLOSE
                    </Typography>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-white md:h-6 md:w-6"
                    >
                      <path
                        d="M6 6L18 18M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex w-full flex-1 flex-col justify-center">
                  <nav className="flex flex-col gap-0.5 md:gap-1">
                    {menuItems.map((item, i) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            delay: menuItemInitialDelay + i * menuItemDelayStep,
                            duration: menuItemDuration,
                          }}
                        >
                          <Link
                            href={item.href}
                            className={`group relative flex items-center transition-all duration-300 ${isActive
                              ? "text-white"
                              : "text-white/40"
                              } hover:text-white`}
                            onClick={closeMenu}
                          >
                            <Typography
                              as="span"
                              preset="classical-display"
                              size="menu"
                              weight="regular"
                              wrapPolicy="heading"
                              className="inline-block text-inherit transition-all duration-400 ease-[0.22,1,0.36,1] group-hover:translate-x-3 group-hover:[transform:skewX(-10deg)] md:max-w-[10ch]"
                            >
                              {item.label}
                            </Typography>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: footerDelay, duration: 0.45 }}
                  className="mt-auto pt-16"
                >
                  <Typography
                    preset="sans-body"
                    size="caption"
                    weight="medium"
                    wrapPolicy="label"
                    className="text-white/34"
                  >
                    JIANG CHENGYAN © 2026
                  </Typography>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
