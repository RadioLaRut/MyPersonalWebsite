"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import puckConfig from "@/puck/config";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";
import BilingualText from "@/components/common/BilingualText";

const EXCLUDED_COMPONENT_KEYS = new Set(["ContactFlashlight"]);
const HIDDEN_LEGACY_COMPONENT_KEYS = new Set([
  "PortfolioHeroHeader",
  "MetadataListItem",
  "TextParagraphBlock",
  "ContactExperienceItem",
  "ContactDirectionItem",
  "WorksListEntry",
]);
const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  BreakdownHeadline: "BreakdownSectionHeadline",
  LightingCollectionHeroHeader: "LightingCollectionHeroHeader",
};
const PLAYGROUND_GROUPS = [
  {
    label: "Headline Blocks",
    description: "所有标题与页面头图模块。",
    keys: ["HeroHeadline", "BreakdownHeadline", "LightingCollectionHeroHeader"],
  },
  {
    label: "Text Blocks",
    description: "纯文字与图文叙事模块。",
    keys: ["RichParagraph", "TextSplitLayout", "ContentCard", "HighDensityInfoBlock", "StatementBlock"],
  },
  {
    label: "Media Blocks",
    description: "图片、滑块、参数和拼贴模块。",
    keys: ["ImagePanel", "ImageSlider", "BreakdownTriptych", "ParameterGrid"],
  },
  {
    label: "Lighting Blocks",
    description: "灯光作品集专用模块。",
    keys: ["LightingCollectionHeader", "LightingCollectionItem"],
  },
  {
    label: "Page Blocks",
    description: "首页、作品流和跳转模块。",
    keys: ["HeroSection", "ProjectSection", "HomeEndcapSection", "WorksList", "LightingProjectCard", "NextProjectBlock"],
  },
] as const;

const PLAYGROUND_PROPS: Record<string, Record<string, unknown>> = {
  HeroHeadline: {
    eyebrow: "BREAKDOWN",
    title: "PROJECT TITLE",
    subtitle: "这是一个项目分解页面的标题组件，用于展示项目的主要信息和跳转链接。",
    heroImage: "/images/train-station/2Day.webp",
    navLink: "https://www.bilibili.com",
  },

  BreakdownHeadline: {
    title: "SECTION TITLE",
  },
  LightingCollectionHeroHeader: {
    title: "LIGHTING",
    subtitle: "PORTFOLIO",
    descriptionLine1: "A Curated Selection",
    descriptionLine2: "Unreal Engine 5",
  },
  RichParagraph: {
    content: "这是一个富文本段落组件，支持中英文混排。This is a rich paragraph component supporting bilingual text. 可以用于展示项目描述、设计思路或任何需要详细说明的内容。",
  },
  ContentCard: {
    title: "CONTENT CARD TITLE",
    description: "这是一个内容卡片组件，支持图文混排和纯文本两种模式。可以切换图片左右位置，无图片时自动切换为纯文本模式。",
    imageSrc: "/images/train-station/2Day.webp",
    tags: ["Tag 1", "Tag 2", "Tag 3"],
    imagePosition: "right",
  },
  TextSplitLayout: {
    heading: "SPLIT LAYOUT HEADING",
    paragraphs: "这是文本分割布局组件。左侧展示标题和段落，右侧展示图片。适合用于需要图文并排展示的场景。",
    imageSrc: "/images/train-station/2Day.webp",
  },
  ImagePanel: {
    src: "/images/train-station/2Day.webp",
    caption: "Image Panel Caption",
    variant: "content",
  },
  ImageSlider: {
    leftImage: "/images/city-2026/001.webp",
    rightImage: "/images/city-2026/002.webp",
    leftLabel: "DAY",
    rightLabel: "NIGHT",
  },
  BreakdownTriptych: {
    col1Title: "Column 1",
    col1Text: "First column content description.",
    col1Img: "/images/train-station/2Day.webp",
    col2Title: "Column 2",
    col2Text: "Second column content description.",
    col2Img: "/images/city-2026/001.webp",
    col3Title: "Column 3",
    col3Text: "Third column content description.",
    col3Img: "/images/city-2026/002.webp",
  },
  ParameterGrid: {
    mediaSrc: "/images/train-station/2Day.webp",
    parameters: [
      { label: "Parameter 1", value: "Value 1" },
      { label: "Parameter 2", value: "Value 2" },
      { label: "Parameter 3", value: "Value 3" },
    ],
  },
  StatementBlock: {
    content: "这是一个过渡区域组件，用于在项目之间创造呼吸感，让浏览体验更加舒适。",
    align: "center",
    backgroundColor: "black",
    minHeight: "medium",
  },
  HighDensityInfoBlock: {
    phase1Label: "PHASE 01 / CONTEXT",
    phase1Title: "Context",
    phase1Subtitle: "Phase 1 Subtitle",
    phase1Content: "Problem background and initial constraints.",
    phase2Label: "PHASE 02 / SYSTEM ARCHITECTURE",
    phase2Title: "Architecture",
    phase2Subtitle: "Phase 2 Subtitle",
    phase2Content: "Solution structure and implementation approach.",
    phase3Label: "PHASE 03 / EXECUTION & RESULTS",
    phase3Title: "Execution",
    phase3Subtitle: "Phase 3 Subtitle",
    phase3Content: "Results and lessons learned.",
    phase3ImageSrc: "/images/train-station/2Day.webp",
  },
  HeroSection: {
    title: "HERO SECTION",
    subtitle: "Portfolio / Design / Development",
    imageSrc: "/images/train-station/2Day.webp",
    link: "/works",
  },
  ProjectSection: {
    title: "PENGUIN TRADING CO.",
    subtitle: "Lead Designer / PM / Tech Art",
    imageSrc: CANONICAL_PLACEHOLDER_PATH,
    link: "/works/penguin",
    index: 1,
    align: "auto",
  },
  HomeEndcapSection: {
    eyebrow: "Selected Archive",
    title: "ALL WORKS",
    description: "A full index of interactive narrative, systems, lighting studies, and production experiments.",
    buttonLabel: "ENTER ARCHIVE",
    buttonHref: "/works",
  },
  WorksList: {
    heading: "All Selected Works",
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
    id: "collection-1",
    title: "CITY ADD",
    coverImage: "/images/city-2026/002.webp",
  },
  NextProjectBlock: {
    nextId: "insight",
    nextName: "INSIGHT",
    nextBg: "/images/insight/InsightOnlyCover.webp",
  },
  LightingCollectionHeader: {
    title: "CITY ADD",
    number: "01",
    description: "A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for city add.",
    backHref: "/works/lighting-portfolio",
  },
  LightingCollectionItem: {
    src: "/images/city-2026/001.webp",
    caption: "DAY",
  },
  GalleryItem: {
    src: "/images/train-station/2Day.webp",
    caption: "Demo Image",
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
    <main className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-24 md:pb-32">
      <div className="grid-container">
        {/* Header Section */}
        <div className="col-span-4 md:col-start-2 md:col-span-10 mb-16 md:mb-24">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-4 mb-10 md:mb-12"
            >
              <span className="font-mono text-sm uppercase tracking-[0.25em] text-white/50 group-hover:text-white transition-colors duration-300">
                ← 返回首页
              </span>
            </Link>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[12vw] sm:text-[10vw] md:text-[6vw] font-luna font-black leading-[0.9] tracking-tighter mb-6 md:mb-8"
          >
            PLAYGROUND
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <p className="font-futura text-white/60 tracking-wide text-base md:text-lg max-w-2xl leading-relaxed">
              组件预览与交互测试空间。展示 Puck 中全部常规组件，用于统一预览布局与交互效果。
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="col-span-4 md:col-span-12 border-b border-white/15 mb-16 md:mb-20 origin-left"
        />

        {/* BilingualText Component Showcase */}
        <div className="col-span-4 md:col-span-12 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-10 md:mb-12 border-b border-white/10 pb-6"
          >
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/30">
                00
              </span>
              <h2 className="text-2xl md:text-3xl font-futura tracking-[0.1em] uppercase text-white">
                BilingualText
              </h2>
            </div>
            <p className="font-futura text-sm md:text-base tracking-wide text-white/50 ml-10">
              双语文本组件，支持三种字重与自动中英文混排。
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Weight Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg md:text-xl font-futura tracking-wider text-white/70 mb-6">
                三种字重对比
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-white/40 uppercase tracking-[0.2em]">light</span>
                  <p className="text-white/80 text-lg leading-relaxed">
                    <BilingualText text="中文轻量字重 / Light English Weight" weight="light" />
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="font-mono text-xs text-white/40 uppercase tracking-[0.2em]">medium</span>
                  <p className="text-white/80 text-lg leading-relaxed">
                    <BilingualText text="中文中等字重 / Medium English Weight" weight="medium" />
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="font-mono text-xs text-white/40 uppercase tracking-[0.2em]">black</span>
                  <p className="text-white/80 text-lg leading-relaxed">
                    <BilingualText text="中文粗黑字重 / Black English Weight" weight="black" />
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mixed Content Demo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg md:text-xl font-futura tracking-wider text-white/70 mb-6">
                中英文混排效果
              </h3>
              <div className="bg-white/[0.02] rounded-lg p-6 md:p-8 space-y-6">
                <p className="text-white/80 text-base md:text-lg leading-[1.9]">
                  <BilingualText
                    text="这是一个BilingualText组件示例，展示中英文混排效果。This is a demo showing Chinese and English mixed text rendering with proper weight and baseline alignment."
                    weight="medium"
                  />
                </p>
                <p className="text-white/60 text-sm md:text-base leading-[1.85]">
                  <BilingualText
                    text="组件会自动检测文本中的中英文内容，并分别应用不同的字体和字重。The component automatically detects Chinese and English text, applying appropriate fonts and weights."
                    weight="light"
                  />
                </p>
              </div>
            </motion.div>

            {/* More Mixed Examples */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg md:text-xl font-futura tracking-wider text-white/70 mb-6">
                更多混排示例
              </h3>
              <div className="bg-white/[0.02] rounded-lg p-6 md:p-8 space-y-6">
                <p className="text-white/80 text-base md:text-lg leading-[1.9]">
                  <BilingualText
                    text="在UnrealEngine5中，我们使用Lumen全局光照系统来实现真实的光影效果。In Unreal Engine 5, we use the Lumen global illumination system to achieve realistic lighting effects."
                    weight="medium"
                  />
                </p>
                <p className="text-white/70 text-base md:text-lg leading-[1.9]">
                  <BilingualText
                    text="本项目的GitHub仓库地址是github.com/example/project，欢迎提交Issue和PR。The GitHub repository for this project is github.com/example/project, welcome to submit Issues and PRs."
                    weight="medium"
                  />
                </p>
                <p className="text-white/60 text-sm md:text-base leading-[1.85]">
                  <BilingualText
                    text="版本号v2.1.0已于2024年1月15日发布，包含15个新功能和23个Bug修复。Version v2.1.0 was released on January 15, 2024, including 15 new features and 23 bug fixes."
                    weight="light"
                  />
                </p>
                <p className="text-white/90 text-lg md:text-xl leading-[1.9] font-black">
                  <BilingualText
                    text="CSS3和HTML5是现代Web开发的基础技术，配合TypeScript使用效果更佳。CSS3 and HTML5 are fundamental technologies for modern web development, and work even better with TypeScript."
                    weight="black"
                  />
                </p>
                <p className="text-white/80 text-base md:text-lg leading-[1.9]">
                  <BilingualText
                    text="请访问我们的官网www.example.com或发送邮件至contact@example.com获取更多信息。Please visit our website www.example.com or email contact@example.com for more information."
                    weight="medium"
                  />
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Component Groups */}
        {groupedPlaygroundComponents.map((group, groupIndex) => (
          <div key={group.label} className="col-span-4 md:col-span-12 mb-16 md:mb-24">
            {/* Group Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="mb-10 md:mb-12 border-b border-white/10 pb-6"
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/30">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl md:text-3xl font-futura tracking-[0.1em] uppercase text-white">
                  {group.label}
                </h2>
              </div>
              <p className="font-futura text-sm md:text-base tracking-wide text-white/50 ml-10">
                {group.description}
              </p>
            </motion.div>

            {/* Components */}
            <div className="space-y-16 md:space-y-24">
              {group.components.map(([componentKey, componentConfig], componentIndex) => {
                const componentProps = {
                  ...(componentConfig.defaultProps ?? {}),
                  ...(PLAYGROUND_PROPS[componentKey] ?? {}),
                  editMode: false,
                } as never;

                return (
                  <motion.div 
                    key={componentKey} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: componentIndex * 0.1 }}
                    className="group"
                  >
                    {/* Component Label */}
                    <div className="mb-6 md:mb-8 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.25em]">
                            COMP {String(componentIndex + 1).padStart(2, "0")}
                          </span>
                          <div className="h-px w-8 bg-white/10"></div>
                        </div>
                        <h3 className="text-xl md:text-2xl font-futura tracking-wider text-white/90 group-hover:text-white transition-colors">
                          {`<${COMPONENT_DISPLAY_NAMES[componentKey] ?? componentKey} />`}
                        </h3>
                      </div>
                    </div>

                    {/* Component Preview */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-white/[0.02] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      {componentConfig.render(componentProps)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="col-span-4 md:col-span-12 mt-16 md:mt-24 pt-12 border-t border-white/10 text-center"
        >
          <p className="font-mono text-xs text-white/30 tracking-[0.2em]">
            END OF PLAYGROUND
          </p>
        </motion.div>
      </div>
    </main>
  );
}
