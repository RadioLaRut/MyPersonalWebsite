/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import type { Config } from "@measured/puck";
import { PresetImage } from "../components/common/PresetImage";
import BilingualText from "../components/common/BilingualText";
import HighDensityInfoBlock from "../components/breakdowns/HighDensityInfoBlock";
import BreakdownTriptych from "../components/breakdowns/BreakdownTriptych";
import ImageSlider from "../components/breakdowns/ImageSlider";
import ContentCard from "../components/breakdowns/ContentCard";
import ImagePanel from "../components/breakdowns/ImagePanel";
import ParameterGrid from "../components/breakdowns/ParameterGrid";
import TextSplitLayout from "../components/breakdowns/TextSplitLayout";
import BreakdownSectionHeadline from "../components/breakdowns/BreakdownHeadline";
import ContactFlashlightBlock from "../components/blocks/ContactFlashlightBlock";
import StatementBlock from "../components/transitions/StatementBlock";
import ProjectSection from "../components/home/ProjectSection";
import HeroSection from "../components/home/HeroSection";
import HomeEndcapSection from "../components/home/HomeEndcapSection";
import NextProjectBlock from "../components/blocks/NextProjectBlock";
import LightingCollectionHeader from "../components/works/LightingCollectionHeader";
import LightingProjectCard from "../components/works/LightingProjectCard";
import PortfolioHeroHeader from "../components/works/PortfolioHeroHeader";
import WorksList from "../components/works/WorksList";
import WorksListEntry from "../components/works/WorksListEntry";
import MetadataListItem from "../components/common/MetadataListItem";
import TextParagraphBlock from "../components/common/TextParagraphBlock";
import { CANONICAL_PLACEHOLDER_PATH, toAdminPathFromPublicPath, normalizeLegacyPublicPath } from "@/lib/public-paths";
import { resolveEditableText, toPlainText } from "@/lib/editable-text";
import { createFieldGroup } from "@/puck/fields/field-groups";
import { imagePresetField, imageFitModeField } from "@/puck/fields/image-fields";

/**
 * 编辑器链接转换工具
 * 根据编辑模式转换链接路径
 */
function toEditorAwareHref(href: string | undefined, editMode?: boolean): string | undefined {
  if (!href || !href.startsWith("/")) {
    return href;
  }

  const normalizedHref = normalizeLegacyPublicPath(href);

  if (editMode) {
    return toAdminPathFromPublicPath(normalizedHref);
  }

  return normalizedHref;
}

function renderHeroHeadlineBlock({
  eyebrow,
  title,
  subtitle,
  heroImage,
  heroImagePreset,
  heroImageFitMode,
  navLink,
  editMode,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  heroImage?: string;
  heroImagePreset?: string;
  heroImageFitMode?: string;
  navLink?: string;
  editMode?: boolean;
}) {
  const resolvedEyebrow = resolveEditableText(eyebrow, "PROJECT");
  const resolvedTitle = resolveEditableText(title, "PROJECT TITLE");
  const resolvedSubtitle = resolveEditableText(subtitle, "Add a short project summary.");
  const resolvedHeroImage = typeof heroImage === "string" ? heroImage.trim() : "";
  const heroImageAlt = toPlainText(title) ?? "PROJECT TITLE";

  if (editMode) {
    return (
      <section className="relative isolate w-full min-h-[560px] overflow-hidden border-y border-white/5 bg-black">
        <div className="absolute inset-0">
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            sizes="100vw"
            priority
            lockFrame={false}
            frameClassName="h-full w-full opacity-65"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.68)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[560px] items-end py-16 md:py-20">
          <div className="grid-container w-full">
            <div className="col-start-2 col-span-10 flex flex-col items-start gap-4 lg:gap-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-textMuted">
                {resolvedEyebrow}
              </span>
              <h1 className="text-white text-[12vw] sm:text-[7vw] font-black tracking-normal uppercase leading-[0.85] font-futura">
                {resolvedTitle}
              </h1>
              <p className="max-w-3xl text-sm font-medium leading-loose tracking-wide text-textPrimary md:text-base font-futura">
                {resolvedSubtitle}
              </p>
              {navLink ? (
                <div className="mt-4 border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.24em] text-textPrimary font-mono">
                  播放演示视频 (Bilibili)
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <header className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black">
      {resolvedHeroImage ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <PresetImage
            src={resolvedHeroImage}
            alt={heroImageAlt}
            preset={heroImagePreset}
            fitMode={heroImageFitMode}
            sizes="100vw"
            priority
            frameClassName="w-full opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_140%)] pointer-events-none" />
        </div>
      ) : null}

      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-24 md:pb-32 pointer-events-none">
        <div className="grid-container w-full mix-blend-difference pointer-events-auto">
          <div className="col-start-2 col-span-10 flex flex-col items-start gap-4">
            {resolvedEyebrow ? (
              <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase text-textMuted">
                {resolvedEyebrow}
              </span>
            ) : null}
            {resolvedTitle ? (
              <h1 className="text-white text-[12vw] sm:text-[7vw] font-black tracking-normal uppercase leading-[0.85] font-futura">
                {resolvedTitle}
              </h1>
            ) : null}
            {resolvedSubtitle ? (
              <p className="text-textPrimary text-sm md:text-base font-medium leading-loose font-futura tracking-wide max-w-3xl">
                {resolvedSubtitle}
              </p>
            ) : null}
            {navLink ? (
              <a
                href={navLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 border border-white/30 px-6 py-3 text-xs tracking-widest hover:bg-white hover:text-black transition-colors uppercase font-mono interactive mix-blend-normal"
              >
                播放演示视频 (Bilibili)
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export const config: Config = {
  categories: {
    layout: {
      title: "基础布局",
      components: [
        "HeroSection",
        "HeroHeadline",
        "StatementBlock",
        "TextSplitLayout",
        "HomeEndcapSection",
        "RichParagraph",
        "ImagePanel",
      ],
    },
    works: {
      title: "作品展示",
      components: [
        "PortfolioHeroHeader",
        "ProjectSection",
        "WorksList",
        "WorksListEntry",
        "ContentCard",
        "ParameterGrid",
        "HighDensityInfoBlock",
        "ImageSlider",
        "BreakdownHeadline",
        "BreakdownTriptych",
        "NextProjectBlock",
      ],
    },
    lighting: {
      title: "灯光作品特供",
      components: [
        "LightingCollectionHeader",
        "LightingProjectCard",
      ],
    },
    contact: {
      title: "关于与联系",
      components: [
        "ContactFlashlight",
        "MetadataListItem",
        "TextParagraphBlock",
      ],
    },
  },
  components: {
    // --------------------------------------------------------
    // Transition Components
    // --------------------------------------------------------
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
          align={align as any}
          backgroundColor={backgroundColor as any}
          minHeight={minHeight as any}
          editMode={editMode}
        />
      ),
    },

    // --------------------------------------------------------
    // Basic Layout Components
    // --------------------------------------------------------
    // Legacy Puck type name kept for existing JSON content.
    HeroHeadline: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", contentEditable: true, label: "Eyebrow" },
        title: { type: "text", contentEditable: true, label: "Title" },
        subtitle: { type: "textarea", contentEditable: true, label: "Subtitle" },
        _g_image: createFieldGroup("Hero 图片"),
        heroImage: { type: "text", label: "Hero Image" },
        heroImagePreset: { ...imagePresetField, label: "Image Preset" },
        heroImageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        _g_link: createFieldGroup("导航链接"),
        navLink: { type: "text", label: "Nav Link" },
      },
      defaultProps: {
        eyebrow: "PROJECT",
        title: "PROJECT TITLE",
        subtitle: "Add a short project summary.",
        heroImage: "",
        heroImagePreset: "ratio-21-9",
        heroImageFitMode: "x",
        navLink: "",
      },
      render: ({ eyebrow, title, subtitle, heroImage, heroImagePreset, heroImageFitMode, navLink, editMode }) =>
        renderHeroHeadlineBlock({ eyebrow, title, subtitle, heroImage, heroImagePreset, heroImageFitMode, navLink, editMode }),
    },
    RichParagraph: {
      fields: {
        content: { type: "textarea", contentEditable: true, label: "Content" },
      },
      defaultProps: {
        content: "Enter your paragraph text here.",
      },
      render: ({ content }) => {
        return (
          <article className="w-full py-24 md:py-32 relative z-20 bg-black">
            <div className="grid-container w-full">
              <div className="col-start-3 col-span-8">
                <p className="text-xl md:text-[24px] leading-loose text-textPrimary text-justify tracking-wide">
                  <BilingualText text={content} weight="medium" />
                </p>
              </div>
            </div>
          </article>
        );
      },
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
            preset={preset as any}
            fitMode={fitMode as any}
            variant={variant as any}
          />
        );
      },
    },

    // --------------------------------------------------------
    // Advanced UI Breakdown Components
    // --------------------------------------------------------
    // Legacy Puck type name kept for existing JSON content.
    BreakdownHeadline: {
      fields: {
        title: { type: "text", contentEditable: true, label: "Title" }
      },
      defaultProps: {
        title: ""
      },
      render: ({ title }) => <BreakdownSectionHeadline title={title} />
    },

    ImageSlider: {
      fields: {
        _g_images: createFieldGroup("对比图片"),
        unlitSrc: { type: "text", label: "Unlit Source" },
        litSrc: { type: "text", label: "Lit Source" },
        alt: { type: "text", label: "Alt Text" },
        _g_display: createFieldGroup("显示设置"),
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        _g_labels: createFieldGroup("标签文字"),
        leftLabel: { type: "text", label: "Left Label" },
        rightLabel: { type: "text", label: "Right Label" },
      },
      defaultProps: {
        unlitSrc: "/images/train-station/2Day.webp",
        litSrc: "/images/train-station/2Night.webp",
        alt: "Lighting Comparison",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
      },
      render: ({ unlitSrc, litSrc, alt, imagePreset, imageFitMode, leftLabel, rightLabel }) => (
        <ImageSlider
          unlitSrc={unlitSrc}
          litSrc={litSrc}
          alt={alt}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
        />
      )
    },

    ContentCard: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", contentEditable: true, label: "Title" },
        description: { type: "textarea", contentEditable: true, label: "Description" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: { type: "text", label: "Image Source" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        _g_layout: createFieldGroup("标签与布局"),
        tags: {
          type: "array",
          arrayFields: { tag: { type: "text", label: "Tag" } },
          label: "Tags",
          getItemSummary: (item) => item.tag || "Empty Tag",
        },
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
        imageSrc: "",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        tags: [] as any,
        imagePosition: "right",
      },
      render: ({ title, description, imageSrc, imagePreset, imageFitMode, tags, imagePosition }) => (
        <ContentCard
          title={title}
          description={description}
          imageSrc={imageSrc}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          tags={(tags as any)?.map((t: any) => t.tag)}
          imagePosition={imagePosition as any}
        />
      )
    },
    BreakdownTriptych: {
      fields: {
        _g_col1: createFieldGroup("列 1"),
        col1Title: { type: "text", contentEditable: true, label: "Column 1 Title" },
        col1Text: { type: "textarea", contentEditable: true, label: "Column 1 Text" },
        col1Img: { type: "text", label: "Column 1 Image" },
        col1Preset: { ...imagePresetField, label: "Column 1 Preset" },
        col1FitMode: { ...imageFitModeField, label: "Column 1 Fit Mode" },
        _g_col2: createFieldGroup("列 2"),
        col2Title: { type: "text", contentEditable: true, label: "Column 2 Title" },
        col2Text: { type: "textarea", contentEditable: true, label: "Column 2 Text" },
        col2Img: { type: "text", label: "Column 2 Image" },
        col2Preset: { ...imagePresetField, label: "Column 2 Preset" },
        col2FitMode: { ...imageFitModeField, label: "Column 2 Fit Mode" },
        _g_col3: createFieldGroup("列 3"),
        col3Title: { type: "text", contentEditable: true, label: "Column 3 Title" },
        col3Text: { type: "textarea", contentEditable: true, label: "Column 3 Text" },
        col3Img: { type: "text", label: "Column 3 Image" },
        col3Preset: { ...imagePresetField, label: "Column 3 Preset" },
        col3FitMode: { ...imageFitModeField, label: "Column 3 Fit Mode" },
      },
      defaultProps: {
        col1Title: "",
        col1Text: "",
        col1Img: "",
        col1Preset: "ratio-16-9",
        col1FitMode: "x",
        col2Title: "",
        col2Text: "",
        col2Img: "",
        col2Preset: "ratio-16-9",
        col2FitMode: "x",
        col3Title: "",
        col3Text: "",
        col3Img: "",
        col3Preset: "ratio-16-9",
        col3FitMode: "x",
      },
      render: ({
        col1Title,
        col1Text,
        col1Img,
        col1Preset,
        col1FitMode,
        col2Title,
        col2Text,
        col2Img,
        col2Preset,
        col2FitMode,
        col3Title,
        col3Text,
        col3Img,
        col3Preset,
        col3FitMode,
      }) => (
        <BreakdownTriptych
          col1Title={col1Title}
          col1Text={col1Text}
          col1Img={col1Img}
          col1Preset={col1Preset as any}
          col1FitMode={col1FitMode as any}
          col2Title={col2Title}
          col2Text={col2Text}
          col2Img={col2Img}
          col2Preset={col2Preset as any}
          col2FitMode={col2FitMode as any}
          col3Title={col3Title}
          col3Text={col3Text}
          col3Img={col3Img}
          col3Preset={col3Preset as any}
          col3FitMode={col3FitMode as any}
        />
      )
    },

    ParameterGrid: {
      fields: {
        _g_media: createFieldGroup("媒体配置"),
        mediaSrc: { type: "text", label: "Media Source" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
        isVideo: {
          type: "select",
          label: "Is Video",
          options: [
            { label: "Image", value: "false" },
            { label: "Video", value: "true" }
          ]
        },
        _g_params: createFieldGroup("参数列表"),
        parameters: {
          type: "array",
          label: "Parameters",
          getItemSummary: (item) => item.name || "Unnamed Parameter",
          arrayFields: {
            name: { type: "text", label: "Name" },
            value: { type: "text", label: "Value" },
            description: { type: "textarea", label: "Description" }
          }
        }
      },
      defaultProps: {
        mediaSrc: "",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        isVideo: "false",
        parameters: [] as any
      },
      render: ({ mediaSrc, imagePreset, imageFitMode, isVideo, parameters }) => (
        <ParameterGrid
          mediaSrc={mediaSrc}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          isVideo={isVideo === "true"}
          parameters={parameters as any}
        />
      )
    },

    TextSplitLayout: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        heading: { type: "text", contentEditable: true, label: "Heading" },
        paragraphs: { type: "slot", label: "Paragraphs" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: { type: "text", label: "Image Source" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
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
        paragraphs: [] as any,
        imageSrc: "",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        layoutVariant: "split-left"
      },
      render: ({ heading, paragraphs, imageSrc, imagePreset, imageFitMode, layoutVariant }) => {
        const paragraphItems = Array.isArray(paragraphs)
          ? (paragraphs as any[]).map((item) => item?.props?.text ?? item?.text ?? "")
          : [];
        const ParagraphsSlot = Array.isArray(paragraphs) ? null : (paragraphs as any);

        return (
          <TextSplitLayout
            heading={heading}
            paragraphs={paragraphItems}
            paragraphsContent={ParagraphsSlot ? <ParagraphsSlot allow={["TextParagraphBlock"]} className="space-y-6" minEmptyHeight={24} /> : undefined}
            imageSrc={imageSrc}
            imagePreset={imagePreset as any}
            imageFitMode={imageFitMode as any}
            layoutVariant={layoutVariant as any}
          />
        );
      }
    },

    HighDensityInfoBlock: {
      fields: {
        _g_phase1: createFieldGroup("阶段 1"),
        phase1Label: { type: "text", contentEditable: true, label: "Phase 1 Label" },
        phase1Title: { type: "text", contentEditable: true, label: "Phase 1 Title" },
        phase1Subtitle: { type: "text", contentEditable: true, label: "Phase 1 Subtitle" },
        phase1Content: { type: "textarea", contentEditable: true, label: "Phase 1 Content" },
        phase1Items: { type: "slot", label: "Phase 1 Items" },
        _g_phase2: createFieldGroup("阶段 2"),
        phase2Label: { type: "text", contentEditable: true, label: "Phase 2 Label" },
        phase2Title: { type: "text", contentEditable: true, label: "Phase 2 Title" },
        phase2Subtitle: { type: "text", contentEditable: true, label: "Phase 2 Subtitle" },
        phase2Content: { type: "textarea", contentEditable: true, label: "Phase 2 Content" },
        phase2Items: { type: "slot", label: "Phase 2 Items" },
        _g_phase3: createFieldGroup("阶段 3"),
        phase3Label: { type: "text", contentEditable: true, label: "Phase 3 Label" },
        phase3Title: { type: "text", contentEditable: true, label: "Phase 3 Title" },
        phase3Subtitle: { type: "text", contentEditable: true, label: "Phase 3 Subtitle" },
        phase3Content: { type: "textarea", contentEditable: true, label: "Phase 3 Content" },
        phase3ImageSrc: { type: "text", label: "Phase 3 Image Source" },
        phase3ImagePreset: { ...imagePresetField, label: "Phase 3 Image Preset" },
        phase3ImageFitMode: { ...imageFitModeField, label: "Phase 3 Image Fit Mode" },
      },
      defaultProps: {
        phase1Label: "",
        phase1Title: "",
        phase1Subtitle: "",
        phase1Content: "",
        phase1Items: [] as any,
        phase2Label: "",
        phase2Title: "",
        phase2Subtitle: "",
        phase2Content: "",
        phase2Items: [] as any,
        phase3Label: "",
        phase3Title: "",
        phase3Subtitle: "",
        phase3Content: "",
        phase3ImageSrc: "",
        phase3ImagePreset: "ratio-16-9",
        phase3ImageFitMode: "x",
      },
      render: (props) => {
        const phase1FallbackItems = Array.isArray(props.phase1Items)
          ? (props.phase1Items as any[]).map((item) => ({
            label: item?.props?.label ?? item?.label ?? "",
            value: item?.props?.value ?? item?.value ?? "",
          }))
          : undefined;
        const phase2FallbackItems = Array.isArray(props.phase2Items)
          ? (props.phase2Items as any[]).map((item) => ({
            label: item?.props?.label ?? item?.label ?? "",
            value: item?.props?.value ?? item?.value ?? "",
          }))
          : undefined;
        const Phase1ItemsSlot = Array.isArray(props.phase1Items) ? null : (props.phase1Items as any);
        const Phase2ItemsSlot = Array.isArray(props.phase2Items) ? null : (props.phase2Items as any);

        // Construct the phase objects required by the component
        const phase1 = {
          label: props.phase1Label,
          title: props.phase1Title,
          subtitle: props.phase1Subtitle,
          content: props.phase1Content,
          items: phase1FallbackItems,
        };
        const phase2 = {
          label: props.phase2Label,
          title: props.phase2Title,
          subtitle: props.phase2Subtitle,
          content: props.phase2Content,
          items: phase2FallbackItems,
        };
        const phase3 = {
          label: props.phase3Label,
          title: props.phase3Title,
          subtitle: props.phase3Subtitle,
          content: props.phase3Content,
          imageSrc: props.phase3ImageSrc,
          imagePreset: props.phase3ImagePreset,
          imageFitMode: props.phase3ImageFitMode,
        };
        return (
          <HighDensityInfoBlock
            phase1={phase1}
            phase2={phase2}
            phase3={phase3}
            phase1ItemsContent={Phase1ItemsSlot ? <Phase1ItemsSlot allow={["MetadataListItem"]} className="space-y-3" minEmptyHeight={20} /> : undefined}
            phase2ItemsContent={Phase2ItemsSlot ? <Phase2ItemsSlot allow={["MetadataListItem"]} className="space-y-3" minEmptyHeight={20} /> : undefined}
          />
        );
      }
    },

    ProjectSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", contentEditable: true, label: "Title" },
        subtitle: { type: "text", contentEditable: true, label: "Subtitle" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: { type: "text", label: "Image Source" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
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
        imageSrc: "",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        link: "",
        index: 0,
        align: "auto",
      },
      render: ({ title, subtitle, imageSrc, imagePreset, imageFitMode, link, index, align, editMode }) => (
        <ProjectSection
          title={title}
          subtitle={subtitle}
          imageSrc={imageSrc}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          link={toEditorAwareHref(link, editMode)}
          index={index}
          align={align as "auto" | "left" | "right" | undefined}
          editMode={editMode}
        />
      )
    },

    HeroSection: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        eyebrow: { type: "text", contentEditable: true, label: "Eyebrow" },
        title: { type: "text", contentEditable: true, label: "Title" },
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
      },
      defaultProps: {
        eyebrow: "LIGHTING / TECH ART / GAME DESIGN",
        title: "JIANG CHENGYAN",
        subtitle: "PORTFOLIO",
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
      render: ({ eyebrow, title, subtitle, description, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref, imageSrc, imageAlt, imagePreset, imageFitMode, editMode }) => (
        <HeroSection
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          description={description}
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaHref={toEditorAwareHref(primaryCtaHref, editMode)}
          secondaryCtaLabel={secondaryCtaLabel}
          secondaryCtaHref={toEditorAwareHref(secondaryCtaHref, editMode)}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
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

    PortfolioHeroHeader: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", contentEditable: true, label: "Title" },
        subtitle: { type: "text", contentEditable: true, label: "Subtitle" },
        descriptionLine1: { type: "text", contentEditable: true, label: "Description Line 1" },
        descriptionLine2: { type: "text", contentEditable: true, label: "Description Line 2" },
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
      render: ({ title, subtitle, descriptionLine1, descriptionLine2, ctaLabel, ctaHref, editMode }) => (
        <PortfolioHeroHeader
          title={title}
          subtitle={subtitle}
          descriptionLine1={descriptionLine1}
          descriptionLine2={descriptionLine2}
          ctaLabel={ctaLabel}
          ctaHref={toEditorAwareHref(ctaHref, editMode)}
          editMode={editMode}
        />
      )
    },

    LightingProjectCard: {
      fields: {
        number: { type: "text", contentEditable: true, label: "Number" },
        title: { type: "text", contentEditable: true, label: "Title" },
        coverImage: { type: "text", label: "Cover Image" },
        href: { type: "text", label: "Href" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
      },
      defaultProps: {
        number: "01",
        title: "Collection Title",
        coverImage: CANONICAL_PLACEHOLDER_PATH,
        href: "/works/lighting-portfolio/collection-1",
        imagePreset: "ratio-21-9",
        imageFitMode: "cover",
      },
      render: ({ number, title, coverImage, href, imagePreset, imageFitMode, editMode }) => (
        <LightingProjectCard
          number={number}
          title={title}
          coverImage={coverImage}
          href={toEditorAwareHref(href, editMode)}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          editMode={editMode}
        />
      ),
    },

    WorksList: {
      fields: {
        heading: { type: "text", contentEditable: true, label: "Heading" },
        entries: { type: "slot", label: "Entries" }
      },
      defaultProps: {
        heading: "",
        entries: [] as any
      },
      render: ({ heading, entries, editMode }) => {
        const fallbackWorks = Array.isArray(entries)
          ? (entries as any[]).map((entry) => ({
            id: entry?.props?.id ?? entry?.id ?? "",
            number: entry?.props?.number ?? entry?.number,
            href: toEditorAwareHref(entry?.props?.href ?? entry?.href, editMode),
            title: entry?.props?.title ?? entry?.title ?? "",
            category: entry?.props?.category ?? entry?.category ?? "",
            imageSrc: entry?.props?.imageSrc ?? entry?.imageSrc ?? CANONICAL_PLACEHOLDER_PATH,
            imagePreset: entry?.props?.imagePreset ?? entry?.imagePreset ?? "ratio-21-9",
            imageFitMode: entry?.props?.imageFitMode ?? entry?.imageFitMode ?? "x",
            desc: entry?.props?.desc ?? entry?.desc ?? "",
          }))
          : [];
        const EntriesSlot = Array.isArray(entries) ? null : (entries as any);

        return (
          <WorksList
            heading={heading}
            works={fallbackWorks}
            entriesContent={EntriesSlot ? <EntriesSlot allow={["WorksListEntry"]} className="flex flex-col w-full" minEmptyHeight={48} /> : undefined}
            editMode={editMode}
          />
        );
      }
    },

    WorksListEntry: {
      fields: {
        _g_info: createFieldGroup("基本信息"),
        number: { type: "text", contentEditable: true, label: "Number" },
        href: { type: "text", label: "Href" },
        title: { type: "text", contentEditable: true, label: "Title" },
        category: { type: "text", label: "Category" },
        desc: { type: "textarea", label: "Description" },
        _g_image: createFieldGroup("图片配置"),
        imageSrc: { type: "text", label: "Image Source" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
      },
      defaultProps: {
        number: "",
        href: "",
        title: "",
        category: "",
        imageSrc: "",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        desc: "",
      },
      render: ({ id, number, href, title, category, imageSrc, imagePreset, imageFitMode, desc, editMode }) => (
        <WorksListEntry
          id={id}
          number={number}
          href={toEditorAwareHref(href, editMode)}
          title={title}
          category={category}
          imageSrc={imageSrc}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          desc={desc}
          editMode={editMode}
        />
      ),
    },

    NextProjectBlock: {
      fields: {
        _g_info: createFieldGroup("项目信息"),
        nextId: { type: "text", label: "Next ID" },
        nextName: { type: "text", label: "Next Name" },
        _g_image: createFieldGroup("图片配置"),
        nextBg: { type: "text", label: "Next Background" },
        imagePreset: { ...imagePresetField, label: "Image Preset" },
        imageFitMode: { ...imageFitModeField, label: "Image Fit Mode" },
      },
      defaultProps: {
        nextId: "penguin",
        nextName: "PENGUIN TRADING CO.",
        nextBg: "/images/penguin/CyberRestaurant.webp",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
      },
      render: ({ nextId, nextName, nextBg, imagePreset, imageFitMode, editMode }) => (
        <NextProjectBlock
          nextId={nextId}
          nextName={nextName}
          nextBg={nextBg}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          href={toEditorAwareHref(`/works/${nextId}`, editMode)}
        />
      )
    },
    LightingCollectionHeader: {
      fields: {
        title: { type: "text", label: "Title" },
        number: { type: "text", label: "Number" },
        description: { type: "textarea", label: "Description" },
        backHref: { type: "text", label: "Back Href" },
      },
      defaultProps: {
        title: "CITY ADD",
        number: "01",
        description: "A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for city add.",
        backHref: "/works/lighting-portfolio",
      },
      render: ({ title, number, description, backHref, editMode }) => (
        <LightingCollectionHeader
          title={title}
          number={number}
          description={description}
          backHref={toEditorAwareHref(backHref, editMode)}
        />
      ),
    },

    // --------------------------------------------------------
    // Black Box Special Effect Blocks
    // --------------------------------------------------------
    ContactFlashlight: {
      fields: {
        _g_fx: createFieldGroup("视觉效果"),
        maskRadius: { type: "number", label: "Mask Radius" },
        maskSmoothness: { type: "number", label: "Mask Smoothness" },
        darkTextColor: { type: "text", label: "Dark Text Color" },
        lightTextColor: { type: "text", label: "Light Text Color" },
        _g_identity: createFieldGroup("个人信息"),
        name: { type: "text", contentEditable: true, label: "Name" },
        taglineText: { type: "text", contentEditable: true, label: "Tagline Text" },
        taglineSub: { type: "text", contentEditable: true, label: "Tagline Sub" },
        _g_contact: createFieldGroup("联系方式"),
        email: { type: "text", contentEditable: true, label: "Email" },
        wechat: { type: "text", contentEditable: true, label: "WeChat" },
        _g_slots: createFieldGroup("内容槽"),
        experienceHistory: { type: "slot", label: "Experience History" },
        creativeDirection: { type: "slot", label: "Creative Direction" }
      },
      defaultProps: {
        maskRadius: 500,
        maskSmoothness: 40,
        darkTextColor: "rgba(255,255,255,0.4)",
        lightTextColor: "rgba(255,255,255,1)",
        name: "JIANG CHENGYAN",
        taglineText: "艺术与科技 / 交互叙事设计 / 游戏设计",
        taglineSub: "CUC '2028",
        email: "hello@example.com",
        wechat: "wechat_id",
        experienceHistory: [] as any,
        creativeDirection: [] as any
      },
      render: ({
        maskRadius,
        maskSmoothness,
        darkTextColor,
        lightTextColor,
        name,
        taglineText,
        taglineSub,
        email,
        wechat,
        experienceHistory,
        creativeDirection,
      }) => {
        const ExperienceSlot = Array.isArray(experienceHistory) ? null : (experienceHistory as any);
        const CreativeSlot = Array.isArray(creativeDirection) ? null : (creativeDirection as any);

        return (
          <ContactFlashlightBlock
            maskRadius={maskRadius}
            maskSmoothness={maskSmoothness}
            darkTextColor={darkTextColor}
            lightTextColor={lightTextColor}
            name={name}
            taglineText={taglineText}
            taglineSub={taglineSub}
            email={email}
            wechat={wechat}
            experienceHistory={Array.isArray(experienceHistory)
              ? (experienceHistory as any[]).map((entry) => ({
                company: entry?.props?.company ?? entry?.company ?? entry?.props?.label ?? entry?.label ?? "",
                role: entry?.props?.role ?? entry?.role ?? entry?.props?.value ?? entry?.value ?? "",
              }))
              : undefined}
            creativeDirection={Array.isArray(creativeDirection)
              ? (creativeDirection as any[]).map((entry) => ({
                title: entry?.props?.title ?? entry?.title ?? entry?.props?.label ?? entry?.label ?? "",
                subtitle: entry?.props?.subtitle ?? entry?.subtitle ?? entry?.props?.value ?? entry?.value ?? "",
              }))
              : undefined}
            experienceContent={ExperienceSlot ? <ExperienceSlot allow={["MetadataListItem"]} className="space-y-6" minEmptyHeight={20} /> : undefined}
            creativeContent={CreativeSlot ? <CreativeSlot allow={["MetadataListItem"]} className="space-y-6" minEmptyHeight={20} /> : undefined}
          />
        );
      }
    },

    MetadataListItem: {
      fields: {
        label: { type: "text", contentEditable: true, label: "Label" },
        value: { type: "text", contentEditable: true, label: "Value" },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Start", value: "start" },
            { label: "End", value: "end" },
          ],
        },
      },
      defaultProps: {
        label: "Role",
        value: "Designer",
        align: "start",
      },
      render: ({ label, value, align }) => <MetadataListItem label={label} value={value} align={align as any} />,
    },

    TextParagraphBlock: {
      fields: {
        text: { type: "textarea", contentEditable: true, label: "Text" },
      },
      defaultProps: {
        text: "Sample paragraph text.",
      },
      render: ({ text }) => <TextParagraphBlock text={text} />,
    },

    // Contact items removed
  },
};

export default config;
