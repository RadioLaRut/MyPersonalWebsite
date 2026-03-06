import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import { isTestingMode } from "@/lib/site-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIANG CHENGYAN",
  description: "2026 Portfolio of Jiang Chengyan",
};

const notoSerif = localFont({
  src: [
    {
      path: "./fonts/NotoSerifSC-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Black.ttf",
      weight: "900",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const testingMode = isTestingMode();

  return (
    <html lang="en" data-site-mode={testingMode ? "testing" : "normal"}>
      <body className={`bg-black text-white antialiased ${notoSerif.variable} ${hanYiQiHei.variable} ${futura.variable} ${luna.variable} ${gothic.variable}`}>
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
