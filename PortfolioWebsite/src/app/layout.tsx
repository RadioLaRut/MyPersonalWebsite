import type { CSSProperties } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { unstable_noStore as noStore } from "next/cache";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import FontLabGlobalVars from "@/components/layout/FontLabGlobalVars";
import Navigation from "@/components/layout/Navigation";
import { buildFontLabDocumentCssVars } from "@/lib/font-lab-css-vars";
import { readFontLabConfig } from "@/lib/font-lab-config";
import { isTestingMode } from "@/lib/site-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIANG CHENGYAN",
  description: "江承彦作品集：灯光、技术美术、游戏设计与交互叙事案例。",
};

const sourceHanSerif = localFont({
  src: [
    {
      path: "./fonts/SourceHanSerifSC-VF.otf",
      weight: "200 900",
      style: "normal",
    },
  ],
  variable: "--font-noto-serif",
  display: "swap",
  adjustFontFallback: false,
});

const hanYiQiHei = localFont({
  src: [
    {
      path: "./fonts/HYQiHei_30S.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_40S.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_50S.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_60S.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_70S.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_80S.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_90S.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-han-yi-qi-hei",
  display: "swap",
  adjustFontFallback: false,
});

const futura = localFont({
  src: [
    {
      path: "./fonts/Futura Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Futura Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Futura Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Futura Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-futura",
  display: "swap",
  adjustFontFallback: false,
});

const luna = localFont({
  src: [
    {
      path: "./fonts/LunaITCStd.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/LunaITCStd-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-luna",
  display: "swap",
  adjustFontFallback: false,
});

const gothic = localFont({
  src: [
    {
      path: "./fonts/itc-serif-gothic-light-588cee8a0bfb1.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-regular-588cef4e7134b.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-extra-bold-588cef7e1f5d9.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-heavy-588d443a778f2.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-gothic",
  display: "swap",
  adjustFontFallback: false,
});

const dmSerifDisplay = localFont({
  src: [
    {
      path: "./fonts/DMSerifDisplay-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-dm-serif",
  display: "swap",
  adjustFontFallback: false,
});

type StyleWithVars = CSSProperties & Record<string, string>;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  noStore();
  const testingMode = isTestingMode();
  const fontLabDocument = await readFontLabConfig();
  const fontLabCssVars = buildFontLabDocumentCssVars(fontLabDocument) as StyleWithVars;

  return (
    <html lang="zh-CN" data-site-mode={testingMode ? "testing" : "normal"}>
      <body
        className={`bg-black text-white antialiased ${sourceHanSerif.variable} ${hanYiQiHei.variable} ${futura.variable} ${luna.variable} ${gothic.variable} ${dmSerifDisplay.variable}`}
        style={fontLabCssVars}
      >
        <FontLabGlobalVars initialVars={fontLabCssVars} />
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
