"use client";
import React, { useCallback, useState, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Typography from "@/components/common/Typography";
import { MotionButton } from "@/components/motion/MotionButton";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  menuItemVariants,
  motion,
  motionClassNames,
  motionSprings,
  motionTransitions,
  navigationFooterVariants,
  navigationHeaderVariants,
  navigationIndicatorVariants,
  navigationLabelVariants,
  navigationOverlayVariants,
  navigationPanelVariants,
} from "@/lib/motion";
import { isTestingMode } from "@/lib/site-mode";

function isNavigationItemActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/works/lighting-portfolio") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/works") {
    return (
      (pathname === href || pathname.startsWith(`${href}/`)) &&
      !pathname.startsWith("/works/lighting-portfolio")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const testingMode = isTestingMode();
  const isInternalLabRoute =
    pathname?.startsWith("/playground/font-lab") ||
    pathname?.startsWith("/playground/component-lab");
  const keepsSpotlightVisible = pathname === "/about";
  const isOpen = openPathname !== null && openPathname === pathname;
  const setIsOpen = useCallback((nextValue: boolean) => {
    setOpenPathname(nextValue ? pathname ?? "/" : null);
  }, [pathname]);

  useEffect(() => {
    if (isOpen || !isOverlayActive) {
      return;
    }

    const overlayTeardownTimer = window.setTimeout(() => {
      setIsOverlayActive(false);
    }, motionTransitions.navigationPanel.duration * 1000);

    return () => window.clearTimeout(overlayTeardownTimer);
  }, [isOpen, isOverlayActive]);

  useLayoutEffect(() => {
    if (pathname?.startsWith("/admin") || isInternalLabRoute || !isOpen) {
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
  }, [isInternalLabRoute, isOpen, pathname, setIsOpen]);

  useLayoutEffect(() => {
    if (menuPanelRef.current) {
      menuPanelRef.current.inert = !isOpen;
    }
  }, [isOpen, isOverlayActive]);

  useEffect(() => {
    if (pathname?.startsWith("/admin") || isInternalLabRoute || !isOpen) {
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
  }, [isInternalLabRoute, isOpen, pathname, setIsOpen]);

  if (pathname?.startsWith("/admin") || isInternalLabRoute) return null;

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
        animate={isOpen ? "hidden" : "visible"}
        variants={navigationHeaderVariants}
        className="pointer-events-none fixed left-0 top-0 z-40 w-full px-5 py-6 md:px-8 md:py-8"
      >
        <div className="grid items-center justify-items-end">
          <MotionButton
            onClick={openMenu}
            ref={menuButtonRef}
            className="group interactive pointer-events-auto relative inline-grid grid-flow-col auto-cols-max items-center gap-3 text-edge-shadow"
            aria-label="Menu"
            aria-expanded={isOpen}
            aria-controls="site-navigation-drawer"
          >
            <span aria-hidden="true" className="absolute -inset-3 md:-inset-4" />
            <Typography
              as="span"
              preset="sans-body"
              size="body-sm"
              weight="semantic"
              wrapPolicy="label"
              className={`relative z-10 text-white/80 ${motionClassNames.fastColors} group-hover:text-white`}
            >
              MENU
            </Typography>
            <span className="relative z-10 grid justify-items-end gap-[7px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <span className={`h-[1.5px] w-10 bg-white/90 ${motionClassNames.fastAll} group-hover:w-14 group-hover:bg-white md:w-12`}></span>
              <span className={`h-[1.5px] w-6 bg-white/90 ${motionClassNames.fastAll} group-hover:w-14 group-hover:bg-white md:w-8`}></span>
            </span>
          </MotionButton>
        </div>
      </motion.header>

      <div
        className={`fixed inset-0 z-[99] grid justify-items-end ${isOverlayActive ? "pointer-events-auto" : "pointer-events-none"}`}
        data-lenis-prevent="true"
        aria-hidden={!isOpen}
      >
        <motion.div
          initial={false}
          animate={isOpen ? "visible" : "hidden"}
          variants={navigationOverlayVariants}
          className={`absolute inset-0 ${keepsSpotlightVisible ? "bg-black/5" : "bg-black/18 backdrop-blur-md"}`}
        />

        <motion.div
          initial={false}
          animate={isOpen ? "visible" : "hidden"}
          variants={navigationOverlayVariants}
          className="absolute inset-0 cursor-pointer"
          onClick={closeMenu}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          aria-hidden="true"
        />

        {isOverlayActive && (
          <motion.div
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={navigationPanelVariants}
              style={{ willChange: "transform" }}
              className="relative min-h-[100dvh] w-full overflow-y-auto overscroll-contain border-l border-white/10 bg-[linear-gradient(180deg,rgba(8,8,8,0.98)_0%,rgba(5,5,5,0.94)_100%)] shadow-[-24px_0_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:w-[40vw] sm:min-w-[400px]"
              id="site-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              aria-hidden={!isOpen}
              tabIndex={-1}
              ref={menuPanelRef}
              data-lenis-prevent="true"
              onClick={(event) => event.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="relative grid min-h-[100dvh] grid-rows-[1fr_auto] px-8 pt-28 pb-16 md:px-16 md:pt-32 md:pb-20">
                <div className="absolute right-5 top-6 grid justify-items-end text-edge-shadow md:right-8 md:top-8">
                  <MotionButton
                    onClick={closeMenu}
                    className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-white/80"
                    aria-label="Close menu"
                  >
                    <Typography
                      as="span"
                      preset="sans-body"
                      size="body-sm"
                      weight="semantic"
                      wrapPolicy="label"
                      className={`text-white/50 ${motionClassNames.fastColors} group-hover:text-white`}
                    >
                      CLOSE
                    </Typography>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 text-white/50 ${motionClassNames.fastColors} group-hover:text-white md:h-6 md:w-6`}
                    >
                      <path
                        d="M6 6L18 18M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </MotionButton>
                </div>

                <div className="grid w-full content-center justify-items-start">
                  <nav aria-label="主导航" className="grid justify-items-start gap-0.5 md:gap-1">
                    {menuItems.map((item, i) => {
                      const isActive = isNavigationItemActive(pathname, item.href);
                      return (
                        <motion.div
                          key={item.label}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={menuItemVariants}
                        >
                          <MotionLink
                            href={item.href}
                            className={`group relative grid items-center ${motionClassNames.fastAll} focus-visible:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/80 ${isActive ? "text-white" : "text-white/20"} hover:text-white`}
                            aria-current={isActive ? "page" : undefined}
                            onClick={closeMenu}
                          >
                            <motion.div 
                              className="grid grid-cols-[auto_auto] items-center gap-7"
                              initial="initial"
                              whileHover="hover"
                              animate="initial"
                            >
                              <div className="grid w-1 place-items-center overflow-visible pt-[6px]">
                                {isActive && (
                                  <motion.div
                                    layoutId="active-indicator"
                                    variants={navigationIndicatorVariants}
                                    className="h-8 w-[0.5px] shrink-0 bg-gradient-to-b from-transparent via-white to-transparent origin-center"
                                    transition={motionSprings.navigationIndicator}
                                  />
                                )}
                              </div>
                              <motion.div
                                variants={navigationLabelVariants}
                              >
                                <Typography
                                  as="span"
                                  preset="classical-display"
                                  size="menu"
                                  weight="semantic"
                                  wrapPolicy="heading"
                                  className={`inline-block text-inherit ${motionClassNames.navigationLabel} ${isActive ? "tracking-widest" : "tracking-normal"}`}
                                >
                                  {item.label}
                                </Typography>
                              </motion.div>
                            </motion.div>
                          </MotionLink>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={navigationFooterVariants}
                  className="pt-16"
                >
                  <Typography
                    preset="sans-body"
                    size="caption"
                    weight="semantic"
                    wrapPolicy="label"
                    className="text-white/34"
                  >
                    JIANG CHENGYAN © 2026
                  </Typography>
                </motion.div>
              </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
