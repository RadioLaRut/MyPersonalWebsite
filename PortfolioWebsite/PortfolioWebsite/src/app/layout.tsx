import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIANG CHENGYAN",
  description: "2026 Portfolio of Jiang Chengyan",
};

const notoSerif = localFont({
  src: [
    {
      path: "./fonts/NotoSerifSC-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/NotoSerifSC-Black.woff2",
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
      path: "./fonts/HYQiHei_30S.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_40S.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_50S.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_60S.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_70S.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_80S.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/HYQiHei_90S.woff2",
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
      path: "./fonts/Futura Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Futura Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Futura Medium.woff2",
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
      path: "./fonts/LunaITCStd.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/LunaITCStd-Bold.woff2",
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
      path: "./fonts/itc-serif-gothic-light-588cee8a0bfb1.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-regular-588cef4e7134b.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-extra-bold-588cef7e1f5d9.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/itc-serif-gothic-heavy-588d443a778f2.woff2",
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
  return (
    <html lang="en">
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
