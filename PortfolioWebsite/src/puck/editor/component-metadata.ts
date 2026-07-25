import {
  PUCK_COMPONENT_CATEGORIES,
  PUCK_COMPONENT_TYPES,
  type PuckComponentType,
} from "../component-manifest.ts";

export type EditorComponentMeta = {
  type: PuckComponentType;
  label: string;
  description: string;
  category: keyof typeof PUCK_COMPONENT_CATEGORIES;
  searchAliases?: string[];
};

const metadata = [
  {
    type: "HeroSection",
    label: "首页主视觉",
    description: "首页首屏的大图、主标题、说明与行动按钮。",
    category: "layout",
    searchAliases: ["首屏", "hero", "封面"],
  },
  {
    type: "HeroHeadline",
    label: "作品头图标题",
    description: "叠加在作品头图上的标题、眉题与返回入口。",
    category: "layout",
    searchAliases: ["作品首屏", "headline", "封面标题"],
  },
  {
    type: "EditorialHeader",
    label: "综合内容页头",
    description: "作品索引或灯光合集共用的页头，可切换内容变体。",
    category: "layout",
    searchAliases: ["作品集页头", "灯光合集页头", "portfolio", "collection"],
  },
  {
    type: "EditorialSplit",
    label: "图文分栏",
    description: "支持单段正文或段落 Slot，并可切换媒体位置。",
    category: "layout",
    searchAliases: ["左右分栏", "内容卡", "split", "paragraphs"],
  },
  {
    type: "ThreeColumnSection",
    label: "三栏内容区",
    description: "三栏分解、叙事阶段或证据网格共用的内容区。",
    category: "layout",
    searchAliases: ["三栏分解", "阶段信息", "triptych", "phase", "evidence"],
  },
  {
    type: "StatementBlock",
    label: "强调陈述",
    description: "用大留白承载一句核心观点，为叙事保留换气。",
    category: "layout",
    searchAliases: ["金句", "statement", "引言"],
  },
  {
    type: "RichParagraph",
    label: "长文段落",
    description: "适合连续叙述和多段正文的阅读区块。",
    category: "layout",
    searchAliases: ["正文", "rich text", "文章"],
  },
  {
    type: "ImagePanel",
    label: "单图面板",
    description: "支持多种尺寸、裁切和图片说明的单图展示。",
    category: "layout",
    searchAliases: ["图片", "figure", "单图"],
  },
  {
    type: "BilibiliEmbed",
    label: "B 站视频",
    description: "通过 BV 号或标准链接嵌入 B 站视频。",
    category: "layout",
    searchAliases: ["哔哩哔哩", "视频", "bilibili", "embed"],
  },
  {
    type: "ProjectCoverLink",
    label: "项目封面入口",
    description: "可切换沉浸式或卡片式的项目封面与跳转入口。",
    category: "works",
    searchAliases: ["项目展示", "灯光项目卡", "project", "cover"],
  },
  {
    type: "WorksList",
    label: "作品列表",
    description: "承载作品列表项的索引区块。",
    category: "works",
    searchAliases: ["索引", "archive", "entries"],
  },
  {
    type: "ParameterGrid",
    label: "参数网格",
    description: "可选图片与成组参数说明组成的技术信息网格。",
    category: "works",
    searchAliases: ["参数", "规格", "parameter"],
  },
  {
    type: "ImageSlider",
    label: "前后对比滑块",
    description: "拖动比较两张图片的前后效果。",
    category: "works",
    searchAliases: ["对比", "before after", "slider"],
  },
  {
    type: "BreakdownHeadline",
    label: "分解章节标题",
    description: "作品分解页中的章标题或子节标题。",
    category: "works",
    searchAliases: ["章节", "breakdown", "section"],
  },
  {
    type: "NextProjectBlock",
    label: "下一项目",
    description: "作品详情页末尾跳转到下一项目的区块。",
    category: "works",
    searchAliases: ["下一个", "next", "导航"],
  },
  {
    type: "HomeEndcapSection",
    label: "首页收尾",
    description: "页面末尾的总结文案与行动按钮。",
    category: "contact",
    searchAliases: ["结尾", "endcap", "footer cta"],
  },
  {
    type: "ContactFlashlight",
    label: "手电筒联系区",
    description: "关于页的交互式联系信息与履历区块。",
    category: "contact",
    searchAliases: ["联系", "contact", "about"],
  },
  {
    type: "WorksListEntry",
    label: "作品列表项",
    description: "作品列表中的单条项目记录，仅用于作品列表槽。",
    category: "internal",
    searchAliases: ["列表项", "entry", "作品条目"],
  },
  {
    type: "MetadataListItem",
    label: "元数据列表项",
    description: "联系信息或阶段信息中的标签和值，仅用于对应槽。",
    category: "internal",
    searchAliases: ["元数据", "信息项", "metadata"],
  },
  {
    type: "TextParagraphBlock",
    label: "文本段落项",
    description: "图文分栏中的单段正文，仅用于段落槽。",
    category: "internal",
    searchAliases: ["段落项", "paragraph", "文本"],
  },
] as const satisfies readonly EditorComponentMeta[];

export const EDITOR_COMPONENT_METADATA = metadata;

export const EDITOR_COMPONENT_META_BY_TYPE = Object.fromEntries(
  metadata.map((entry) => [entry.type, entry]),
) as unknown as Record<PuckComponentType, EditorComponentMeta>;

export function getEditorComponentMeta(type: string) {
  return EDITOR_COMPONENT_META_BY_TYPE[type as PuckComponentType];
}

export function searchEditorComponents(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [...EDITOR_COMPONENT_METADATA];

  return EDITOR_COMPONENT_METADATA.filter((entry) => {
    const category = PUCK_COMPONENT_CATEGORIES[entry.category].title;
    return [
      entry.label,
      entry.type,
      entry.description,
      category,
      ...(entry.searchAliases ?? []),
    ].some((candidate) => candidate.toLocaleLowerCase().includes(normalizedQuery));
  });
}

if (
  EDITOR_COMPONENT_METADATA.length !== PUCK_COMPONENT_TYPES.length ||
  PUCK_COMPONENT_TYPES.some((type) => !EDITOR_COMPONENT_META_BY_TYPE[type])
) {
  throw new Error("Editor component metadata must cover every Puck component.");
}
