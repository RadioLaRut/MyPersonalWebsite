import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// If you have Noto Serif SC or similar custom font
const notoSerif = localFont({
  src: "./fonts/GeistVF.woff", // Placeholder, using actual font file path if available
  variable: "--font-noto-serif",
  weight: "400",
  style: "italic",
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
      <body className={`${inter.variable} ${notoSerif.variable} bg-black text-white antialiased`}>
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
