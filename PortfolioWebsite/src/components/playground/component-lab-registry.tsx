"use client";

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
    description: "首页首屏模块，重点看海报式单栏文字锁定与图像之间的关系。",
    sections: [
      {
        title: "布局",
        fields: [
          {
            type: "responsive-bounds",
            label: "内容区边界",
            getValue: (document) => document.components.HeroSection.contentBounds,
            setValue: (document, value) => {
              document.components.HeroSection.contentBounds = value;
            },
          },
        ],
      },
      {
        title: "节奏",
        fields: [
          {
            type: "select",
            label: "身份行上间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.HeroSection.eyebrowTopSpacing,
            setValue: (document, value) => {
              document.components.HeroSection.eyebrowTopSpacing =
                value as ComponentDesignDocument["components"]["HeroSection"]["eyebrowTopSpacing"];
            },
          },
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
      {
        title: "节奏",
        fields: [
          {
            type: "select",
            label: "标题字号档位",
            options: createTypographyOptions(STACK_HEADING_OPTIONS),
            getValue: (document) => document.components.ProjectSection.titleSize,
            setValue: (document, value) => {
              document.components.ProjectSection.titleSize = value as TypographySize;
            },
          },
          {
            type: "select",
            label: "锁组间距",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ProjectSection.lockupGap,
            setValue: (document, value) => {
              document.components.ProjectSection.lockupGap =
                value as ComponentDesignDocument["components"]["ProjectSection"]["lockupGap"];
            },
          },
          {
            type: "select",
            label: "底线光学上提",
            options: SPACING_OPTIONS,
            getValue: (document) => document.components.ProjectSection.titleUnderlineOpticalPull,
            setValue: (document, value) => {
              document.components.ProjectSection.titleUnderlineOpticalPull =
                value as ComponentDesignDocument["components"]["ProjectSection"]["titleUnderlineOpticalPull"];
            },
          },
        ],
      },
    ],
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
            type: "select",
            label: "标题字号档位",
            options: createTypographyOptions(STACK_HEADING_OPTIONS),
            getValue: (document) => document.components.HomeEndcapSection.titleSize,
            setValue: (document, value) => {
              document.components.HomeEndcapSection.titleSize = value as TypographySize;
            },
          },
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
  },
};
