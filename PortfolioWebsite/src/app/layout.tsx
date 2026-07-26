import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { SITE_MODE_ATTRIBUTE } from "@/lib/admin-attributes";
import { buildFontLabDocumentCssVars } from "@/lib/font-lab-css-vars";
import { readFontLabConfig } from "@/lib/font-lab-config";
import { SITE_ROBOTS_POLICY } from "@/lib/page-metadata";
import { PUBLIC_COPY } from "@/lib/public-copy";
import { isTestingMode } from "@/lib/site-mode";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: PUBLIC_COPY.metadata.title,
  description: PUBLIC_COPY.metadata.description,
  robots: SITE_ROBOTS_POLICY,
};

type StyleWithVars = CSSProperties & Record<string, string>;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const testingMode = isTestingMode();
  const fontLabDocument = await readFontLabConfig();
  const fontLabCssVars = buildFontLabDocumentCssVars(fontLabDocument) as StyleWithVars;

  return (
    <html
      lang="zh-CN"
      {...{ [SITE_MODE_ATTRIBUTE]: testingMode ? "testing" : "normal" }}
      style={fontLabCssVars}
    >
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
