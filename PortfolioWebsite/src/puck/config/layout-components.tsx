import type { ComponentDefinitionRegistry } from "./component-definition";
import { createFieldGroup } from "@/puck/fields/field-groups";
import {
  buildImagePickerFieldTriple,
  createImageSourceField,
} from "@/puck/fields/image-source-field";
import {
  imageFitModeField,
  imagePresetField,
} from "@/puck/fields/image-fields";

const heroHeadlineImageFields = buildImagePickerFieldTriple("heroImage", {
  defaultPreset: "ratio-21-9",
  fitModeLabel: "Image Fit Mode",
  presetLabel: "Image Preset",
  srcLabel: "Hero Image",
});

const textSplitImageFields = buildImagePickerFieldTriple("imageSrc");
// defaultProps 仅服务 Admin 新建节点；ComponentLab 的演示内容统一来自页面实例与预设文件。
export const layoutComponents = {
    StatementBlock: {
      fields: {
        _g_content: createFieldGroup("文本内容"),
        content: { type: "textarea", label: "Content" },
        _g_style: createFieldGroup("样式设置"),
        backgroundColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Black", value: "black" },
            { label: "Dark Gray", value: "dark-gray" },
          ],
        },
        minHeight: {
          type: "select",
          label: "Min Height",
          options: [
            { label: "Small (20vh)", value: "small" },
            { label: "Medium (35vh)", value: "medium" },
            { label: "Large (50vh)", value: "large" },
          ],
        },
      },
      defaultProps: {
        content: "We blur the lines between virtual and reality.",
        backgroundColor: "black",
        minHeight: "medium",
      },
    },

    // 兼容历史 JSON 中的 Puck 组件类型名。
    HeroHeadline: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "textarea", label: "Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        _g_image: createFieldGroup("Hero 图片"),
        ...heroHeadlineImageFields.fields,
        _g_link: createFieldGroup("导航链接"),
        navLink: { type: "text", label: "Nav Link" },
        navLinkLabel: { type: "text", label: "Nav Link Label" },
      },
      defaultProps: {
        eyebrow: "PROJECT",
        title: "PROJECT TITLE",
        subtitle: "Add a short project summary.",
        ...heroHeadlineImageFields.defaults,
        navLink: "",
        navLinkLabel: "观看视频",
      },
    },
    RichParagraph: {
      fields: {
        content: { type: "textarea", label: "Content" },
      },
      defaultProps: {
        content: "Enter your paragraph text here.",
      },
    },
    ImagePanel: {
      fields: {
        _g_image: createFieldGroup("图片"),
        src: createImageSourceField("Image Source"),
        alt: { type: "text", label: "Alt Text" },
        caption: { type: "text", label: "Caption" },
        _g_display: createFieldGroup("显示设置"),
        preset: { ...imagePresetField, label: "Preset" },
        fitMode: { ...imageFitModeField, label: "Fit Mode" },
        variant: {
          type: "select" as const,
          label: "Variant",
          options: [
            { label: "Content (max-width with border)", value: "content" },
            { label: "Large (grid-aligned wide figure)", value: "large" },
            { label: "Fullscreen (full viewport height)", value: "fullscreen" },
          ],
        },
      },
      defaultProps: {
        src: "",
        alt: "",
        caption: "Enter an image caption",
        preset: "ratio-16-9",
        fitMode: "x",
        variant: "content",
      },
    },

    TextSplitLayout: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        heading: { type: "text", label: "Heading" },
        paragraphs: {
          type: "slot",
          label: "Paragraphs",
          allow: ["TextParagraphBlock"],
        },
        _g_image: createFieldGroup("图片配置"),
        ...textSplitImageFields.fields,
        _g_layout: createFieldGroup("布局设置"),
        layoutVariant: {
          type: "select",
          label: "Layout Variant",
          options: [
            { label: "Split Left", value: "split-left" },
            { label: "Split Right", value: "split-right" },
            { label: "Stack", value: "stack" }
          ]
        }
      },
      defaultProps: {
        heading: "Feature Description",
        paragraphs: [],
        ...textSplitImageFields.defaults,
        layoutVariant: "split-left"
      },
    },

    HeroSection: {
      fields: {
        variant: {
          type: "select",
          label: "结构变体",
          options: [
            { label: "海报", value: "poster" },
            { label: "完整信息", value: "full" },
          ],
        },
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "textarea", label: "Title" },
        positioning: { type: "text", label: "定位文案" },
        subtitle: { type: "text", label: "Subtitle" },
        description: { type: "textarea", label: "Description" },
        _g_cta: createFieldGroup("行动按钮 (CTA)"),
        primaryCtaLabel: { type: "text", label: "Primary CTA Label" },
        primaryCtaHref: { type: "text", label: "Primary CTA Href" },
        secondaryCtaLabel: { type: "text", label: "Secondary CTA Label" },
        secondaryCtaHref: { type: "text", label: "Secondary CTA Href" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: createImageSourceField("Image Source"),
        imageAlt: { type: "text", label: "Image Alt" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        mobileImageFocalX: { type: "number", label: "移动端焦点 X (%)" },
        mobileImageFocalY: { type: "number", label: "移动端焦点 Y (%)" },
      },
      defaultProps: {
        variant: "poster",
        eyebrow: "LIGHTING / TECH ART / GAME DESIGN",
        title: "JIANG\nCHENGYAN",
        positioning: "让氛围、系统与落地流程共同服务体验。",
        subtitle: "",
        description: "",
        primaryCtaLabel: "",
        primaryCtaHref: "",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
        imageSrc: "/images/covers/2026/ShotForCrewWithoutWord.0004.webp",
        imageAlt: "Hero Background",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        mobileImageFocalX: 28,
        mobileImageFocalY: 50,
      },
    },

    HomeEndcapSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        _g_button: createFieldGroup("按钮设置"),
        buttonLabel: { type: "text", label: "Button Label" },
        buttonHref: { type: "text", label: "Button Href" },
      },
      defaultProps: {
        eyebrow: "NEXT STEP",
        title: "Ready to start a project?",
        description: "Let's create something amazing together.",
        buttonLabel: "About Me",
        buttonHref: "/about",
      },
    },

} satisfies ComponentDefinitionRegistry;
