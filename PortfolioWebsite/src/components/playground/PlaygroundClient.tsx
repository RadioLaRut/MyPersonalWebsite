"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import puckConfig from "@/puck/config";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";

const EXCLUDED_COMPONENT_KEYS = new Set(["ContactFlashlight"]);
const HIDDEN_LEGACY_COMPONENT_KEYS = new Set([
  "HeroHeadline",
  "PortfolioHeroHeader",
  "MetadataListItem",
  "TextParagraphBlock",
  "ContactExperienceItem",
  "ContactDirectionItem",
  "WorksListEntry",
]);
const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  BreakdownIntroHeader: "BreakdownIntroHeader",
  BreakdownHeadline: "BreakdownSectionHeadline",
  LightingCollectionHeroHeader: "LightingCollectionHeroHeader",
};
const PLAYGROUND_GROUPS = [
  {
    label: "Headline Blocks",
    description: "所有标题与页面头图模块。",
    keys: ["BreakdownIntroHeader", "BreakdownHeadline", "LightingCollectionHeroHeader"],
  },
  {
    label: "Text Blocks",
    description: "纯文字与图文叙事模块。",
    keys: ["RichParagraph", "TextSplitLayout", "MediaTextCard", "HighDensityInfoBlock"],
  },
  {
    label: "Media Blocks",
    description: "图片、滑块、参数和拼贴模块。",
    keys: ["ImagePanel", "ImageSlider", "MosaicGallery", "BreakdownTriptych", "ParameterGrid"],
  },
  {
    label: "Page Blocks",
    description: "首页、作品流和跳转模块。",
    keys: ["HeroSection", "ProjectSection", "HomeEndcapSection", "WorksList", "LightingProjectCard", "NextProjectBlock", "LightingCollectionGallery"],
  },
] as const;

const PLAYGROUND_PROPS: Record<string, Record<string, unknown>> = {
  TextSplitLayout: {
    imageSrc: "/images/train-station/2Day.webp",
  },
  HighDensityInfoBlock: {
    phase3ImageSrc: "/images/train-station/2Day.webp",
  },
  ProjectSection: {
    title: "PENGUIN TRADING CO.",
    subtitle: "Lead Designer / PM / Tech Art",
    imageSrc: CANONICAL_PLACEHOLDER_PATH,
    link: "/works/penguin",
    index: 1,
    align: "auto",
  },
  WorksList: {
    entries: [
      {
        type: "WorksListEntry",
        props: {
          id: "playground-work-1",
          number: "01",
          href: "/works/lighting-portfolio",
          title: "LIGHTING PORTFOLIO",
          category: "Lighting Art",
          imageSrc: "/images/train-station/2Day.webp",
          desc: "A curated collection of lighting and mood practices",
        },
      },
      {
        type: "WorksListEntry",
        props: {
          id: "playground-work-2",
          number: "02",
          href: "/works/penguin",
          title: "PENGUIN TRADING CO.",
          category: "Lead Designer / PM / Tech Art",
          imageSrc: CANONICAL_PLACEHOLDER_PATH,
          desc: "Simulation management game with asset lock systems",
        },
      },
    ],
  },
  LightingProjectCard: {
    href: "/works/lighting-portfolio/collection-1",
    coverImage: "/images/city-2026/002.webp",
  },
  NextProjectBlock: {
    nextId: "insight",
    nextName: "INSIGHT",
    nextBg: "/images/insight/InsightOnlyCover.webp",
  },
  LightingCollectionGallery: {
    title: "CITY ADD",
    number: "01",
    description: "A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for city add.",
    backHref: "/works/lighting-portfolio",
    images: [
      { lit: "/images/city-2026/001.webp", caption: "DAY", _arrayItem: { id: "demo-1" } },
      { lit: "/images/city-2026/002.webp", caption: "DUSK", _arrayItem: { id: "demo-2" } },
      { lit: "/images/city-2026/003.webp", caption: "NIGHT", _arrayItem: { id: "demo-3" } },
    ],
  },
};

const playgroundComponents = Object.entries(puckConfig.components).filter(
  ([componentKey]) => !EXCLUDED_COMPONENT_KEYS.has(componentKey) && !HIDDEN_LEGACY_COMPONENT_KEYS.has(componentKey),
);
const groupedPlaygroundComponents = PLAYGROUND_GROUPS.map((group) => ({
  ...group,
  components: playgroundComponents.filter(([componentKey]) => (group.keys as readonly string[]).includes(componentKey)),
})).filter((group) => group.components.length > 0);

export default function PlaygroundClient() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-32">
      <div className="grid-container">
        <div className="col-span-4 md:col-start-2 md:col-span-10 mb-24">
          <Link
            href="/"
            className="inline-block mb-8 font-mono text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
            ← 返回首页
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[8vw] md:text-[5vw] font-luna font-black leading-none tracking-tighter mb-6"
          >
            PLAYGROUND 游乐场
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-futura text-white/70 tracking-wide text-lg md:text-xl max-w-3xl"
          >
            当前页面会自动展示 Puck 中全部常规组件，用于统一预览布局与交互。
          </motion.p>
        </div>

        <div className="col-span-4 md:col-span-12 border-b border-white/20 mb-24" />

        {groupedPlaygroundComponents.map((group, groupIndex) => (
          <div key={group.label} className="col-span-4 md:col-span-12 mb-20">
            <div className="mb-12 border-b border-white/10 pb-6">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-white/35">
                {`GROUP ${String(groupIndex + 1).padStart(2, "0")}`}
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-futura tracking-[0.14em] uppercase text-white">
                {group.label}
              </h2>
              <p className="mt-3 font-futura text-sm md:text-base tracking-wide text-white/55">
                {group.description}
              </p>
            </div>

            {group.components.map(([componentKey, componentConfig], componentIndex) => {
              const componentProps = {
                ...(componentConfig.defaultProps ?? {}),
                ...(PLAYGROUND_PROPS[componentKey] ?? {}),
                editMode: false,
              } as never;

              return (
                <div key={componentKey} className="mb-32 group">
                  <div className="mb-4">
                    <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                      {`UI COMPONENT ${String(componentIndex + 1).padStart(2, "0")}`}
                    </span>
                    <h3 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<${COMPONENT_DISPLAY_NAMES[componentKey] ?? componentKey} />`}</h3>
                  </div>

                  {componentConfig.render(componentProps)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
