"use client";

import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { motion } from "framer-motion";

import Typography from "@/components/common/Typography";
import { MotionButton } from "@/components/motion/MotionButton";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionClassNames } from "@/lib/motion/classes";
import { motionSprings } from "@/lib/motion/tokens";
import {
  menuItemVariants,
  navigationFooterVariants,
  navigationIndicatorVariants,
  navigationLabelVariants,
  navigationOverlayVariants,
  navigationPanelVariants,
} from "@/lib/motion/variants";
import { PUBLIC_COPY } from "@/lib/public-copy";

function isNavigationItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
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

export type NavigationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onReady: () => void;
  pathname: string | null;
  testingMode: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function NavigationDrawer({
  isOpen,
  onClose,
  onReady,
  pathname,
  testingMode,
  triggerRef,
}: NavigationDrawerProps) {
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (menuPanelRef.current) menuPanelRef.current.inert = !isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !menuPanelRef.current) return;
    const panel = menuPanelRef.current;
    const triggerElement = triggerRef.current;
    const focusableSelector =
      "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));

    (getFocusable()[0] ?? panel).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggerElement?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  const menuItems = [
    ...PUBLIC_COPY.navigation.items,
    ...(testingMode ? PUBLIC_COPY.navigation.testingItems : []),
  ];
  const keepsSpotlightVisible = pathname === "/about";

  return (
    <div
      className={`fixed inset-0 z-[99] grid justify-items-end ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      data-lenis-prevent="true"
      aria-hidden={!isOpen}
    >
      <motion.div
        initial={false}
        animate={isOpen ? "visible" : "hidden"}
        variants={navigationOverlayVariants}
        className={`absolute inset-0 ${
          keepsSpotlightVisible ? "bg-black/5" : "bg-black/18 backdrop-blur-md"
        }`}
      />
      <motion.div
        initial={false}
        animate={isOpen ? "visible" : "hidden"}
        variants={navigationOverlayVariants}
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        aria-hidden="true"
      />

      <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={navigationPanelVariants}
          style={{ willChange: "transform" }}
          className="relative min-h-[100dvh] w-full overflow-y-auto overscroll-contain border-l border-white/10 bg-[linear-gradient(180deg,rgba(8,8,8,0.98)_0%,rgba(5,5,5,0.94)_100%)] shadow-[-24px_0_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:w-[40vw] sm:min-w-[400px]"
          id="site-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={PUBLIC_COPY.navigation.dialogLabel}
          aria-hidden={!isOpen}
          tabIndex={-1}
          ref={menuPanelRef}
          data-lenis-prevent="true"
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <div className="relative grid min-h-[100dvh] grid-rows-[1fr_auto] px-8 pb-16 pt-28 md:px-16 md:pb-20 md:pt-32">
            <div className="absolute right-5 top-6 grid justify-items-end text-edge-shadow md:right-8 md:top-8">
              <MotionButton
                onClick={onClose}
                className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-white/80"
                aria-label={PUBLIC_COPY.navigation.closeLabel}
              >
                <Typography
                  as="span"
                  preset="sans-body"
                  size="body-sm"
                  weight="semantic"
                  wrapPolicy="label"
                  className={`text-white/50 ${motionClassNames.fastColors} group-hover:text-white`}
                >
                  {PUBLIC_COPY.navigation.close}
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
              <nav
                aria-label={PUBLIC_COPY.navigation.navLabel}
                className="grid justify-items-start gap-0.5 md:gap-1"
              >
                {menuItems.map((item, index) => {
                  const isActive = isNavigationItemActive(pathname, item.href);
                  return (
                    <motion.div
                      key={item.label}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuItemVariants}
                    >
                      <MotionLink
                        href={item.href}
                        className={`group relative grid items-center ${motionClassNames.fastAll} focus-visible:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/80 ${
                          isActive ? "text-white" : "text-white/20"
                        } hover:text-white`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onClose}
                      >
                        <motion.div
                          className="grid grid-cols-[auto_auto] items-center gap-7"
                          initial="initial"
                          whileHover="hover"
                          animate="initial"
                        >
                          <div className="grid w-1 place-items-center overflow-visible pt-[6px]">
                            {isActive ? (
                              <motion.div
                                layoutId="active-indicator"
                                variants={navigationIndicatorVariants}
                                className="h-8 w-[0.5px] shrink-0 origin-center bg-gradient-to-b from-transparent via-white to-transparent"
                                transition={motionSprings.navigationIndicator}
                              />
                            ) : null}
                          </div>
                          <motion.div variants={navigationLabelVariants}>
                            <Typography
                              as="span"
                              preset="classical-display"
                              size="menu"
                              weight="semantic"
                              wrapPolicy="heading"
                              className={`inline-block text-inherit ${motionClassNames.navigationLabel} ${
                                isActive ? "tracking-widest" : "tracking-normal"
                              }`}
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
    </div>
  );
}
