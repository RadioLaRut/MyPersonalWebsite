import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

// 无衬线体 - Futura (完整字体家族)
const futura = localFont({
  src: [
    { path: "./fonts/Futura Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/Futura Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Futura Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/Futura Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Futura Medium Italic.otf", weight: "500", style: "italic" },
    { path: "./fonts/Futura Medium Oblique.otf", weight: "500", style: "oblique" },
    { path: "./fonts/Futura Bold Condensed.otf", weight: "700", style: "normal" },
    { path: "./fonts/Futura Bold Italic.otf", weight: "700", style: "italic" },
    { path: "./fonts/Futura Bold Oblique.otf", weight: "700", style: "oblique" },
    { path: "./fonts/Futura Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-futura",
});

// 衬线体 - Noto Serif SC
const notoSerif = localFont({
  src: [
    { path: "./fonts/NotoSerifSC-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "./fonts/NotoSerifSC-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/NotoSerifSC-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/NotoSerifSC-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/NotoSerifSC-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/NotoSerifSC-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/NotoSerifSC-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/NotoSerifSC-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-noto-serif",
});

// 等宽字体 - 汉仪旗黑
const hanYiQiHei = localFont({
  src: [
    { path: "./fonts/HYQiHei_30S.ttf", weight: "300", style: "normal" },
    { path: "./fonts/HYQiHei_40S.ttf", weight: "400", style: "normal" },
    { path: "./fonts/HYQiHei_50S.ttf", weight: "500", style: "normal" },
    { path: "./fonts/HYQiHei_60S.ttf", weight: "600", style: "normal" },
    { path: "./fonts/HYQiHei_70S.ttf", weight: "700", style: "normal" },
    { path: "./fonts/HYQiHei_80S.ttf", weight: "800", style: "normal" },
    { path: "./fonts/HYQiHei_90S.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-han-yi-qi-hei",
});

export const metadata: Metadata = {
  title: "JIANG CHENGYAN - GAME DIRECTOR & DEVELOPER",
  description: "2026 Portfolio of Jiang Chengyan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${futura.variable} ${notoSerif.variable} ${hanYiQiHei.variable} bg-black text-white antialiased`}>
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
