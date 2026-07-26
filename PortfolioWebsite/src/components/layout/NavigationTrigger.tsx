"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import type { NavigationDrawerProps } from "./NavigationDrawer";

const loadNavigationDrawer = () => import("./NavigationDrawer");

export default function NavigationTrigger({
  children,
  testingMode,
  triggerLabel,
}: {
  children: ReactNode;
  testingMode: boolean;
  triggerLabel: string;
}) {
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [shouldMountDrawer, setShouldMountDrawer] = useState(false);
  const [drawerReady, setDrawerReady] = useState(false);
  const [DrawerComponent, setDrawerComponent] =
    useState<ComponentType<NavigationDrawerProps> | null>(null);
  const drawerComponentRef =
    useRef<ComponentType<NavigationDrawerProps> | null>(null);
  const drawerLoadPromiseRef = useRef<Promise<void> | null>(null);
  const hoverIntentTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isOpen = openPathname !== null && openPathname === pathname;
  const shouldHideTrigger = isOpen && drawerReady;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (hoverIntentTimerRef.current !== null) {
        window.clearTimeout(hoverIntentTimerRef.current);
      }
    };
  }, []);

  const requestDrawer = useCallback(() => {
    setShouldMountDrawer(true);
    if (drawerComponentRef.current || drawerLoadPromiseRef.current) return;

    setDrawerReady(false);
    const loadPromise = loadNavigationDrawer()
      .then((module) => {
        if (!mountedRef.current) return;
        drawerComponentRef.current = module.default;
        setDrawerComponent(() => module.default);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setShouldMountDrawer(false);
        setOpenPathname(null);
      })
      .finally(() => {
        drawerLoadPromiseRef.current = null;
      });
    drawerLoadPromiseRef.current = loadPromise;
  }, []);
  const startHoverIntent = () => {
    if (hoverIntentTimerRef.current !== null) return;
    hoverIntentTimerRef.current = window.setTimeout(() => {
      hoverIntentTimerRef.current = null;
      requestDrawer();
    }, 120);
  };
  const cancelHoverIntent = () => {
    if (hoverIntentTimerRef.current === null) return;
    window.clearTimeout(hoverIntentTimerRef.current);
    hoverIntentTimerRef.current = null;
  };
  const openMenu = () => {
    requestDrawer();
    setOpenPathname(pathname ?? "/");
  };
  const closeMenu = useCallback(() => {
    setOpenPathname(null);
  }, []);
  const handleDrawerReady = useCallback(() => {
    setDrawerReady(true);
  }, []);

  return (
    <>
      <header
        className={`pointer-events-none fixed left-0 top-0 z-40 w-full px-5 py-6 transition-opacity duration-300 md:px-8 md:py-8 ${
          shouldHideTrigger ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="grid items-center justify-items-end">
          <button
            type="button"
            onClick={openMenu}
            onFocus={requestDrawer}
            onPointerEnter={startHoverIntent}
            onPointerLeave={cancelHoverIntent}
            ref={menuButtonRef}
            className="group interactive pointer-events-auto relative inline-grid grid-flow-col auto-cols-max items-center gap-3 text-edge-shadow outline-none transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            aria-label={triggerLabel}
            aria-expanded={isOpen}
            aria-busy={isOpen && !drawerReady ? true : undefined}
            aria-controls="site-navigation-drawer"
          >
            {children}
          </button>
        </div>
      </header>

      {shouldMountDrawer && DrawerComponent ? (
        <DrawerComponent
          isOpen={isOpen}
          onClose={closeMenu}
          onReady={handleDrawerReady}
          pathname={pathname}
          testingMode={testingMode}
          triggerRef={menuButtonRef}
        />
      ) : null}
    </>
  );
}
