import type { Metadata } from "next";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CustomCursor from "@/components/layout/CustomCursor";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

// If you have Noto Serif SC or similar custom font

export const metadata: Metadata = {
  title: "JIANG CHENGYAN - GAME DIRECTOR & DEVELOPER",
  description: "2026 Portfolio of Jiang Chengyan",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
