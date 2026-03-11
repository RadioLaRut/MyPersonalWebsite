"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import puckConfig from "@/puck/config";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";
import Typography from "@/components/common/Typography";

const EXCLUDED_COMPONENT_KEYS = new Set(["ContactFlashlight"]);
const HIDDEN_LEGACY_COMPONENT_KEYS = new Set([
  "MetadataListItem",
  "TextParagraphBlock",
  "ContactExperienceItem",
  "ContactDirectionItem",
  "WorksListEntry",
]);
const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  BreakdownHeadline: "BreakdownHeadline",
  PortfolioHeroHeader: "PortfolioHeroHeader",
};
const PLAYGROUND_GROUPS = [
  {
    label: "Headline Blocks",
    description: "所有标题与页面头图模块。",
    keys: ["HeroHeadline", "BreakdownHeadline", "PortfolioHeroHeader"],
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
    keys: ["LightingCollectionHeader", "LightingProjectCard"],
  },
  {
    label: "Page Blocks",
    description: "首页、作品流和跳转模块。",
    keys: ["HeroSection", "ProjectSection", "HomeEndcapSection", "WorksList", "NextProjectBlock"],
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
  PortfolioHeroHeader: {
    title: "ALL WORKS",
    subtitle: "ARCHIVE",
    descriptionLine1: "CURATED INDEX",
    descriptionLine2: "按灯光、技术美术与游戏设计线索组织全部项目。",
    ctaLabel: "ABOUT",
    ctaHref: "/about",
  },
  RichParagraph: {
    content: "这是一个富文本段落组件，支持中英文混排。This is a rich paragraph component supporting bilingual text. 可以用于展示项目描述、设计思路或任何需要详细说明的内容。",
  },
  ContentCard: {
    title: "CONTENT CARD TITLE",
    description: "这是一个内容卡片组件，支持图文混排和纯文本两种模式。可以切换图片左右位置，无图片时自动切换为纯文本模式。",
    imageSrc: "/images/train-station/2Day.webp",
    imagePreset: "ratio-16-9",
    imageFitMode: "x",
    tags: [{ tag: "Tag 1" }, { tag: "Tag 2" }, { tag: "Tag 3" }],
    imagePosition: "right",
  },
  TextSplitLayout: {
    heading: "SPLIT LAYOUT HEADING",
    paragraphs: [{ text: "这是文本分割布局组件。左侧展示标题和段落，右侧展示图片。适合用于需要图文并排展示的场景。" }],
    imageSrc: "/images/train-station/2Day.webp",
    imagePreset: "ratio-16-9",
    imageFitMode: "x",
    layoutVariant: "split-left",
  },
  ImagePanel: {
    src: "/images/train-station/2Day.webp",
    alt: "",
    caption: "Image Panel Caption",
    preset: "ratio-16-9",
    fitMode: "x",
    variant: "large",
  },
  ImageSlider: {
    unlitSrc: "/images/train-station/2Day.webp",
    litSrc: "/images/train-station/2Night.webp",
    alt: "Lighting Comparison",
    leftLabel: "DAY",
    rightLabel: "NIGHT",
  },
  BreakdownTriptych: {
    col1Title: "Column 1",
    col1Text: "First column content description.",
    col1Img: "/images/train-station/2Day.webp",
    col1Preset: "ratio-16-9",
    col1FitMode: "x",
    col2Title: "Column 2",
    col2Text: "Second column content description.",
    col2Img: "/images/city-2026/001.webp",
    col2Preset: "ratio-16-9",
    col2FitMode: "x",
    col3Title: "Column 3",
    col3Text: "Third column content description.",
    col3Img: "/images/city-2026/002.webp",
    col3Preset: "ratio-16-9",
    col3FitMode: "x",
  },
  ParameterGrid: {
    mediaSrc: "/images/train-station/2Day.webp",
    imagePreset: "ratio-21-9",
    imageFitMode: "x",
    isVideo: "false",
    parameters: [
      { name: "Parameter 1", value: "Value 1", description: "Description 1" },
      { name: "Parameter 2", value: "Value 2", description: "Description 2" },
      { name: "Parameter 3", value: "Value 3", description: "Description 3" },
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
    phase1Items: [],
    phase2Label: "PHASE 02 / SYSTEM ARCHITECTURE",
    phase2Title: "Architecture",
    phase2Subtitle: "Phase 2 Subtitle",
    phase2Content: "Solution structure and implementation approach.",
    phase2Items: [],
    phase3Label: "PHASE 03 / EXECUTION & RESULTS",
    phase3Title: "Execution",
    phase3Subtitle: "Phase 3 Subtitle",
    phase3Content: "Results and lessons learned.",
    phase3ImageSrc: "/images/train-station/2Day.webp",
    phase3ImagePreset: "ratio-16-9",
    phase3ImageFitMode: "x",
  },
  HeroSection: {
    eyebrow: "LIGHTING / TECH ART / GAME DESIGN",
    title: "JIANG CHENGYAN",
    subtitle: "Lighting-first portfolio",
    description: "以灯光建立氛围与引导，再把技术美术、游戏设计和叙事系统组织成完整体验。",
    primaryCtaLabel: "ENTER LIGHTING",
    primaryCtaHref: "/works/lighting-portfolio",
    secondaryCtaLabel: "ABOUT",
    secondaryCtaHref: "/about",
    imageSrc: "/images/covers/2026/ShotForCrewWithoutWord.0004.webp",
    imageAlt: "Hero Background",
    imagePreset: "ratio-21-9",
    imageFitMode: "x",
  },
  ProjectSection: {
    title: "PENGUIN TRADING CO.",
    subtitle: "Lead Designer / PM / Tech Art",
    imageSrc: CANONICAL_PLACEHOLDER_PATH,
    imagePreset: "ratio-16-9",
    imageFitMode: "x",
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
          imagePreset: "ratio-21-9",
          imageFitMode: "x",
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
          imagePreset: "ratio-21-9",
          imageFitMode: "x",
          desc: "Simulation management game with asset lock systems",
        },
      },
    ],
  },
  NextProjectBlock: {
    nextId: "insight",
    nextName: "INSIGHT",
    nextBg: "/images/insight/InsightOnlyCover.webp",
    imagePreset: "ratio-21-9",
    imageFitMode: "x",
  },
  LightingCollectionHeader: {
    title: "CITY ADD",
    number: "01",
    description: "围绕城市氛围、镜头构图与照明节奏展开的灯光练习集合。",
    backHref: "/works/lighting-portfolio",
  },
  LightingProjectCard: {
    number: "01",
    title: "CITY AFTER RAIN",
    coverImage: "/images/city-2026/002.webp",
    href: "/works/lighting-portfolio/collection-1",
    imagePreset: "ratio-21-9",
    imageFitMode: "cover",
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
        <div className="col-start-2 col-span-10 mb-16 lg:mb-24">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-4 mb-10 lg:mb-12"
            >
              <Typography
                as="span"
                preset="sans-body"
                size="label"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted transition-colors duration-300 group-hover:text-white"
              >
                ← 返回首页
              </Typography>
            </Link>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 lg:mb-8"
          >
            <Typography
              as="span"
              preset="luna-editorial"
              size="display"
              weight="display"
              wrapPolicy="heading"
              className="text-white"
            >
              PLAYGROUND
            </Typography>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <Typography
              as="p"
              preset="sans-body"
              size="body"
              weight="regular"
              wrapPolicy="prose"
              className="max-w-2xl text-textMuted"
            >
              组件预览与交互测试空间。展示 Puck 中全部常规组件，用于统一预览布局与交互效果。
            </Typography>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="col-span-12 border-b border-white/15 mb-16 lg:mb-20 origin-left"
        />

        <div className="col-span-12 mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-4 border border-white/10 bg-white/[0.02] p-6">
              <Typography
                as="span"
                preset="sans-body"
                size="caption"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted"
              >
                INTERNAL TOOL
              </Typography>
              <Typography
                as="h2"
                preset="luna-editorial"
                size="title-sm"
                weight="strong"
                wrapPolicy="heading"
                className="mt-4 text-white"
              >
                Font Lab
              </Typography>
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="regular"
                wrapPolicy="prose"
                className="mt-4 text-textMuted"
              >
                独立字体实验室。用于实时校准 preset、size、baseline、tracking、wrap policy 与真实组件预览。
              </Typography>
              <Link
                href="/playground/font-lab"
                className="mt-8 inline-flex items-center gap-3 border border-white/12 px-4 py-3 text-textPrimary transition-colors duration-300 hover:border-white/25 hover:text-white"
              >
                <Typography
                  as="span"
                  preset="sans-body"
                  size="caption"
                  weight="medium"
                  wrapPolicy="label"
                  className="text-current"
                >
                  ENTER FONT LAB
                </Typography>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Typography Mixed Script Showcase */}
        <div className="col-span-12 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-10 lg:mb-12 border-b border-white/10 pb-6"
          >
            <div className="flex items-baseline gap-4 mb-3">
              <Typography
                as="span"
                preset="sans-body"
                size="label"
                weight="medium"
                wrapPolicy="label"
                className="text-textMuted"
              >
                00
              </Typography>
              <Typography
                as="h2"
                preset="sans-body"
                size="title-sm"
                weight="strong"
                wrapPolicy="label"
                className="text-white"
              >
                Typography Mixed Script
              </Typography>
            </div>
            <Typography
              as="p"
              preset="sans-body"
              size="body-sm"
              weight="regular"
              wrapPolicy="prose"
              className="ml-10 text-textMuted"
            >
              `Typography` 已接管中英文混排、字重映射、换行与基线补偿；这里保留一组高密度样本用于校验。
            </Typography>
          </motion.div>

          <div className="space-y-12">
            {/* Weight Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <Typography as="h3" preset="sans-body" size="body-lg" weight="strong" wrapPolicy="heading" className="mb-6 text-textPrimary">
                三种字重对比
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Typography as="span" preset="sans-body" size="caption" weight="medium" wrapPolicy="label" className="text-textMuted">light</Typography>
                  <Typography as="p" preset="sans-body" size="body-lg" weight="light" wrapPolicy="prose" className="text-textPrimary">
                    中文轻量字重 / Light English Weight
                  </Typography>
                </div>
                <div className="space-y-3">
                  <Typography as="span" preset="sans-body" size="caption" weight="medium" wrapPolicy="label" className="text-textMuted">medium</Typography>
                  <Typography as="p" preset="sans-body" size="body-lg" weight="medium" wrapPolicy="prose" className="text-textPrimary">
                    中文中等字重 / Medium English Weight
                  </Typography>
                </div>
                <div className="space-y-3">
                  <Typography as="span" preset="sans-body" size="caption" weight="medium" wrapPolicy="label" className="text-textMuted">display</Typography>
                  <Typography as="p" preset="sans-body" size="body-lg" weight="display" wrapPolicy="prose" className="text-textPrimary">
                    中文粗黑字重 / Display English Weight
                  </Typography>
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
              <Typography as="h3" preset="sans-body" size="body-lg" weight="strong" wrapPolicy="heading" className="mb-6 text-textPrimary">
                中英文混排效果
              </Typography>
              <div className="bg-white/[0.02] rounded-lg p-6 md:p-8 space-y-6">
                <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="prose" className="text-textPrimary">
                  这是一个 Typography 组件示例，展示中英文混排效果。This is a demo showing Chinese and English mixed text rendering with proper weight and baseline alignment.
                </Typography>
                <Typography as="p" preset="sans-body" size="body-sm" weight="light" wrapPolicy="prose" className="text-textMuted">
                  组件会自动检测文本中的中英文内容，并分别应用不同的字体和字重。The component automatically detects Chinese and English text, applying appropriate fonts and weights.
                </Typography>
              </div>
            </motion.div>

            {/* More Mixed Examples */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography as="h3" preset="sans-body" size="body-lg" weight="strong" wrapPolicy="heading" className="mb-6 text-textPrimary">
                更多混排示例
              </Typography>
              <div className="bg-white/[0.02] rounded-lg p-6 md:p-8 space-y-6">
                <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="prose" className="text-textPrimary">
                  在 Unreal Engine 5 中，我们使用 Lumen 全局光照系统来实现真实的光影效果。In Unreal Engine 5, we use the Lumen global illumination system to achieve realistic lighting effects.
                </Typography>
                <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="url" className="text-textPrimary">
                  本项目的 GitHub 仓库地址是 github.com/example/project，欢迎提交 Issue 和 PR。The GitHub repository for this project is github.com/example/project, welcome to submit Issues and PRs.
                </Typography>
                <Typography as="p" preset="sans-body" size="body-sm" weight="light" wrapPolicy="prose" className="text-textMuted">
                  版本号 v2.1.0 已于 2024 年 1 月 15 日发布，包含 15 个新功能和 23 个 Bug 修复。Version v2.1.0 was released on January 15, 2024, including 15 new features and 23 bug fixes.
                </Typography>
                <Typography as="p" preset="sans-body" size="body-lg" weight="display" wrapPolicy="prose" className="text-textPrimary">
                  CSS3 和 HTML5 是现代 Web 开发的基础技术，配合 TypeScript 使用效果更佳。CSS3 and HTML5 are fundamental technologies for modern web development, and work even better with TypeScript.
                </Typography>
                <Typography as="p" preset="sans-body" size="body" weight="medium" wrapPolicy="url" className="text-textPrimary">
                  请访问我们的官网 www.example.com 或发送邮件至 contact@example.com 获取更多信息。Please visit our website www.example.com or email contact@example.com for more information.
                </Typography>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Component Groups */}
        {groupedPlaygroundComponents.map((group, groupIndex) => (
          <div key={group.label} className="col-span-12 mb-16 lg:mb-24">
            {/* Group Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            className="mb-10 lg:mb-12 border-b border-white/10 pb-6"
          >
            <div className="flex items-baseline gap-4 mb-3">
                <Typography
                  as="span"
                  preset="sans-body"
                  size="label"
                  weight="medium"
                  wrapPolicy="label"
                  className="text-textMuted"
                >
                  {String(groupIndex + 1).padStart(2, "0")}
                </Typography>
                <Typography
                  as="h2"
                  preset="sans-body"
                  size="title-sm"
                  weight="strong"
                  wrapPolicy="label"
                  className="text-white"
                >
                  {group.label}
                </Typography>
              </div>
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="regular"
                wrapPolicy="prose"
                className="ml-10 text-textMuted"
              >
                {group.description}
              </Typography>
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
                    <div className="mb-6 lg:mb-8 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="medium"
                            wrapPolicy="label"
                            className="text-textMuted"
                          >
                            COMP {String(componentIndex + 1).padStart(2, "0")}
                          </Typography>
                          <div className="h-px w-8 bg-white/10"></div>
                        </div>
                        <Typography
                          as="h3"
                          preset="sans-body"
                          size="body-lg"
                          weight="strong"
                          wrapPolicy="heading"
                          className="text-textPrimary group-hover:text-white transition-colors"
                        >
                          {`<${COMPONENT_DISPLAY_NAMES[componentKey] ?? componentKey} />`}
                        </Typography>
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
          className="col-span-12 mt-16 lg:mt-24 pt-12 border-t border-white/10 text-center"
        >
          <Typography
            as="p"
            preset="sans-body"
            size="caption"
            weight="medium"
            wrapPolicy="label"
            className="text-textMuted"
          >
            END OF PLAYGROUND
          </Typography>
        </motion.div>
      </div>
    </main>
  );
}
