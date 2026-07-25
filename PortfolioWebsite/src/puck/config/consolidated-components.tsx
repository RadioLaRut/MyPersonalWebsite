import type {
  ComponentDefinition,
  ComponentDefinitionRegistry,
} from "./component-definition";
import { createFieldGroup } from "@/puck/fields/field-groups";
import {
  buildImagePickerFieldTriple,
  createImageSourceField,
} from "@/puck/fields/image-source-field";
import {
  imageFitModeField,
  imagePresetField,
} from "@/puck/fields/image-fields";
import { createTextAlignmentField } from "@/puck/fields/text-alignment-field";

const editorialSplitImageFields = buildImagePickerFieldTriple("imageSrc");
const projectCoverImageFields = buildImagePickerFieldTriple("mediaSrc", {
  defaultPreset: "ratio-21-9",
  fitModeKey: "imageFitMode",
  presetKey: "imagePreset",
  srcLabel: "封面图片",
});

function buildColumnFields(
  column: 1 | 2 | 3,
): NonNullable<ComponentDefinition["fields"]> {
  const itemSlot = column < 3
    ? {
      [`col${column}Items`]: {
        type: "slot" as const,
        label: `第 ${column} 栏条目`,
        allow: ["MetadataListItem"],
      },
    }
    : {};

  return {
    [`_g_col${column}`]: createFieldGroup(`第 ${column} 栏`),
    [`col${column}Label`]: { type: "text", label: "眉题 / 阶段标签" },
    [`col${column}Title`]: { type: "text", label: "标题" },
    [`col${column}Subtitle`]: { type: "text", label: "副标题" },
    [`col${column}Body`]: { type: "textarea", label: "正文" },
    [`col${column}BodyAlign`]: createTextAlignmentField("正文对齐"),
    ...itemSlot,
    [`col${column}MediaSrc`]: createImageSourceField("可选图片"),
    [`col${column}MediaPreset`]: {
      ...imagePresetField,
      label: "图片比例",
    },
    [`col${column}MediaFitMode`]: {
      ...imageFitModeField,
      label: "图片适配",
    },
  };
}

function buildColumnDefaults(column: 1 | 2 | 3) {
  return {
    [`col${column}Body`]: "",
    [`col${column}BodyAlign`]: "left",
    ...(column < 3 ? { [`col${column}Items`]: [] } : {}),
    [`col${column}Label`]: "",
    [`col${column}MediaFitMode`]: "x",
    [`col${column}MediaPreset`]: "ratio-16-9",
    [`col${column}MediaSrc`]: "",
    [`col${column}Subtitle`]: "",
    [`col${column}Title`]: "",
  };
}

export const consolidatedComponents = {
  BilibiliEmbed: {
    fields: {
      _g_video: createFieldGroup("B 站视频"),
      source: {
        type: "text",
        label: "BV 号或标准视频链接",
      },
      title: {
        type: "text",
        label: "无障碍标题",
      },
      _g_caption: createFieldGroup("图注"),
      caption: {
        type: "textarea",
        label: "图注（可选）",
      },
      captionAlign: createTextAlignmentField("图注对齐"),
    },
    defaultProps: {
      caption: "",
      captionAlign: "left",
      source: "",
      title: "B 站视频",
    },
  },

  EditorialHeader: {
    fields: {
      variant: {
        type: "select",
        label: "页头类型",
        options: [
          { label: "作品索引", value: "index" },
          { label: "灯光合集", value: "collection" },
        ],
      },
      _g_text: createFieldGroup("文本内容"),
      title: { type: "text", label: "标题" },
      subtitle: { type: "text", label: "副标题（索引）" },
      descriptionLine1: { type: "text", label: "说明眉题（索引）" },
      descriptionLine2: { type: "textarea", label: "说明正文（索引）" },
      description: { type: "textarea", label: "合集说明" },
      descriptionAlign: createTextAlignmentField("说明正文对齐"),
      number: { type: "text", label: "合集编号" },
      _g_links: createFieldGroup("链接"),
      ctaLabel: { type: "text", label: "CTA 文案（索引）" },
      ctaHref: { type: "text", label: "CTA 链接（索引）" },
      backHref: { type: "text", label: "返回链接（合集）" },
    },
    defaultProps: {
      backHref: "/works/lighting-portfolio",
      ctaHref: "",
      ctaLabel: "",
      description: "",
      descriptionAlign: "left",
      descriptionLine1: "",
      descriptionLine2: "",
      number: "01",
      subtitle: "",
      title: "",
      variant: "index",
    },
  },

  EditorialSplit: {
    fields: {
      _g_mode: createFieldGroup("内容模式"),
      layout: {
        type: "select",
        label: "布局",
        options: [
          { label: "媒体在左", value: "media-left" },
          { label: "媒体在右", value: "media-right" },
          { label: "上下堆叠", value: "stack" },
        ],
      },
      bodyMode: {
        type: "select",
        label: "正文模式",
        options: [
          { label: "单一正文", value: "plain" },
          { label: "段落 Slot", value: "slot" },
        ],
      },
      _g_text: createFieldGroup("文本内容"),
      heading: { type: "text", label: "标题" },
      body: { type: "textarea", label: "单一正文" },
      bodyAlign: createTextAlignmentField("正文对齐"),
      paragraphs: {
        type: "slot",
        label: "段落 Slot",
        allow: ["TextParagraphBlock"],
      },
      _g_image: createFieldGroup("可选媒体"),
      ...editorialSplitImageFields.fields,
    },
    defaultProps: {
      body: "",
      bodyAlign: "left",
      bodyMode: "plain",
      heading: "Section Title",
      ...editorialSplitImageFields.defaults,
      layout: "media-right",
      paragraphs: [],
    },
  },

  ThreeColumnSection: {
    fields: {
      _g_model: createFieldGroup("三栏模型"),
      variant: {
        type: "select",
        label: "内容模型",
        options: [
          { label: "独立图文", value: "triptych" },
          { label: "叙事阶段", value: "phase" },
          { label: "证据网格", value: "evidence" },
        ],
      },
      rhythm: {
        type: "select",
        label: "纵向节奏",
        options: [
          { label: "顶端齐平", value: "aligned" },
          { label: "错落排列", value: "staggered" },
        ],
      },
      ...buildColumnFields(1),
      ...buildColumnFields(2),
      ...buildColumnFields(3),
    },
    defaultProps: {
      ...buildColumnDefaults(1),
      ...buildColumnDefaults(2),
      ...buildColumnDefaults(3),
      rhythm: "aligned",
      variant: "triptych",
    },
  },

  ProjectCoverLink: {
    fields: {
      _g_mode: createFieldGroup("封面入口"),
      variant: {
        type: "select",
        label: "样式",
        options: [
          { label: "沉浸式全屏封面", value: "immersive" },
          { label: "卡片式封面", value: "card" },
        ],
      },
      _g_text: createFieldGroup("文本内容"),
      title: { type: "text", label: "标题" },
      subtitle: { type: "text", label: "副标题" },
      number: { type: "text", label: "编号" },
      _g_image: createFieldGroup("可选封面"),
      ...projectCoverImageFields.fields,
      mobileImageFocalX: { type: "number", label: "移动端焦点 X (%)" },
      mobileImageFocalY: { type: "number", label: "移动端焦点 Y (%)" },
      _g_link: createFieldGroup("链接与排版"),
      href: { type: "text", label: "链接" },
      index: { type: "number", label: "排序索引" },
      align: {
        type: "select",
        label: "标题方向",
        options: [
          { label: "自动交替", value: "auto" },
          { label: "左侧", value: "left" },
          { label: "右侧", value: "right" },
        ],
      },
    },
    defaultProps: {
      align: "auto",
      href: "",
      ...projectCoverImageFields.defaults,
      index: 0,
      mobileImageFocalX: 50,
      mobileImageFocalY: 50,
      number: "01",
      subtitle: "",
      title: "Project Name",
      variant: "immersive",
    },
  },
} satisfies ComponentDefinitionRegistry;
