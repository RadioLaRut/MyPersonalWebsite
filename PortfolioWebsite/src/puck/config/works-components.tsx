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

const contentCardImageFields = buildImagePickerFieldTriple("imageSrc");
const parameterGridImageFields = buildImagePickerFieldTriple("mediaSrc", {
  defaultPreset: "ratio-21-9",
  fitModeKey: "imageFitMode",
  mode: "media",
  presetKey: "imagePreset",
  srcLabel: "可选图片",
});
const highDensityPhase3ImageFields = buildImagePickerFieldTriple("phase3ImageSrc", {
  fitModeLabel: "Phase 3 Image Fit Mode",
  presetLabel: "Phase 3 Image Preset",
  srcLabel: "Phase 3 Image Source",
});
const projectSectionImageFields = buildImagePickerFieldTriple("imageSrc");
const worksListEntryImageFields = buildImagePickerFieldTriple("imageSrc", {
  defaultPreset: "ratio-21-9",
});
function buildTriptychColumnFields(
  column: 1 | 2 | 3,
): NonNullable<ComponentDefinition["fields"]> {
  return {
    [`_g_col${column}`]: createFieldGroup(`列 ${column}`),
    [`col${column}Title`]: { type: "text", label: `Column ${column} Title` },
    [`col${column}Text`]: { type: "textarea", label: `Column ${column} Text` },
    [`col${column}Img`]: createImageSourceField(`Column ${column} Image`),
    [`col${column}Preset`]: { ...imagePresetField, label: `Column ${column} Preset` },
    [`col${column}FitMode`]: { ...imageFitModeField, label: `Column ${column} Fit Mode` },
  };
}

function buildTriptychColumnDefaults(column: 1 | 2 | 3) {
  return {
    [`col${column}Title`]: "",
    [`col${column}Text`]: "",
    [`col${column}Img`]: "",
    [`col${column}Preset`]: "ratio-16-9",
    [`col${column}FitMode`]: "x",
  };
}

function buildPhaseTextFields(
  phase: 1 | 2 | 3,
): NonNullable<ComponentDefinition["fields"]> {
  return {
    [`phase${phase}Label`]: { type: "text", label: `Phase ${phase} Label` },
    [`phase${phase}Title`]: { type: "text", label: `Phase ${phase} Title` },
    [`phase${phase}Subtitle`]: { type: "text", label: `Phase ${phase} Subtitle` },
    [`phase${phase}Content`]: { type: "textarea", label: `Phase ${phase} Content` },
  };
}

function buildPhaseDefaults(phase: 1 | 2 | 3) {
  return {
    [`phase${phase}Label`]: "",
    [`phase${phase}Title`]: "",
    [`phase${phase}Subtitle`]: "",
    [`phase${phase}Content`]: "",
  };
}

// defaultProps 仅服务 Admin 新建节点；ComponentLab 的演示内容统一来自页面实例与预设文件。
export const worksComponents = {
    BreakdownHeadline: {
      fields: {
        title: { type: "text", label: "Title" },
        variant: {
          type: "select",
          label: "层级",
          options: [
            { label: "章标题", value: "chapter" },
            { label: "子节标题", value: "section" },
          ],
        },
        indexLabel: { type: "text", label: "章节序号" },
      },
      defaultProps: {
        title: "",
        variant: "section",
        indexLabel: "",
      },
    },

    ImageSlider: {
      fields: {
        _g_images: createFieldGroup("对比图片"),
        title: { type: "text", label: "Title" },
        unlitSrc: createImageSourceField("Unlit Source"),
        litSrc: createImageSourceField("Lit Source"),
        alt: { type: "text", label: "Alt Text" },
        _g_display: createFieldGroup("显示设置"),
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        initialPosition: { type: "number", label: "Initial Slider Position" },
        _g_labels: createFieldGroup("标签文字"),
        leftLabel: { type: "text", label: "Left Label" },
        rightLabel: { type: "text", label: "Right Label" },
      },
      defaultProps: {
        title: "LIGHTING COMPARISON",
        unlitSrc: "/images/train-station/2Day.webp",
        litSrc: "/images/train-station/2Night.webp",
        alt: "Lighting Comparison",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        initialPosition: 50,
      },
    },

    ContentCard: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        _g_image: createFieldGroup("图片配置"),
        ...contentCardImageFields.fields,
        _g_layout: createFieldGroup("布局"),
        imagePosition: {
          type: "select" as const,
          label: "Image Position",
          options: [
            { label: "Image Right (default)", value: "right" },
            { label: "Image Left", value: "left" },
          ],
        },
      },
      defaultProps: {
        title: "Section Title",
        description: "Add a paragraph of description here.",
        ...contentCardImageFields.defaults,
        imagePosition: "right",
      },
    },
    BreakdownTriptych: {
      fields: {
        ...buildTriptychColumnFields(1),
        ...buildTriptychColumnFields(2),
        ...buildTriptychColumnFields(3),
      },
      defaultProps: {
        ...buildTriptychColumnDefaults(1),
        ...buildTriptychColumnDefaults(2),
        ...buildTriptychColumnDefaults(3),
      },
    },

    ParameterGrid: {
      fields: {
        _g_media: createFieldGroup("可选图片"),
        ...parameterGridImageFields.fields,
        mediaAlt: { type: "text", label: "媒体替代文本" },
        mediaLabel: { type: "text", label: "媒体标签" },
        _g_params: createFieldGroup("参数列表"),
        parameters: {
          type: "array",
          label: "Parameters",
          getItemSummary: (item: { name?: string }) => item.name || "Unnamed Parameter",
          arrayFields: {
            name: { type: "text", label: "Name" },
            value: { type: "text", label: "Value" },
            description: { type: "textarea", label: "Description" },
          }
        }
      },
      defaultProps: {
        ...parameterGridImageFields.defaults,
        mediaAlt: "",
        mediaLabel: "",
        parameters: []
      },
    },

    HighDensityInfoBlock: {
      fields: {
        _g_phase1: createFieldGroup("阶段 1"),
        ...buildPhaseTextFields(1),
        phase1Items: {
          type: "slot",
          label: "Phase 1 Items",
          allow: ["MetadataListItem"],
        },
        _g_phase2: createFieldGroup("阶段 2"),
        ...buildPhaseTextFields(2),
        phase2Items: {
          type: "slot",
          label: "Phase 2 Items",
          allow: ["MetadataListItem"],
        },
        _g_phase3: createFieldGroup("阶段 3"),
        ...buildPhaseTextFields(3),
        ...highDensityPhase3ImageFields.fields,
      },
      defaultProps: {
        ...buildPhaseDefaults(1),
        phase1Items: [],
        ...buildPhaseDefaults(2),
        phase2Items: [],
        ...buildPhaseDefaults(3),
        ...highDensityPhase3ImageFields.defaults,
      },
    },

    ProjectSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", label: "Title" },
        subtitle: { type: "text", label: "Subtitle" },
        _g_image: createFieldGroup("图片配置"),
        ...projectSectionImageFields.fields,
        mobileImageFocalX: { type: "number", label: "移动端焦点 X (%)" },
        mobileImageFocalY: { type: "number", label: "移动端焦点 Y (%)" },
        _g_link: createFieldGroup("链接与布局"),
        link: { type: "text", label: "Link" },
        index: { type: "number", label: "Index" },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Project Name",
        subtitle: "Project Category",
        ...projectSectionImageFields.defaults,
        mobileImageFocalX: 50,
        mobileImageFocalY: 50,
        link: "",
        index: 0,
        align: "auto",
      },
    },

    PortfolioHeroHeader: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", label: "Title" },
        subtitle: { type: "text", label: "Subtitle" },
        descriptionLine1: { type: "text", label: "Description Line 1" },
        descriptionLine2: { type: "text", label: "Description Line 2" },
        _g_cta: createFieldGroup("行动按钮 (CTA)"),
        ctaLabel: { type: "text", label: "CTA Label" },
        ctaHref: { type: "text", label: "CTA Href" },
      },
      defaultProps: {
        title: "",
        subtitle: "",
        descriptionLine1: "",
        descriptionLine2: "",
        ctaLabel: "",
        ctaHref: "",
      },
    },

    WorksList: {
      fields: {
        heading: { type: "text", label: "Heading" },
        indexSummary: { type: "text", label: "索引说明" },
        entries: {
          type: "slot",
          label: "Entries",
          allow: ["WorksListEntry"],
        }
      },
      defaultProps: {
        heading: "",
        indexSummary: "",
        entries: []
      },
    },

    WorksListEntry: {
      fields: {
        _g_info: createFieldGroup("基本信息"),
        number: { type: "text", label: "Number" },
        href: { type: "text", label: "Href" },
        title: { type: "text", label: "Title" },
        category: { type: "text", label: "Category" },
        desc: { type: "textarea", label: "Description" },
        aliases: {
          type: "array",
          label: "历史别名",
          getItemSummary: (item: { slug?: string }) => item.slug || "未命名别名",
          arrayFields: {
            slug: { type: "text", label: "路径别名" },
          },
        },
        _g_image: createFieldGroup("图片配置"),
        ...worksListEntryImageFields.fields,
      },
      defaultProps: {
        number: "",
        href: "",
        title: "",
        category: "",
        ...worksListEntryImageFields.defaults,
        desc: "",
        aliases: [],
      },
    },

    NextProjectBlock: {
      fields: {
        nextId: { type: "text", label: "下一项目 ID" },
        eyebrow: { type: "text", label: "眉题" },
        footerLeft: { type: "text", label: "左页脚" },
        footerRight: { type: "text", label: "右页脚" },
      },
      defaultProps: {
        nextId: "penguin",
        eyebrow: "NEXT PROJECT",
        footerLeft: "© 2026 江承彦 / JIANG CHENGYAN",
        footerRight: "",
      },
    },
} satisfies ComponentDefinitionRegistry;
