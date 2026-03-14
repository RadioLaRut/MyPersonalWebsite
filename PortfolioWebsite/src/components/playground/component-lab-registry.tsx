"use client";

import type { ReactNode } from "react";

import HeroHeadlineBlock from "@/components/common/HeroHeadlineBlock";
import RichParagraphBlock from "@/components/common/RichParagraphBlock";
import ContentCard from "@/components/breakdowns/ContentCard";
import TextSplitLayout from "@/components/breakdowns/TextSplitLayout";
import HighDensityInfoBlock from "@/components/breakdowns/HighDensityInfoBlock";
import StatementBlock from "@/components/transitions/StatementBlock";
import ImagePanel from "@/components/breakdowns/ImagePanel";
import ImageSlider from "@/components/breakdowns/ImageSlider";
import BreakdownSectionHeadline from "@/components/breakdowns/BreakdownHeadline";
import BreakdownTriptych from "@/components/breakdowns/BreakdownTriptych";
import ParameterGrid from "@/components/breakdowns/ParameterGrid";
import ProjectSection from "@/components/home/ProjectSection";
import HeroSection from "@/components/home/HeroSection";
import HomeEndcapSection from "@/components/home/HomeEndcapSection";
import PortfolioHeroHeader from "@/components/works/PortfolioHeroHeader";
import LightingCollectionHeader from "@/components/works/LightingCollectionHeader";
import LightingProjectCard from "@/components/works/LightingProjectCard";
import WorksList from "@/components/works/WorksList";
import WorksListEntry from "@/components/works/WorksListEntry";
import NextProjectBlock from "@/components/blocks/NextProjectBlock";
import ContactFlashlightBlock from "@/components/blocks/ContactFlashlightBlock";
import {
  COMPONENT_DESIGN_COMPONENT_KEYS,
  COMPONENT_DESIGN_PARAMETER_ITEM_SPANS,
  COMPONENT_DESIGN_PARAMETER_ITEM_SPAN_LABELS,
  COMPONENT_DESIGN_SECTION_SPACING_LABELS,
  COMPONENT_DESIGN_SECTION_SPACING_TOKENS,
  COMPONENT_DESIGN_SPACING_LABELS,
  COMPONENT_DESIGN_SPACING_TOKENS,
  type ComponentDesignComponentKey,
  type ComponentDesignDocument,
  type ComponentDesignParameterItemSpan,
  type ComponentGridBounds,
  type ComponentResponsiveGridBounds,
} from "@/lib/component-design-schema";
import { type TypographySize } from "@/lib/typography-tokens";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";

export type PreviewVariantKey = "stress" | "standard";

type SelectOption<TValue extends string | number> = {
  label: string;
  value: TValue;
};

export type ComponentLabFieldConfig =
  | {
    type: "bounds";
    label: string;
    getValue: (document: ComponentDesignDocument) => ComponentGridBounds;
    setValue: (
      document: ComponentDesignDocument,
      value: ComponentGridBounds,
    ) => void;
  }
  | {
    type: "responsive-bounds";
    label: string;
    getValue: (
      document: ComponentDesignDocument,
    ) => ComponentResponsiveGridBounds;
    setValue: (
      document: ComponentDesignDocument,
      value: ComponentResponsiveGridBounds,
    ) => void;
  }
  | {
    type: "select";
    label: string;
    options: Array<SelectOption<string>>;
    getValue: (document: ComponentDesignDocument) => string;
    setValue: (document: ComponentDesignDocument, value: string) => void;
  }
  | {
    type: "number-select";
    label: string;
    options: Array<SelectOption<number>>;
    getValue: (document: ComponentDesignDocument) => number;
    setValue: (document: ComponentDesignDocument, value: number) => void;
  }
  | {
    type: "toggle";
    label: string;
    getValue: (document: ComponentDesignDocument) => boolean;
    setValue: (document: ComponentDesignDocument, value: boolean) => void;
  };

export type ComponentLabSectionConfig = {
  fields: ComponentLabFieldConfig[];
  title: string;
};

export type ComponentLabDefinition = {
  description: string;
  key: ComponentDesignComponentKey;
  label: string;
  renderPreview: (variant: PreviewVariantKey) => ReactNode;
  sections: ComponentLabSectionConfig[];
};

const BODY_SIZE_OPTIONS: TypographySize[] = ["body-sm", "body", "body-lg"];
const TITLE_SIZE_OPTIONS: TypographySize[] = ["title-sm", "title", "display"];
const STACK_HEADING_OPTIONS: TypographySize[] = ["title", "display", "hero"];

function createTypographyOptions(
  values: TypographySize[],
): Array<SelectOption<string>> {
  return values.map((value) => ({
    label: value,
    value,
  }));
}

const SPACING_OPTIONS = COMPONENT_DESIGN_SPACING_TOKENS.map((token) => ({
  label: COMPONENT_DESIGN_SPACING_LABELS[token],
  value: token,
}));

const SECTION_SPACING_OPTIONS = COMPONENT_DESIGN_SECTION_SPACING_TOKENS.map(
  (token) => ({
    label: COMPONENT_DESIGN_SECTION_SPACING_LABELS[token],
    value: token,
  }),
);

const ITEM_SPAN_OPTIONS = COMPONENT_DESIGN_PARAMETER_ITEM_SPANS.map((value) => ({
  label: COMPONENT_DESIGN_PARAMETER_ITEM_SPAN_LABELS[value],
  value,
}));

export const COMPONENT_LAB_COMPONENT_KEYS = COMPONENT_DESIGN_COMPONENT_KEYS;

export const COMPONENT_LAB_REGISTRY: Record<
  ComponentDesignComponentKey,
  ComponentLabDefinition
> = {
  HeroSection: {
    key: "HeroSection",
    label: "HeroSection",
    description: "首页首屏模块，重点看标题区与说明区在移动端和桌面端的相对落点。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "主标题区边界",
            getValue: (document) => document.components.HeroSection.titleBounds,
            setValue: (document, value) => {
              document.components.HeroSection.titleBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "右侧说明区边界",
            getValue: (document) => document.components.HeroSection.descriptionBounds,
            setValue: (document, value) => {
              document.components.HeroSection.descriptionBounds = value;
            },
          },
        ],
      },
      {
        title: "节奏",
        fields: [
          {
            type: "select",
            label: "CTA 上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HeroSection.ctaTopSpacing,
            setValue: (document, value) => {
              document.components.HeroSection.ctaTopSpacing =
                value as ComponentDesignDocument["components"]["HeroSection"]["ctaTopSpacing"];
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <HeroSection
        eyebrow={
          variant === "stress"
            ? "LIGHTING / TECH ART / SYSTEM DESIGN / INTERACTIVE NARRATIVE"
            : "LIGHTING / TECH ART / GAME DESIGN"
        }
        title={variant === "stress" ? "JIANG CHENGYAN / PORTFOLIO SYSTEM" : "JIANG CHENGYAN"}
        subtitle={variant === "stress" ? "SELECTED WORKS 2026" : "MY 2026 PORTFOLIO"}
        description={
          variant === "stress"
            ? "以灯光建立氛围，再把技术美术、叙事系统和交互结构组织成完整体验。这个极端样本会故意拉长说明文字，帮助观察右栏是否开始拥挤或漂移。"
            : "以灯光建立氛围与引导，再把技术美术、游戏设计和叙事系统组织成完整体验。"
        }
        primaryCtaLabel="ENTER LIGHTING"
        primaryCtaHref="/works/lighting-portfolio"
        secondaryCtaLabel="ABOUT"
        secondaryCtaHref="/about"
        imageSrc="/images/covers/2026/ShotForCrewWithoutWord.0004.webp"
        imageAlt="Hero Background"
        imagePreset="ratio-21-9"
        imageFitMode="x"
        editMode
      />
    ),
  },
  HeroHeadline: {
    key: "HeroHeadline",
    label: "HeroHeadline",
    description: "作品分解页头图模块，重点看主体文案相对画面的落位。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "bounds",
            label: "内容区边界",
            getValue: (document) => document.components.HeroHeadline.contentBounds,
            setValue: (document, value) => {
              document.components.HeroHeadline.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <HeroHeadlineBlock
        eyebrow={variant === "stress" ? "SYSTEM BREAKDOWN" : "BREAKDOWN"}
        title={variant === "stress" ? "PROJECT TITLE / LONG CASE STUDY HEADER" : "PROJECT TITLE"}
        subtitle={
          variant === "stress"
            ? "这是更长的头图摘要，用来观察标题、摘要和跳转按钮在长文本下是否仍能稳定落在同一内容区内。"
            : "这是一个项目分解页面的标题组件，用于展示项目主要信息和跳转链接。"
        }
        heroImage="/images/train-station/2Day.webp"
        heroImagePreset="ratio-21-9"
        heroImageFitMode="x"
        navLink="https://www.bilibili.com"
        editMode
      />
    ),
  },
  PortfolioHeroHeader: {
    key: "PortfolioHeroHeader",
    label: "PortfolioHeroHeader",
    description: "作品索引页头部，重点看主标题与侧边说明的断点关系。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "标题区边界",
            getValue: (document) => document.components.PortfolioHeroHeader.titleBounds,
            setValue: (document, value) => {
              document.components.PortfolioHeroHeader.titleBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "侧边说明区边界",
            getValue: (document) => document.components.PortfolioHeroHeader.sideBounds,
            setValue: (document, value) => {
              document.components.PortfolioHeroHeader.sideBounds = value;
            },
          },
          {
            type: "bounds",
            label: "单栏模式边界",
            getValue: (document) => document.components.PortfolioHeroHeader.singleColumnBounds,
            setValue: (document, value) => {
              document.components.PortfolioHeroHeader.singleColumnBounds = value;
            },
          },
        ],
      },
      {
        title: "节奏",
        fields: [
          {
            type: "select",
            label: "描述第二行上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.PortfolioHeroHeader.descriptionTopSpacing,
            setValue: (document, value) => {
              document.components.PortfolioHeroHeader.descriptionTopSpacing =
                value as ComponentDesignDocument["components"]["PortfolioHeroHeader"]["descriptionTopSpacing"];
            },
          },
          {
            type: "select",
            label: "CTA 上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.PortfolioHeroHeader.ctaTopSpacing,
            setValue: (document, value) => {
              document.components.PortfolioHeroHeader.ctaTopSpacing =
                value as ComponentDesignDocument["components"]["PortfolioHeroHeader"]["ctaTopSpacing"];
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <PortfolioHeroHeader
        title={variant === "stress" ? "ALL WORKS / SYSTEM INDEX" : "ALL WORKS"}
        subtitle={variant === "stress" ? "CURATED ARCHIVE" : "ARCHIVE"}
        descriptionLine1={variant === "stress" ? "CURATED INDEX" : undefined}
        descriptionLine2={
          variant === "stress"
            ? "按灯光、技术美术、游戏设计与系统叙事线索组织全部项目，用更长文案观察右栏是否开始挤压主标题。"
            : undefined
        }
        ctaLabel={variant === "stress" ? "ABOUT" : undefined}
        ctaHref={variant === "stress" ? "/about" : undefined}
        editMode
      />
    ),
  },
  LightingCollectionHeader: {
    key: "LightingCollectionHeader",
    label: "LightingCollectionHeader",
    description: "灯光集合页头，重点看标题区与右侧摘要的相对位置。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "标题区边界",
            getValue: (document) => document.components.LightingCollectionHeader.titleBounds,
            setValue: (document, value) => {
              document.components.LightingCollectionHeader.titleBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "摘要区边界",
            getValue: (document) => document.components.LightingCollectionHeader.descriptionBounds,
            setValue: (document, value) => {
              document.components.LightingCollectionHeader.descriptionBounds = value;
            },
          },
        ],
      },
      {
        title: "节奏",
        fields: [
          {
            type: "select",
            label: "集合编号与标题间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.LightingCollectionHeader.titleTopSpacing,
            setValue: (document, value) => {
              document.components.LightingCollectionHeader.titleTopSpacing =
                value as ComponentDesignDocument["components"]["LightingCollectionHeader"]["titleTopSpacing"];
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <LightingCollectionHeader
        title={variant === "stress" ? "CITY AFTER RAIN / LONG STUDY NAME" : "CITY AFTER RAIN"}
        number="01"
        description={
          variant === "stress"
            ? "围绕城市氛围、镜头构图与照明节奏展开的长摘要样本，用来观察右侧说明列的极限宽度。"
            : "围绕城市氛围、镜头构图与照明节奏展开的灯光练习集合。"
        }
        backHref="/works/lighting-portfolio"
        editMode
      />
    ),
  },
  LightingProjectCard: {
    key: "LightingProjectCard",
    label: "LightingProjectCard",
    description: "灯光集合卡片，重点看卡片在主网格中的宽度。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "bounds",
            label: "卡片边界",
            getValue: (document) => document.components.LightingProjectCard.contentBounds,
            setValue: (document, value) => {
              document.components.LightingProjectCard.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <LightingProjectCard
        number="01"
        title={variant === "stress" ? "CITY AFTER RAIN / LONGER COLLECTION TITLE" : "CITY AFTER RAIN"}
        coverImage="/images/city-2026/002.webp"
        href="/works/lighting-portfolio/collection-1"
        imagePreset="ratio-21-9"
        imageFitMode="cover"
        editMode
      />
    ),
  },
  StatementBlock: {
    key: "StatementBlock",
    label: "StatementBlock",
    description: "过渡段落模块，重点看窄内容区与长句时的稳定性。",
    sections: [
      {
        title: "文本与换行",
        fields: [
          {
            type: "select",
            label: "正文字号",
            options: createTypographyOptions(BODY_SIZE_OPTIONS),
            getValue: (document) => document.components.StatementBlock.bodySize,
            setValue: (document, value) => {
              document.components.StatementBlock.bodySize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "正文自动换行",
            getValue: (document) => document.components.StatementBlock.bodyAutoWrap,
            setValue: (document, value) => {
              document.components.StatementBlock.bodyAutoWrap = value;
            },
          },
        ],
      },
      {
        title: "布局",
        fields: [
          {
            type: "bounds",
            label: "内容区边界",
            getValue: (document) => document.components.StatementBlock.contentBounds,
            setValue: (document, value) => {
              document.components.StatementBlock.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <StatementBlock
        content={
          variant === "stress"
            ? "凌晨四点的工业园区不会为排版让路。长句、英文名词和信息密度会同时压进这条过渡语句，只有当它仍然稳住中心线，组件才算真正成立。"
            : "We blur the lines between virtual and reality."
        }
        align="center"
        backgroundColor="black"
        minHeight="medium"
        editMode
      />
    ),
  },
  RichParagraph: {
    key: "RichParagraph",
    label: "RichParagraph",
    description: "长段落正文组件，重点看正文档位与内容宽度。",
    sections: [
      {
        title: "文本与换行",
        fields: [
          {
            type: "select",
            label: "正文字号",
            options: createTypographyOptions(BODY_SIZE_OPTIONS),
            getValue: (document) => document.components.RichParagraph.bodySize,
            setValue: (document, value) => {
              document.components.RichParagraph.bodySize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "正文自动换行",
            getValue: (document) => document.components.RichParagraph.bodyAutoWrap,
            setValue: (document, value) => {
              document.components.RichParagraph.bodyAutoWrap = value;
            },
          },
        ],
      },
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.RichParagraph.sectionSpacing,
            setValue: (document, value) => {
              document.components.RichParagraph.sectionSpacing =
                value as ComponentDesignDocument["components"]["RichParagraph"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "内容区边界",
            getValue: (document) => document.components.RichParagraph.contentBounds,
            setValue: (document, value) => {
              document.components.RichParagraph.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <RichParagraphBlock
        content={
          variant === "stress"
            ? "凌晨四点的工业园区不会给排版留多少容错空间。Typography 必须同时承受中文、English、版本号 build-2026.03.13、长文件名与多重语义切换。只有当大段正文在极长句、长英文词和中英混排下仍然保持稳定左边缘、均匀阅读节奏和清晰层级时，这个组件的正文档位与边界才算真正成立。"
            : "这是一个用于检验正文档位和内容宽度的标准样本。它需要在 Futura 与汉仪旗黑的混排中保持稳定阅读节奏，同时又不能因为内容区过宽而失去密度。"
        }
      />
    ),
  },
  ContentCard: {
    key: "ContentCard",
    label: "ContentCard",
    description: "图文叙事卡片，重点看标题层级、正文组间距和图文边界。",
    sections: [
      {
        title: "文本与换行",
        fields: [
          {
            type: "select",
            label: "标题字号",
            options: createTypographyOptions(TITLE_SIZE_OPTIONS),
            getValue: (document) => document.components.ContentCard.titleSize,
            setValue: (document, value) => {
              document.components.ContentCard.titleSize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "标题自动换行",
            getValue: (document) => document.components.ContentCard.titleAutoWrap,
            setValue: (document, value) => {
              document.components.ContentCard.titleAutoWrap = value;
            },
          },
          {
            type: "select",
            label: "正文字号",
            options: createTypographyOptions(BODY_SIZE_OPTIONS),
            getValue: (document) => document.components.ContentCard.bodySize,
            setValue: (document, value) => {
              document.components.ContentCard.bodySize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "正文自动换行",
            getValue: (document) => document.components.ContentCard.bodyAutoWrap,
            setValue: (document, value) => {
              document.components.ContentCard.bodyAutoWrap = value;
            },
          },
        ],
      },
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "标题与正文间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ContentCard.titleBodyGap,
            setValue: (document, value) => {
              document.components.ContentCard.titleBodyGap =
                value as ComponentDesignDocument["components"]["ContentCard"]["titleBodyGap"];
            },
          },
          {
            type: "select",
            label: "段落组间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ContentCard.paragraphGap,
            setValue: (document, value) => {
              document.components.ContentCard.paragraphGap =
                value as ComponentDesignDocument["components"]["ContentCard"]["paragraphGap"];
            },
          },
          {
            type: "select",
            label: "图片区进入距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ContentCard.mobileMediaTopSpacing,
            setValue: (document, value) => {
              document.components.ContentCard.mobileMediaTopSpacing =
                value as ComponentDesignDocument["components"]["ContentCard"]["mobileMediaTopSpacing"];
            },
          },
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.ContentCard.sectionSpacing,
            setValue: (document, value) => {
              document.components.ContentCard.sectionSpacing =
                value as ComponentDesignDocument["components"]["ContentCard"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "纯文本边界",
            getValue: (document) => document.components.ContentCard.textOnlyBounds,
            setValue: (document, value) => {
              document.components.ContentCard.textOnlyBounds = value;
            },
          },
          {
            type: "bounds",
            label: "图片左侧 / 图片边界",
            getValue: (document) => document.components.ContentCard.imageLeftMediaBounds,
            setValue: (document, value) => {
              document.components.ContentCard.imageLeftMediaBounds = value;
            },
          },
          {
            type: "bounds",
            label: "图片左侧 / 文本边界",
            getValue: (document) => document.components.ContentCard.imageLeftTextBounds,
            setValue: (document, value) => {
              document.components.ContentCard.imageLeftTextBounds = value;
            },
          },
          {
            type: "bounds",
            label: "图片右侧 / 文本边界",
            getValue: (document) => document.components.ContentCard.imageRightTextBounds,
            setValue: (document, value) => {
              document.components.ContentCard.imageRightTextBounds = value;
            },
          },
          {
            type: "bounds",
            label: "图片右侧 / 图片边界",
            getValue: (document) => document.components.ContentCard.imageRightMediaBounds,
            setValue: (document, value) => {
              document.components.ContentCard.imageRightMediaBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ContentCard
        title={variant === "stress" ? "LAYOUT SYSTEM / 组件共享排版校准" : "CONTENT CARD TITLE"}
        description={
          variant === "stress"
            ? "第一段用于观察标题与正文的关系。\n\n第二段用于观察多段内容时的组间距是否还能保持稳定。\n\nThird paragraph checks bilingual rhythm under a dense editorial layout."
            : "这是一个用于观察纯文本分支边界的标准样本。没有图片区时，标题、正文宽度与段落组间距应该能直接在 Lab 里校准。"
        }
        imageSrc={variant === "stress" ? "/images/train-station/2Day.webp" : undefined}
        imagePreset="ratio-16-9"
        imageFitMode="x"
        imagePosition={variant === "stress" ? "left" : "right"}
      />
    ),
  },
  TextSplitLayout: {
    key: "TextSplitLayout",
    label: "TextSplitLayout",
    description: "标题、正文、图片组合组件，重点看左右落点和段落堆叠节奏。",
    sections: [
      {
        title: "文本与换行",
        fields: [
          {
            type: "select",
            label: "分栏标题字号",
            options: createTypographyOptions(TITLE_SIZE_OPTIONS),
            getValue: (document) => document.components.TextSplitLayout.splitHeadingSize,
            setValue: (document, value) => {
              document.components.TextSplitLayout.splitHeadingSize =
                value as TypographySize;
            },
          },
          {
            type: "select",
            label: "堆叠标题字号",
            options: createTypographyOptions(STACK_HEADING_OPTIONS),
            getValue: (document) => document.components.TextSplitLayout.stackHeadingSize,
            setValue: (document, value) => {
              document.components.TextSplitLayout.stackHeadingSize =
                value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "标题自动换行",
            getValue: (document) => document.components.TextSplitLayout.headingAutoWrap,
            setValue: (document, value) => {
              document.components.TextSplitLayout.headingAutoWrap = value;
            },
          },
          {
            type: "select",
            label: "正文字号",
            options: createTypographyOptions(BODY_SIZE_OPTIONS),
            getValue: (document) => document.components.TextSplitLayout.bodySize,
            setValue: (document, value) => {
              document.components.TextSplitLayout.bodySize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "正文自动换行",
            getValue: (document) => document.components.TextSplitLayout.bodyAutoWrap,
            setValue: (document, value) => {
              document.components.TextSplitLayout.bodyAutoWrap = value;
            },
          },
        ],
      },
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "段落组间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.TextSplitLayout.paragraphGap,
            setValue: (document, value) => {
              document.components.TextSplitLayout.paragraphGap =
                value as ComponentDesignDocument["components"]["TextSplitLayout"]["paragraphGap"];
            },
          },
          {
            type: "select",
            label: "分栏错位距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.TextSplitLayout.headingImageGap,
            setValue: (document, value) => {
              document.components.TextSplitLayout.headingImageGap =
                value as ComponentDesignDocument["components"]["TextSplitLayout"]["headingImageGap"];
            },
          },
          {
            type: "select",
            label: "堆叠文本进入距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.TextSplitLayout.stackTextTopSpacing,
            setValue: (document, value) => {
              document.components.TextSplitLayout.stackTextTopSpacing =
                value as ComponentDesignDocument["components"]["TextSplitLayout"]["stackTextTopSpacing"];
            },
          },
          {
            type: "select",
            label: "堆叠图片区进入距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.TextSplitLayout.stackImageTopSpacing,
            setValue: (document, value) => {
              document.components.TextSplitLayout.stackImageTopSpacing =
                value as ComponentDesignDocument["components"]["TextSplitLayout"]["stackImageTopSpacing"];
            },
          },
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.TextSplitLayout.sectionSpacing,
            setValue: (document, value) => {
              document.components.TextSplitLayout.sectionSpacing =
                value as ComponentDesignDocument["components"]["TextSplitLayout"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "左分栏 / 标题边界",
            getValue: (document) => document.components.TextSplitLayout.splitLeftHeadingBounds,
            setValue: (document, value) => {
              document.components.TextSplitLayout.splitLeftHeadingBounds = value;
            },
          },
          {
            type: "bounds",
            label: "左分栏 / 正文边界",
            getValue: (document) => document.components.TextSplitLayout.splitLeftTextBounds,
            setValue: (document, value) => {
              document.components.TextSplitLayout.splitLeftTextBounds = value;
            },
          },
          {
            type: "bounds",
            label: "右分栏 / 正文边界",
            getValue: (document) => document.components.TextSplitLayout.splitRightTextBounds,
            setValue: (document, value) => {
              document.components.TextSplitLayout.splitRightTextBounds = value;
            },
          },
          {
            type: "bounds",
            label: "右分栏 / 标题边界",
            getValue: (document) => document.components.TextSplitLayout.splitRightHeadingBounds,
            setValue: (document, value) => {
              document.components.TextSplitLayout.splitRightHeadingBounds = value;
            },
          },
          {
            type: "bounds",
            label: "堆叠居中边界",
            getValue: (document) => document.components.TextSplitLayout.stackBounds,
            setValue: (document, value) => {
              document.components.TextSplitLayout.stackBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <TextSplitLayout
        heading={variant === "stress" ? "SYSTEM BREAKDOWN / COMPONENT DESIGN" : "SPLIT LAYOUT HEADING"}
        paragraphs={
          variant === "stress"
            ? [
              "第一段观察极长标题下正文区域是否还保有足够的呼吸感。",
              "第二段观察多段叙述时，右侧文本列是不是开始变得过碎，或者边界已经侵蚀到图片舞台。",
              "Third paragraph is intentionally longer so the lab can expose whether the current paragraph stack is still controlled.",
            ]
            : [
              "这是标准图文分栏样本，用于观察标题、正文和图片是否仍然共享同一套栅格边界。",
              "如果正文列过宽或标题区太窄，这里会很快暴露问题。",
            ]
        }
        imageSrc={variant === "stress" ? "/images/train-station/2Night.webp" : "/images/train-station/2Day.webp"}
        imagePreset="ratio-16-9"
        imageFitMode="x"
        layoutVariant={variant === "stress" ? "stack" : "split-left"}
      />
    ),
  },
  HighDensityInfoBlock: {
    key: "HighDensityInfoBlock",
    label: "HighDensityInfoBlock",
    description: "三列高密度信息块，重点看列边界、标题堆叠和 metadata 节奏。",
    sections: [
      {
        title: "文本与换行",
        fields: [
          {
            type: "select",
            label: "阶段标题字号",
            options: createTypographyOptions(TITLE_SIZE_OPTIONS),
            getValue: (document) => document.components.HighDensityInfoBlock.titleSize,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.titleSize =
                value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "标题自动换行",
            getValue: (document) => document.components.HighDensityInfoBlock.titleAutoWrap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.titleAutoWrap = value;
            },
          },
          {
            type: "toggle",
            label: "副标题自动换行",
            getValue: (document) => document.components.HighDensityInfoBlock.subtitleAutoWrap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.subtitleAutoWrap = value;
            },
          },
          {
            type: "select",
            label: "正文字号",
            options: createTypographyOptions(BODY_SIZE_OPTIONS),
            getValue: (document) => document.components.HighDensityInfoBlock.bodySize,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.bodySize = value as TypographySize;
            },
          },
          {
            type: "toggle",
            label: "正文自动换行",
            getValue: (document) => document.components.HighDensityInfoBlock.bodyAutoWrap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.bodyAutoWrap = value;
            },
          },
        ],
      },
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "标题下间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.phaseTitleGap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.phaseTitleGap =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["phaseTitleGap"];
            },
          },
          {
            type: "select",
            label: "副标题下间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.subtitleGap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.subtitleGap =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["subtitleGap"];
            },
          },
          {
            type: "select",
            label: "正文后间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.titleBodyGap,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.titleBodyGap =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["titleBodyGap"];
            },
          },
          {
            type: "select",
            label: "Metadata 进入距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.itemsTopSpacing,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.itemsTopSpacing =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["itemsTopSpacing"];
            },
          },
          {
            type: "select",
            label: "图片区进入距离",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.imageTopSpacing,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.imageTopSpacing =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["imageTopSpacing"];
            },
          },
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.HighDensityInfoBlock.sectionSpacing,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.sectionSpacing =
                value as ComponentDesignDocument["components"]["HighDensityInfoBlock"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "第一列边界",
            getValue: (document) => document.components.HighDensityInfoBlock.leftBounds,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.leftBounds = value;
            },
          },
          {
            type: "bounds",
            label: "第二列边界",
            getValue: (document) => document.components.HighDensityInfoBlock.middleBounds,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.middleBounds = value;
            },
          },
          {
            type: "bounds",
            label: "第三列边界",
            getValue: (document) => document.components.HighDensityInfoBlock.rightBounds,
            setValue: (document, value) => {
              document.components.HighDensityInfoBlock.rightBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <HighDensityInfoBlock
        phase1={{
          label: "PHASE 01 / CONTEXT",
          title: variant === "stress" ? "Context / Constraints" : "Context",
          subtitle: "Problem framing",
          content:
            variant === "stress"
              ? "高密度信息块最容易出问题的是列宽失衡和标题节奏漂移。这里用较长的第一列文本压测左列是否已经过窄。"
              : "第一列用于承载背景和问题定义。",
          items: [
            { label: "Role", value: "Lighting / Tech Art" },
            { label: "Timeline", value: "2026.03 / 3 weeks" },
          ],
        }}
        phase2={{
          label: "PHASE 02 / SYSTEM",
          title: "Architecture",
          subtitle: "Structure",
          content:
            variant === "stress"
              ? "中列通常承担方法论说明，因此最需要稳定的标题、正文和 metadata 节奏，不然整块会显得又碎又紧。"
              : "第二列用于解释系统结构与执行方法。",
          items: [
            { label: "Tools", value: "Unreal / Houdini / Puck" },
            { label: "Focus", value: "Layout tokens / Typography" },
          ],
        }}
        phase3={{
          label: "PHASE 03 / RESULT",
          title: "Execution",
          subtitle: "Outcome",
          content:
            variant === "stress"
              ? "第三列同时承载文案与图像时，常见问题是图片区进入太早，导致文字段落尚未收住。"
              : "第三列用于交代结果与最终图像。",
          imageSrc: "/images/city-2026/002.webp",
          imagePreset: "ratio-16-9",
          imageFitMode: "x",
        }}
      />
    ),
  },
  ImagePanel: {
    key: "ImagePanel",
    label: "ImagePanel",
    description: "单图展示模块，重点看内容图与大图版本的边界。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.ImagePanel.sectionSpacing,
            setValue: (document, value) => {
              document.components.ImagePanel.sectionSpacing =
                value as ComponentDesignDocument["components"]["ImagePanel"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "常规图边界",
            getValue: (document) => document.components.ImagePanel.contentBounds,
            setValue: (document, value) => {
              document.components.ImagePanel.contentBounds = value;
            },
          },
          {
            type: "bounds",
            label: "大图边界",
            getValue: (document) => document.components.ImagePanel.largeBounds,
            setValue: (document, value) => {
              document.components.ImagePanel.largeBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ImagePanel
        src={variant === "stress" ? "/images/city-2026/001.webp" : "/images/train-station/2Day.webp"}
        alt="Preview image"
        caption={variant === "stress" ? "Larger narrative image block with caption" : "Image Panel Caption"}
        preset="ratio-16-9"
        fitMode="x"
        variant={variant === "stress" ? "large" : "content"}
      />
    ),
  },
  ImageSlider: {
    key: "ImageSlider",
    label: "ImageSlider",
    description: "前后对比滑块，重点看主图片区边界和标签区节奏。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.ImageSlider.sectionSpacing,
            setValue: (document, value) => {
              document.components.ImageSlider.sectionSpacing =
                value as ComponentDesignDocument["components"]["ImageSlider"]["sectionSpacing"];
            },
          },
          {
            type: "select",
            label: "标签区上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ImageSlider.labelsTopSpacing,
            setValue: (document, value) => {
              document.components.ImageSlider.labelsTopSpacing =
                value as ComponentDesignDocument["components"]["ImageSlider"]["labelsTopSpacing"];
            },
          },
          {
            type: "bounds",
            label: "主图片区边界",
            getValue: (document) => document.components.ImageSlider.contentBounds,
            setValue: (document, value) => {
              document.components.ImageSlider.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ImageSlider
        title={variant === "stress" ? "LIGHTING COMPARISON / LONGER HEADER" : "LIGHTING COMPARISON"}
        unlitSrc="/images/train-station/2Day.webp"
        litSrc="/images/train-station/2Night.webp"
        alt="Lighting Comparison"
        imagePreset="ratio-16-9"
        imageFitMode="x"
        leftLabel={variant === "stress" ? "UNLIT VERSION" : "DAY"}
        rightLabel={variant === "stress" ? "LIT VERSION" : "NIGHT"}
        editMode
      />
    ),
  },
  BreakdownHeadline: {
    key: "BreakdownHeadline",
    label: "BreakdownHeadline",
    description: "章节标题模块，重点看标题在主网格中的占位。",
    sections: [
      {
        title: "文本与布局",
        fields: [
          {
            type: "select",
            label: "标题字号",
            options: createTypographyOptions(TITLE_SIZE_OPTIONS),
            getValue: (document) => document.components.BreakdownHeadline.titleSize,
            setValue: (document, value) => {
              document.components.BreakdownHeadline.titleSize = value as TypographySize;
            },
          },
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.BreakdownHeadline.sectionSpacing,
            setValue: (document, value) => {
              document.components.BreakdownHeadline.sectionSpacing =
                value as ComponentDesignDocument["components"]["BreakdownHeadline"]["sectionSpacing"];
            },
          },
          {
            type: "bounds",
            label: "标题边界",
            getValue: (document) => document.components.BreakdownHeadline.contentBounds,
            setValue: (document, value) => {
              document.components.BreakdownHeadline.contentBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <BreakdownSectionHeadline
        title={variant === "stress" ? "SECTION TITLE / LONGER SECTION HEADLINE" : "SECTION TITLE"}
      />
    ),
  },
  BreakdownTriptych: {
    key: "BreakdownTriptych",
    label: "BreakdownTriptych",
    description: "三联图信息模块，重点看三列边界和列间错位。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.BreakdownTriptych.sectionSpacing,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.sectionSpacing =
                value as ComponentDesignDocument["components"]["BreakdownTriptych"]["sectionSpacing"];
            },
          },
          {
            type: "select",
            label: "第二列移动端上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.BreakdownTriptych.col2TopSpacing,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.col2TopSpacing =
                value as ComponentDesignDocument["components"]["BreakdownTriptych"]["col2TopSpacing"];
            },
          },
          {
            type: "select",
            label: "第三列移动端上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.BreakdownTriptych.col3TopSpacing,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.col3TopSpacing =
                value as ComponentDesignDocument["components"]["BreakdownTriptych"]["col3TopSpacing"];
            },
          },
          {
            type: "bounds",
            label: "第一列边界",
            getValue: (document) => document.components.BreakdownTriptych.col1Bounds,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.col1Bounds = value;
            },
          },
          {
            type: "bounds",
            label: "第二列边界",
            getValue: (document) => document.components.BreakdownTriptych.col2Bounds,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.col2Bounds = value;
            },
          },
          {
            type: "bounds",
            label: "第三列边界",
            getValue: (document) => document.components.BreakdownTriptych.col3Bounds,
            setValue: (document, value) => {
              document.components.BreakdownTriptych.col3Bounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <BreakdownTriptych
        col1Title="Column 1"
        col1Text={variant === "stress" ? "First column content description with slightly denser wording." : "First column content description."}
        col1Img="/images/train-station/2Day.webp"
        col1Preset="ratio-16-9"
        col1FitMode="x"
        col2Title="Column 2"
        col2Text={variant === "stress" ? "Second column carries a longer explanatory block for stress testing." : "Second column content description."}
        col2Img="/images/city-2026/001.webp"
        col2Preset="ratio-16-9"
        col2FitMode="x"
        col3Title="Column 3"
        col3Text={variant === "stress" ? "Third column content description with a long bilingual footer. 中英混排压测。" : "Third column content description."}
        col3Img="/images/city-2026/002.webp"
        col3Preset="ratio-16-9"
        col3FitMode="x"
      />
    ),
  },
  ParameterGrid: {
    key: "ParameterGrid",
    label: "ParameterGrid",
    description: "参数栅格模块，重点看参数区整体边界和单项跨度。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.ParameterGrid.sectionSpacing,
            setValue: (document, value) => {
              document.components.ParameterGrid.sectionSpacing =
                value as ComponentDesignDocument["components"]["ParameterGrid"]["sectionSpacing"];
            },
          },
          {
            type: "select",
            label: "媒体区下间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ParameterGrid.mediaBottomSpacing,
            setValue: (document, value) => {
              document.components.ParameterGrid.mediaBottomSpacing =
                value as ComponentDesignDocument["components"]["ParameterGrid"]["mediaBottomSpacing"];
            },
          },
          {
            type: "bounds",
            label: "参数区边界",
            getValue: (document) => document.components.ParameterGrid.parametersBounds,
            setValue: (document, value) => {
              document.components.ParameterGrid.parametersBounds = value;
            },
          },
          {
            type: "number-select",
            label: "单项跨度",
            options: ITEM_SPAN_OPTIONS,
            getValue: (document) => document.components.ParameterGrid.itemSpan,
            setValue: (document, value) => {
              document.components.ParameterGrid.itemSpan =
                value as ComponentDesignParameterItemSpan;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ParameterGrid
        mediaSrc="/images/train-station/2Day.webp"
        imagePreset="ratio-21-9"
        imageFitMode="x"
        isVideo={false}
        parameters={
          variant === "stress"
            ? [
              { name: "Role", value: "Lead", description: "Production direction and system design." },
              { name: "Engine", value: "UE5", description: "Lumen / Niagara / Sequencer pipeline." },
              { name: "Focus", value: "Layout", description: "Typography and content rhythm calibration." },
              { name: "Timeline", value: "3W", description: "Three-week sprint with dense iteration." },
            ]
            : [
              { name: "Parameter 1", value: "Value 1", description: "Description 1" },
              { name: "Parameter 2", value: "Value 2", description: "Description 2" },
              { name: "Parameter 3", value: "Value 3", description: "Description 3" },
            ]
        }
      />
    ),
  },
  ProjectSection: {
    key: "ProjectSection",
    label: "ProjectSection",
    description: "首页项目切片模块，重点看左对齐与右对齐的文本区域切换。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "左对齐文本边界",
            getValue: (document) => document.components.ProjectSection.textLeftBounds,
            setValue: (document, value) => {
              document.components.ProjectSection.textLeftBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "右对齐文本边界",
            getValue: (document) => document.components.ProjectSection.textRightBounds,
            setValue: (document, value) => {
              document.components.ProjectSection.textRightBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ProjectSection
        title={variant === "stress" ? "PENGUIN TRADING CO. / LONG CASE TITLE" : "PENGUIN TRADING CO."}
        subtitle={variant === "stress" ? "Lead Designer / PM / Tech Art / Systems" : "Lead Designer / PM / Tech Art"}
        imageSrc={CANONICAL_PLACEHOLDER_PATH}
        imagePreset="ratio-16-9"
        imageFitMode="x"
        link="/works/penguin"
        index={variant === "stress" ? 2 : 1}
        align={variant === "stress" ? "right" : "left"}
        editMode
      />
    ),
  },
  WorksList: {
    key: "WorksList",
    label: "WorksList",
    description: "作品列表容器，重点看列表标题边界和标题区节奏。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "select",
            label: "区块纵向节奏",
            options: SECTION_SPACING_OPTIONS,
            getValue: (document) => document.components.WorksList.sectionSpacing,
            setValue: (document, value) => {
              document.components.WorksList.sectionSpacing =
                value as ComponentDesignDocument["components"]["WorksList"]["sectionSpacing"];
            },
          },
          {
            type: "select",
            label: "标题区下间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.WorksList.headingBottomSpacing,
            setValue: (document, value) => {
              document.components.WorksList.headingBottomSpacing =
                value as ComponentDesignDocument["components"]["WorksList"]["headingBottomSpacing"];
            },
          },
          {
            type: "bounds",
            label: "标题区边界",
            getValue: (document) => document.components.WorksList.headingBounds,
            setValue: (document, value) => {
              document.components.WorksList.headingBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <WorksList
        heading={variant === "stress" ? "All Selected Works / Full Index" : "All Selected Works"}
        works={[
          {
            id: "playground-work-1",
            number: "01",
            href: "/works/lighting-portfolio",
            title: "LIGHTING PORTFOLIO",
            category: "Lighting Art",
            imageSrc: "/images/train-station/2Day.webp",
            imagePreset: "ratio-21-9",
            imageFitMode: "x",
            desc: variant === "stress"
              ? "A curated collection of lighting studies with a slightly longer description for stress testing."
              : "A curated collection of lighting and mood practices",
          },
          {
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
          ...(variant === "stress"
            ? [{
              id: "playground-work-3",
              number: "03",
              href: "/works/insight",
              title: "INSIGHT",
              category: "Interactive Narrative / Systems",
              imageSrc: "/images/city-2026/001.webp",
              imagePreset: "ratio-21-9" as const,
              imageFitMode: "x" as const,
              desc: "Narrative systems case used to expose denser list rhythm.",
            }]
            : []),
        ]}
        editMode
      />
    ),
  },
  WorksListEntry: {
    key: "WorksListEntry",
    label: "WorksListEntry",
    description: "作品列表单项，重点看编号、标题和侧栏描述的三段式关系。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "编号区边界",
            getValue: (document) => document.components.WorksListEntry.numberBounds,
            setValue: (document, value) => {
              document.components.WorksListEntry.numberBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "标题区边界",
            getValue: (document) => document.components.WorksListEntry.titleBounds,
            setValue: (document, value) => {
              document.components.WorksListEntry.titleBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "侧栏区边界",
            getValue: (document) => document.components.WorksListEntry.sidebarBounds,
            setValue: (document, value) => {
              document.components.WorksListEntry.sidebarBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <WorksListEntry
        id="playground-work-entry"
        number="01"
        href="/works/penguin"
        title={variant === "stress" ? "PENGUIN TRADING CO. / EXTENDED TITLE" : "PENGUIN TRADING CO."}
        category={variant === "stress" ? "Lead Designer / PM / Tech Art / Systems" : "Lead Designer / PM / Tech Art"}
        imageSrc={CANONICAL_PLACEHOLDER_PATH}
        imagePreset="ratio-21-9"
        imageFitMode="x"
        desc={
          variant === "stress"
            ? "This longer side description is used to expose whether the sidebar remains stable when copy density increases."
            : "Simulation management game with asset lock systems"
        }
        editMode
      />
    ),
  },
  HomeEndcapSection: {
    key: "HomeEndcapSection",
    label: "HomeEndcapSection",
    description: "首页收束模块，重点看居中文案区的边界与按钮进入距离。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "bounds",
            label: "内容区边界",
            getValue: (document) => document.components.HomeEndcapSection.contentBounds,
            setValue: (document, value) => {
              document.components.HomeEndcapSection.contentBounds = value;
            },
          },
          {
            type: "select",
            label: "描述上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HomeEndcapSection.descriptionTopSpacing,
            setValue: (document, value) => {
              document.components.HomeEndcapSection.descriptionTopSpacing =
                value as ComponentDesignDocument["components"]["HomeEndcapSection"]["descriptionTopSpacing"];
            },
          },
          {
            type: "select",
            label: "按钮上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HomeEndcapSection.buttonTopSpacing,
            setValue: (document, value) => {
              document.components.HomeEndcapSection.buttonTopSpacing =
                value as ComponentDesignDocument["components"]["HomeEndcapSection"]["buttonTopSpacing"];
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <HomeEndcapSection
        eyebrow="Selected Archive"
        title={variant === "stress" ? "ALL WORKS / FULL ARCHIVE" : "ALL WORKS"}
        description={
          variant === "stress"
            ? "A full index of interactive narrative, systems, lighting studies, and production experiments. This longer copy helps expose whether the centered text block is still controlled."
            : "A full index of interactive narrative, systems, lighting studies, and production experiments."
        }
        buttonLabel="ENTER ARCHIVE"
        buttonHref="/works"
        editMode
      />
    ),
  },
  NextProjectBlock: {
    key: "NextProjectBlock",
    label: "NextProjectBlock",
    description: "下一项目收束模块，重点看居中文案与底部版权信息的边界。",
    sections: [
      {
        title: "布局与节奏",
        fields: [
          {
            type: "bounds",
            label: "中心文案边界",
            getValue: (document) => document.components.NextProjectBlock.overlayBounds,
            setValue: (document, value) => {
              document.components.NextProjectBlock.overlayBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "底部左栏边界",
            getValue: (document) => document.components.NextProjectBlock.footerLeftBounds,
            setValue: (document, value) => {
              document.components.NextProjectBlock.footerLeftBounds = value;
            },
          },
          {
            type: "responsive-bounds",
            label: "底部右栏边界",
            getValue: (document) => document.components.NextProjectBlock.footerRightBounds,
            setValue: (document, value) => {
              document.components.NextProjectBlock.footerRightBounds = value;
            },
          },
          {
            type: "select",
            label: "底部区块上下间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.NextProjectBlock.footerTopSpacing,
            setValue: (document, value) => {
              document.components.NextProjectBlock.footerTopSpacing =
                value as ComponentDesignDocument["components"]["NextProjectBlock"]["footerTopSpacing"];
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <NextProjectBlock
        nextId="insight"
        nextName={variant === "stress" ? "INSIGHT / LONGER NEXT PROJECT NAME" : "INSIGHT"}
        nextBg="/images/insight/InsightOnlyCover.webp"
        href="/works/insight"
        imagePreset="ratio-21-9"
        imageFitMode="x"
        editMode
      />
    ),
  },
  ContactFlashlight: {
    key: "ContactFlashlight",
    label: "ContactFlashlight",
    description: "关于与联系模块，重点看三段内容区在统一栅格中的落点。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "bounds",
            label: "头部信息区边界",
            getValue: (document) => document.components.ContactFlashlight.heroBounds,
            setValue: (document, value) => {
              document.components.ContactFlashlight.heroBounds = value;
            },
          },
          {
            type: "bounds",
            label: "经历与方向区边界",
            getValue: (document) => document.components.ContactFlashlight.detailBounds,
            setValue: (document, value) => {
              document.components.ContactFlashlight.detailBounds = value;
            },
          },
          {
            type: "bounds",
            label: "联系方式区边界",
            getValue: (document) => document.components.ContactFlashlight.contactBounds,
            setValue: (document, value) => {
              document.components.ContactFlashlight.contactBounds = value;
            },
          },
        ],
      },
    ],
    renderPreview: (variant) => (
      <ContactFlashlightBlock
        maskRadius={500}
        maskSmoothness={40}
        darkTextColor="rgba(255,255,255,0.4)"
        lightTextColor="rgba(255,255,255,1)"
        name="JIANG CHENGYAN"
        taglineText={
          variant === "stress"
            ? "艺术与科技 / 交互叙事设计 / 游戏设计 / 系统化内容结构"
            : "艺术与科技 / 交互叙事设计 / 游戏设计"
        }
        taglineSub="CUC '2028"
        email="hello@example.com"
        wechat="wechat_id"
        experienceHistory={[
          { company: "Tencent / Lightspeed", role: "Lighting / Tech Art Intern" },
          { company: "Independent Projects", role: "Interaction Narrative / Systems" },
        ]}
        creativeDirection={[
          { title: "Lighting Art", subtitle: "Mood / Framing / Rhythm" },
          { title: "System Design", subtitle: "Narrative / Layout / Interaction" },
        ]}
        editMode
      />
    ),
  },
};
