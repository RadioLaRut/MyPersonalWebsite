import type { Config } from "@puckeditor/core";
import HeroHeadlineBlock from "@/components/common/HeroHeadlineBlock";
import ImagePanel from "@/components/breakdowns/ImagePanel";
import TextSplitLayout from "@/components/breakdowns/TextSplitLayout";
import RichParagraphBlock from "@/components/common/RichParagraphBlock";
import StatementBlock from "@/components/transitions/StatementBlock";
import HeroSection from "@/components/home/HeroSection";
import HomeEndcapSection from "@/components/home/HomeEndcapSection";
import { createFieldGroup } from "@/puck/fields/field-groups";
import {
  buildImageFieldTriple,
  castImageFitMode,
  castImagePreset,
  imageFitModeField,
  imagePresetField,
} from "@/puck/fields/image-fields";
import { castSelectValue } from "@/puck/fields/select-fields";
import { ALLOW_TEXT_PARAGRAPH_BLOCK, pickEntryField, readSlot, toEditorAwareHref } from "./shared";

const heroHeadlineImageFields = buildImageFieldTriple("heroImage", {
  defaultPreset: "ratio-21-9",
  fitModeLabel: "Image Fit Mode",
  presetLabel: "Image Preset",
  srcLabel: "Hero Image",
});

const textSplitImageFields = buildImageFieldTriple("imageSrc");
const STATEMENT_ALIGN_VALUES = ["left", "center", "right"] as const;
const STATEMENT_BACKGROUND_VALUES = ["black", "dark-gray"] as const;
const STATEMENT_MIN_HEIGHT_VALUES = ["small", "medium", "large"] as const;
const IMAGE_PANEL_VARIANT_VALUES = ["content", "large", "fullscreen"] as const;
const TEXT_SPLIT_LAYOUT_VALUES = ["split-left", "split-right", "stack"] as const;

// TODO(component-lab): defaultProps 中的字面量文案与图片路径需迁移到 ComponentLab 预设链路，当前为兼容历史 JSON 暂留。
export const layoutComponents = {
    StatementBlock: {
      fields: {
        _g_content: createFieldGroup("文本内容"),
        content: { type: "textarea", contentEditable: true, label: "Content" },
        _g_style: createFieldGroup("样式设置"),
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
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
        align: "center",
        backgroundColor: "black",
        minHeight: "medium",
      },
      render: ({ content, align, backgroundColor, minHeight, editMode }) => (
        <StatementBlock
          content={content}
          align={castSelectValue(align, STATEMENT_ALIGN_VALUES, "center")}
          backgroundColor={castSelectValue(backgroundColor, STATEMENT_BACKGROUND_VALUES, "black")}
          minHeight={castSelectValue(minHeight, STATEMENT_MIN_HEIGHT_VALUES, "medium")}
          editMode={editMode}
        />
      ),
    },

    // 兼容历史 JSON 中的 Puck 组件类型名。
    HeroHeadline: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", contentEditable: true, label: "Eyebrow" },
        title: { type: "text", contentEditable: true, label: "Title" },
        subtitle: { type: "textarea", contentEditable: true, label: "Subtitle" },
        _g_image: createFieldGroup("Hero 图片"),
        ...heroHeadlineImageFields.fields,
        _g_link: createFieldGroup("导航链接"),
        navLink: { type: "text", label: "Nav Link" },
        navLinkLabel: { type: "text", contentEditable: true, label: "Nav Link Label" },
      },
      defaultProps: {
        eyebrow: "PROJECT",
        title: "PROJECT TITLE",
        subtitle: "Add a short project summary.",
        ...heroHeadlineImageFields.defaults,
        navLink: "",
        navLinkLabel: "观看视频",
      },
      render: ({ eyebrow, title, subtitle, heroImage, heroImagePreset, heroImageFitMode, navLink, navLinkLabel, editMode }) =>
        (
          <HeroHeadlineBlock
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            heroImage={heroImage}
            heroImagePreset={castImagePreset(heroImagePreset)}
            heroImageFitMode={castImageFitMode(heroImageFitMode)}
            navLink={toEditorAwareHref(navLink, editMode)}
            navLinkLabel={navLinkLabel}
            editMode={editMode}
          />
        ),
    },
    RichParagraph: {
      fields: {
        content: { type: "textarea", contentEditable: true, label: "Content" },
      },
      defaultProps: {
        content: "Enter your paragraph text here.",
      },
      render: ({ content }) => <RichParagraphBlock content={content} />,
    },
    ImagePanel: {
      fields: {
        _g_image: createFieldGroup("图片"),
        src: { type: "text", label: "Image Source" },
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
      render: ({ src, alt, caption, preset, fitMode, variant }) => {
        return (
          <ImagePanel
            src={src}
            alt={alt}
            caption={caption}
            preset={castImagePreset(preset)}
            fitMode={castImageFitMode(fitMode)}
            variant={castSelectValue(variant, IMAGE_PANEL_VARIANT_VALUES, "content")}
          />
        );
      },
    },

    TextSplitLayout: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        heading: { type: "text", contentEditable: true, label: "Heading" },
        paragraphs: { type: "slot", label: "Paragraphs" },
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
      render: ({ heading, paragraphs, imageSrc, imagePreset, imageFitMode, layoutVariant }) => {
        const { items: paragraphItems = [], SlotComponent: ParagraphsSlot } = readSlot(
          paragraphs,
          (item) => pickEntryField(item, "text") ?? "",
        );

        return (
          <TextSplitLayout
            heading={heading}
            paragraphs={paragraphItems}
            paragraphsContent={ParagraphsSlot ? <ParagraphsSlot allow={ALLOW_TEXT_PARAGRAPH_BLOCK} className="space-y-6" minEmptyHeight={24} /> : undefined}
            imageSrc={imageSrc}
            imagePreset={castImagePreset(imagePreset)}
            imageFitMode={castImageFitMode(imageFitMode)}
            layoutVariant={castSelectValue(layoutVariant, TEXT_SPLIT_LAYOUT_VALUES, "split-left")}
          />
        );
      }
    },

    HeroSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", contentEditable: true, label: "Eyebrow" },
        title: { type: "text", contentEditable: true, label: "Title" },
        positioning: { type: "text", contentEditable: true, label: "定位文案" },
        subtitle: { type: "text", contentEditable: true, label: "Subtitle" },
        description: { type: "textarea", contentEditable: true, label: "Description" },
        _g_cta: createFieldGroup("行动按钮 (CTA)"),
        primaryCtaLabel: { type: "text", contentEditable: true, label: "Primary CTA Label" },
        primaryCtaHref: { type: "text", label: "Primary CTA Href" },
        secondaryCtaLabel: { type: "text", contentEditable: true, label: "Secondary CTA Label" },
        secondaryCtaHref: { type: "text", label: "Secondary CTA Href" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: { type: "text", label: "Image Source" },
        imageAlt: { type: "text", label: "Image Alt" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        mobileImageFocalX: { type: "number", label: "移动端焦点 X (%)" },
        mobileImageFocalY: { type: "number", label: "移动端焦点 Y (%)" },
      },
      defaultProps: {
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
      render: ({ eyebrow, title, positioning, subtitle, description, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, imageSrc, imageAlt, imagePreset, imageFitMode, mobileImageFocalX, mobileImageFocalY, editMode }) => (
        <HeroSection
          eyebrow={eyebrow}
          title={title}
          positioning={positioning}
          subtitle={subtitle}
          description={description}
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaHref={toEditorAwareHref(primaryCtaHref, editMode)}
          secondaryCtaLabel={secondaryCtaLabel}
          secondaryCtaHref={toEditorAwareHref(secondaryCtaHref, editMode)}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          mobileImageFocalX={mobileImageFocalX}
          mobileImageFocalY={mobileImageFocalY}
          editMode={editMode}
        />
      )
    },

    HomeEndcapSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", contentEditable: true, label: "Eyebrow" },
        title: { type: "text", contentEditable: true, label: "Title" },
        description: { type: "textarea", contentEditable: true, label: "Description" },
        _g_button: createFieldGroup("按钮设置"),
        buttonLabel: { type: "text", contentEditable: true, label: "Button Label" },
        buttonHref: { type: "text", label: "Button Href" },
      },
      defaultProps: {
        eyebrow: "NEXT STEP",
        title: "Ready to start a project?",
        description: "Let's create something amazing together.",
        buttonLabel: "About Me",
        buttonHref: "/about",
      },
      render: ({ eyebrow, title, description, buttonLabel, buttonHref, editMode }) => (
        <HomeEndcapSection
          eyebrow={eyebrow}
          title={title}
          description={description}
          buttonLabel={buttonLabel}
          buttonHref={toEditorAwareHref(buttonHref, editMode) ?? "/works"}
          editMode={editMode}
        />
      ),
    },

} satisfies Config["components"];
