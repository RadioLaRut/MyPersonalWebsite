/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from "@measured/puck";
import { PresetImage } from "../components/common/PresetImage";
import BilingualText from "../components/common/BilingualText";
import HighDensityInfoBlock from "../components/breakdowns/HighDensityInfoBlock";
import BreakdownTriptych from "../components/breakdowns/BreakdownTriptych";
import ImageSlider from "../components/breakdowns/ImageSlider";
import MediaTextCard from "../components/breakdowns/MediaTextCard";
import GalleryItem from "../components/breakdowns/GalleryItem";
import ParameterGrid from "../components/breakdowns/ParameterGrid";
import TextSplitLayout from "../components/breakdowns/TextSplitLayout";
import BreakdownSectionHeadline from "../components/breakdowns/BreakdownHeadline";
import ContactFlashlightBlock from "../components/blocks/ContactFlashlightBlock";
import ContactDirectionItem from "../components/blocks/ContactDirectionItem";
import ContactExperienceItem from "../components/blocks/ContactExperienceItem";
import StatementBlock from "../components/transitions/StatementBlock";
import ProjectSection from "../components/home/ProjectSection";
import HeroSection from "../components/home/HeroSection";
import HomeEndcapSection from "../components/home/HomeEndcapSection";
import NextProjectBlock from "../components/blocks/NextProjectBlock";
import LightingCollectionHeader from "../components/works/LightingCollectionHeader";
import LightingCollectionItem from "../components/works/LightingCollectionItem";
import LightingProjectCard from "../components/works/LightingProjectCard";
import PortfolioHeroHeader from "../components/works/PortfolioHeroHeader";
import WorksList from "../components/works/WorksList";
import WorksListEntry from "../components/works/WorksListEntry";
import MetadataListItem from "../components/common/MetadataListItem";
import TextParagraphBlock from "../components/common/TextParagraphBlock";
import { CANONICAL_PLACEHOLDER_PATH, toAdminPathFromPublicPath, normalizeLegacyPublicPath } from "@/lib/public-paths";
import { IMAGE_FIT_MODE_OPTIONS, IMAGE_PRESET_OPTIONS } from "@/lib/image-presentation";

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

const imagePresetField = {
  type: "select" as const,
  options: IMAGE_PRESET_OPTIONS.map((option) => ({ ...option })),
};

const imageFitModeField = {
  type: "select" as const,
  options: IMAGE_FIT_MODE_OPTIONS.map((option) => ({ ...option })),
};

export const config: Config = {
  components: {
    // --------------------------------------------------------
    // Transition Components
    // --------------------------------------------------------
    StatementBlock: {
      fields: {
        content: { type: "textarea", contentEditable: true },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        backgroundColor: {
          type: "select",
          options: [
            { label: "Black", value: "black" },
            { label: "Dark Gray", value: "dark-gray" },
          ],
        },
        minHeight: {
          type: "select",
          options: [
            { label: "Small (20vh)", value: "small" },
            { label: "Medium (35vh)", value: "medium" },
            { label: "Large (50vh)", value: "large" },
          ],
        },
      },
      defaultProps: {
        content: "在这里输入过渡文字，用于在项目之间创造呼吸感。",
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
        eyebrow: { type: "text", contentEditable: true },
        title: { type: "text", contentEditable: true },
        subtitle: { type: "textarea", contentEditable: true },
        heroImage: { type: "text" },
        heroImagePreset: imagePresetField,
        heroImageFitMode: imageFitModeField,
        navLink: { type: "text" },
      },
      defaultProps: {
        eyebrow: "Portfolio",
        title: "Build your page with Puck",
        subtitle: "This is a local editor scaffold for the staged migration.",
        heroImage: "/images/train-station/2Day.webp",
        heroImagePreset: "ratio-21-9",
        heroImageFitMode: "x",
        navLink: "",
      },
      render: ({ eyebrow, title, subtitle, heroImage, heroImagePreset, heroImageFitMode, navLink }) => {
        return (
          <header className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black">
            {heroImage ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <PresetImage
                  src={heroImage}
                  alt={title}
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
                <div className="col-span-4 md:col-start-2 md:col-span-10 flex flex-col items-start gap-4">
                  <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/50">
                    {eyebrow}
                  </span>
                  <h1 className="text-white text-[12vw] sm:text-[7vw] font-black tracking-normal uppercase leading-[0.85] font-futura">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="text-white/75 text-sm md:text-base font-medium leading-[1.9] font-futura tracking-wide max-w-3xl">
                      {subtitle}
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
      },
    },
    BreakdownIntroHeader: {
      fields: {
        eyebrow: { type: "text", contentEditable: true },
        title: { type: "text", contentEditable: true },
        subtitle: { type: "textarea", contentEditable: true },
        heroImage: { type: "text" },
        navLink: { type: "text" },
      },
      defaultProps: {
        eyebrow: "Portfolio",
        title: "Build your page with Puck",
        subtitle: "This is a local editor scaffold for the staged migration.",
        heroImage: "/images/train-station/2Day.webp",
        navLink: "",
      },
      render: ({ eyebrow, title, subtitle, heroImage, navLink }) => {
        return config.components.HeroHeadline.render({ eyebrow, title, subtitle, heroImage, navLink } as never);
      },
    },
    RichParagraph: {
      fields: {
        content: { type: "textarea", contentEditable: true },
      },
      defaultProps: {
        content:
          "这一段用于承载完整的项目说明，既要说明设计判断，也要解释执行路径与结果反馈；当中文信息被拉长到四五行时，版面依然需要保持节奏、留白与网格秩序。 English copy should remain readable beside the Chinese paragraph so you can compare weight, rhythm, and spacing consistency in one block.",
      },
      render: ({ content }) => {
        return (
          <article className="w-full py-24 md:py-32 relative z-20 bg-black">
            <div className="grid-container w-full">
              <div className="col-span-4 md:col-start-3 md:col-span-8">
                <p className="text-xl md:text-[24px] leading-[2.2] text-white/90 text-justify tracking-wide">
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
        alt: { type: "text" },
        caption: { type: "text" },
        src: { type: "text" },
        preset: imagePresetField,
        fitMode: imageFitModeField,
      },
      defaultProps: {
        alt: "Puck image",
        caption: "Visual block",
        src: "/images/train-station/2Day.webp",
        preset: "ratio-16-9",
        fitMode: "x",
      },
      render: ({ alt, caption, src, preset, fitMode }) => {
        return (
          <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
            <figure className="overflow-hidden border border-white/15 bg-white/[0.03]">
              <PresetImage alt={alt} src={src} preset={preset} fitMode={fitMode} />
              {caption ? (
                <figcaption className="border-t border-white/15 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/70">
                  {caption}
                </figcaption>
              ) : null}
            </figure>
          </section>
        );
      },
    },

    // --------------------------------------------------------
    // Advanced UI Breakdown Components
    // --------------------------------------------------------
    // Legacy Puck type name kept for existing JSON content.
    BreakdownHeadline: {
      fields: {
        title: { type: "text", contentEditable: true }
      },
      defaultProps: {
        title: "BREAKDOWN SECTION"
      },
      render: ({ title }) => <BreakdownSectionHeadline title={title} />
    },

    ImageSlider: {
      fields: {
        unlitSrc: { type: "text" },
        litSrc: { type: "text" },
        alt: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
      },
      defaultProps: {
        unlitSrc: "/images/train-station/2Day.webp",
        litSrc: "/images/train-station/2Night.webp",
        alt: "Lighting Comparison",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
      },
      render: ({ unlitSrc, litSrc, alt, imagePreset, imageFitMode }) => (
        <ImageSlider
          unlitSrc={unlitSrc}
          litSrc={litSrc}
          alt={alt}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
        />
      )
    },

    GalleryItem: {
      fields: {
        src: { type: "text" },
        caption: { type: "text" },
        preset: imagePresetField,
        fitMode: imageFitModeField,
      },
      defaultProps: {
        src: "/images/train-station/2Day.webp",
        caption: "Gallery Image",
        preset: "ratio-16-9",
        fitMode: "x",
      },
      render: ({ src, caption, preset, fitMode }) => (
        <GalleryItem
          src={src}
          caption={caption}
          preset={preset as any}
          fitMode={fitMode as any}
        />
      )
    },

    MediaTextCard: {
      fields: {
        title: { type: "text", contentEditable: true },
        description: { type: "textarea", contentEditable: true },
        imageSrc: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        tags: { type: "array", arrayFields: { tag: { type: "text" } } },
      },
      defaultProps: {
        title: "Breakdown Title",
        description: "这里用于承载更完整的拆解说明，包括为什么这样组织信息、为什么在这个节点切换视觉重点，以及不同素材如何共同服务于同一条阅读路径。 The English layer sits in the same paragraph block so you can compare Chinese and Latin weight matching under the same spacing system.\n\n当正文被拉长到四五行时，这个模块依然应该保持节奏稳定，让标题、标签、图像与文字之间的重心关系不被打散。 A longer bilingual paragraph should still hold the grid without collapsing the visual hierarchy.",
        imageSrc: "/images/train-station/2Day.webp",
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        tags: [
          { tag: "Lighting", _arrayItem: { id: "tag-1" } },
          { tag: "Unreal Engine", _arrayItem: { id: "tag-2" } }
        ] as any
      },
      render: ({ title, description, imageSrc, imagePreset, imageFitMode, tags }) => (
        <MediaTextCard
          title={title}
          description={description}
          imageSrc={imageSrc}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          tags={(tags as any)?.map((t: any) => t.tag)}
        />
      )
    },
    BreakdownTriptych: {
      fields: {
        col1Title: { type: "text" },
        col1Text: { type: "textarea" },
        col1Img: { type: "text" },
        col1Preset: imagePresetField,
        col1FitMode: imageFitModeField,
        col2Title: { type: "text" },
        col2Text: { type: "textarea" },
        col2Img: { type: "text" },
        col2Preset: imagePresetField,
        col2FitMode: imageFitModeField,
        col3Title: { type: "text" },
        col3Text: { type: "textarea" },
        col3Img: { type: "text" },
        col3Preset: imagePresetField,
        col3FitMode: imageFitModeField,
      },
      defaultProps: {
        col1Title: "Context Mapping",
        col1Text: "这一列用于说明问题的起点与观察维度，例如我首先锁定了哪些视觉矛盾、哪些叙事信息必须被优先传达，以及哪些环境元素会直接影响玩家的第一印象与阅读入口。 This first column defines the reading anchor and establishes what the viewer should notice before any system detail appears.",
        col1Img: "/images/train-station/2Day.webp",
        col1Preset: "ratio-16-9",
        col1FitMode: "x",
        col2Title: "System Decision",
        col2Text: "这一列承接具体方法论，解释我如何在镜头、节奏、界面密度和情绪表达之间做取舍，并通过多次迭代把抽象概念转化成更清晰、更可执行的系统判断。 This middle block translates intention into method so Chinese and English can be checked side by side within the same weight logic.",
        col2Img: "/images/train-station/2Night.webp",
        col2Preset: "ratio-16-9",
        col2FitMode: "x",
        col3Title: "Visual Outcome",
        col3Text: "最后一列聚焦结果与反馈，强调方案落地后带来的整体感受变化，以及为什么最终呈现能够同时满足氛围、功能性和画面秩序三方面的目标。 The final column closes the loop and verifies whether the implemented result still preserves hierarchy, contrast, and atmosphere.",
        col3Img: "/images/city-2026/001.webp",
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
        mediaSrc: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        isVideo: {
          type: "select",
          options: [
            { label: "Image", value: "false" },
            { label: "Video", value: "true" }
          ]
        },
        parameters: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            value: { type: "text" },
            description: { type: "textarea" }
          }
        }
      },
      defaultProps: {
        mediaSrc: "/images/train-station/2Night.webp",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        isVideo: "false",
        parameters: [
          {
            name: "Global Illumination",
            value: "Lumen",
            description: "使用实时全局光照维持空间中的连续反弹与明暗过渡，让场景在长时间观察和多角度移动下依旧保持可信的体积关系与情绪稳定性。",
            
            _arrayItem: { id: "param-1" }
          }
        ] as any
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
        heading: { type: "text", contentEditable: true },
        paragraphs: { type: "slot" },
        imageSrc: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        layoutVariant: {
          type: "select",
          options: [
            { label: "Split Left", value: "split-left" },
            { label: "Split Right", value: "split-right" },
            { label: "Stack", value: "stack" }
          ]
        }
      },
      defaultProps: {
        heading: "CORE CONCEPT",
        paragraphs: [
          {
            type: "TextParagraphBlock",
            props: {
              id: "para-1",
              text: "这一段用于解释版式背后的核心判断：为什么标题需要先建立压倒性的识别度，为什么正文要在更克制的节奏里展开，以及图像、留白与信息密度之间如何共同形成一条稳定的阅读路径。",
            }
          },
          {
            type: "TextParagraphBlock",
            props: {
              id: "para-2",
              text: "当说明文字增长到四五行之后，模块不应该因为内容变长就失去秩序；相反，它应该通过网格、行高和段落间距的控制，把阅读压力重新转化成更明确的层次与更自然的浏览节奏。 The bilingual paragraph here is intentionally longer so you can inspect whether HanYi QiHei and Futura still feel balanced in the same block.",
            }
          }
        ] as any,
        imageSrc: "/images/train-station/2Day.webp",
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
        phase1Title: { type: "text", contentEditable: true },
        phase1Subtitle: { type: "text", contentEditable: true },
        phase1Content: { type: "textarea", contentEditable: true },
        phase1Items: { type: "slot" },
        phase2Title: { type: "text", contentEditable: true },
        phase2Subtitle: { type: "text", contentEditable: true },
        phase2Content: { type: "textarea", contentEditable: true },
        phase2Items: { type: "slot" },
        phase3Title: { type: "text", contentEditable: true },
        phase3Subtitle: { type: "text", contentEditable: true },
        phase3Content: { type: "textarea", contentEditable: true },
        phase3ImageSrc: { type: "text" },
        phase3ImagePreset: imagePresetField,
        phase3ImageFitMode: imageFitModeField,
      },
      defaultProps: {
        phase1Title: "Context",
        phase1Content: "这一部分用于交代问题背景与起始约束，说明项目在视觉、交互或系统层面最先暴露出的矛盾点，以及我为什么判断它值得被优先拆开分析。 This opening paragraph defines the problem frame before the implementation logic appears.",
        phase1Items: [] as any,
        phase2Title: "Architecture",
        phase2Content: "这一部分用于展开具体方案结构，强调我如何把复杂目标拆成更可执行的层级，并通过更清楚的步骤、参数与依赖关系来维持整体实现的可控性。 The English line is kept in the same tone so bilingual text can stress-test the layout.",
        phase2Items: [] as any,
        phase3Title: "Execution",
        phase3Content: "这一部分用于回收方法与结果，说明在真正落地之后，哪些判断被验证、哪些问题被修正，以及最终呈现为什么能够同时满足氛围、功能与叙事表达。 This concluding paragraph checks whether the final composition still reads clearly under longer mixed-language content.",
        phase3ImageSrc: "/images/train-station/2Day.webp",
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
          title: props.phase1Title,
          subtitle: props.phase1Subtitle,
          content: props.phase1Content,
          items: phase1FallbackItems,
        };
        const phase2 = {
          title: props.phase2Title,
          subtitle: props.phase2Subtitle,
          content: props.phase2Content,
          items: phase2FallbackItems,
        };
        const phase3 = {
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
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
        imageSrc: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        link: { type: "text" },
        index: { type: "number" },
        align: {
          type: "select",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "NEW PROJECT",
        subtitle: "Design / Development",
        imageSrc: CANONICAL_PLACEHOLDER_PATH,
        imagePreset: "ratio-16-9",
        imageFitMode: "x",
        link: "/works",
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
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
        description: { type: "textarea", contentEditable: true },
        imageSrc: { type: "text" },
        imageAlt: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
      },
      defaultProps: {
        title: "JIANG CHENGYAN",
        subtitle: "PORTFOLIO",
        description: "GAME DIRECTOR\n& DEVELOPER",
        imageSrc: "/images/covers/2026/ShotForCrewWithoutWord.0004.webp",
        imageAlt: "Hero Background",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
      },
      render: ({ title, subtitle, description, imageSrc, imageAlt, imagePreset, imageFitMode, editMode }) => (
        <HeroSection
          title={title}
          subtitle={subtitle}
          description={description}
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
        eyebrow: { type: "text", contentEditable: true },
        title: { type: "text", contentEditable: true },
        description: { type: "textarea", contentEditable: true },
        buttonLabel: { type: "text", contentEditable: true },
        buttonHref: { type: "text" },
      },
      defaultProps: {
        eyebrow: "Selected Archive",
        title: "ALL WORKS",
        description: "A full index of interactive narrative, systems, lighting studies, and production experiments.",
        buttonLabel: "ENTER ARCHIVE",
        buttonHref: "/works",
      },
      render: ({ eyebrow, title, description, buttonLabel, buttonHref, editMode }) => (
        <HomeEndcapSection
          eyebrow={eyebrow}
          title={title}
          description={description}
          buttonLabel={buttonLabel}
          buttonHref={toEditorAwareHref(buttonHref, false) ?? "/works"}
          editMode={editMode}
        />
      ),
    },

    PortfolioHeroHeader: {
      fields: {
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
        descriptionLine1: { type: "text", contentEditable: true },
        descriptionLine2: { type: "text", contentEditable: true },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        title: "LIGHTING",
        subtitle: "PORTFOLIO",
        descriptionLine1: "A Curated Selection",
        descriptionLine2: "Unreal Engine 5",
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
          ctaHref={toEditorAwareHref(ctaHref, false)}
          editMode={editMode}
        />
      )
    },
    LightingCollectionHeroHeader: {
      fields: {
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
        descriptionLine1: { type: "text", contentEditable: true },
        descriptionLine2: { type: "text", contentEditable: true },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        title: "LIGHTING",
        subtitle: "PORTFOLIO",
        descriptionLine1: "A Curated Selection",
        descriptionLine2: "Unreal Engine 5",
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
          ctaHref={toEditorAwareHref(ctaHref, false)}
          editMode={editMode}
        />
      )
    },

    LightingProjectCard: {
      fields: {
        id: { type: "text" },
        number: { type: "text" },
        title: { type: "text" },
        coverImage: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        href: { type: "text" },
      },
      defaultProps: {
        id: "collection-1",
        number: "01",
        title: "NEW COLLECTION",
        coverImage: "/images/city-2026/002.webp",
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        href: "/works/lighting-portfolio/collection-1",
      },
      render: ({ id, number, title, coverImage, imagePreset, imageFitMode, href, editMode }) => (
        <LightingProjectCard
          id={id}
          number={number}
          title={title}
          coverImage={coverImage}
          imagePreset={imagePreset as any}
          imageFitMode={imageFitMode as any}
          href={toEditorAwareHref(href ?? `/works/lighting-portfolio/${id}`, editMode)}
        />
      )
    },

    WorksList: {
      fields: {
        heading: { type: "text", contentEditable: true },
        entries: { type: "slot" }
      },
      defaultProps: {
        heading: "All Selected Works",
        entries: [
          {
            type: "WorksListEntry",
            props: {
              id: "works-entry-1",
              number: "01",
              href: "/works/lighting-portfolio",
              title: "LIGHTING PORTFOLIO",
              category: "Lighting Art",
              imageSrc: "/images/train-station/2Day.webp",
              desc: "A curated collection of lighting and mood practices"
            }
          }
        ]
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
        number: { type: "text", contentEditable: true },
        href: { type: "text" },
        title: { type: "text", contentEditable: true },
        category: { type: "text", contentEditable: true },
        imageSrc: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
        desc: { type: "textarea", contentEditable: true },
      },
      defaultProps: {
        number: "01",
        href: "/works/lighting-portfolio",
        title: "LIGHTING PORTFOLIO",
        category: "Lighting Art",
        imageSrc: CANONICAL_PLACEHOLDER_PATH,
        imagePreset: "ratio-21-9",
        imageFitMode: "x",
        desc: "A curated collection of lighting and mood practices",
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
        nextId: { type: "text" },
        nextName: { type: "text" },
        nextBg: { type: "text" },
        imagePreset: imagePresetField,
        imageFitMode: imageFitModeField,
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
        title: { type: "text" },
        number: { type: "text" },
        description: { type: "textarea" },
        backHref: { type: "text" },
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

    LightingCollectionItem: {
      fields: {
        lit: { type: "text" },
        unlit: { type: "text" },
        caption: { type: "text" },
        preset: imagePresetField,
        fitMode: imageFitModeField,
      },
      defaultProps: {
        lit: "/images/city-2026/001.webp",
        caption: "DAY",
        preset: "ratio-16-9",
        fitMode: "x",
      },
      render: ({ lit, unlit, caption, preset, fitMode }) => (
        <LightingCollectionItem
          lit={lit}
          unlit={unlit}
          caption={caption}
          preset={preset as any}
          fitMode={fitMode as any}
        />
      ),
    },

    // --------------------------------------------------------
    // Black Box Special Effect Blocks
    // --------------------------------------------------------
    ContactFlashlight: {
      fields: {
        maskRadius: { type: "number" },
        maskSmoothness: { type: "number" },
        darkTextColor: { type: "text" },
        lightTextColor: { type: "text" },
        name: { type: "text", contentEditable: true },
        taglineText: { type: "text", contentEditable: true },
        taglineSub: { type: "text", contentEditable: true },
        email: { type: "text", contentEditable: true },
        wechat: { type: "text", contentEditable: true },
        experienceHistory: { type: "slot" },
        creativeDirection: { type: "slot" }
      },
      defaultProps: {
        maskRadius: 500,
        maskSmoothness: 40,
        darkTextColor: "rgba(255,255,255,0.4)",
        lightTextColor: "rgba(255,255,255,1)",
        name: "JIANG CHENGYAN",
        taglineText: "艺术与科技 / 交互叙事设计 / 游戏设计",
        taglineSub: "CUC '2028",
        email: "3115437519@qq.com",
        wechat: "radiowithouthead",
        experienceHistory: [
          { type: "ContactExperienceItem", props: { id: "exp-1", company: "腾讯光子工作室", role: "Lighing Technical Art Intern" } }
        ] as any,
        creativeDirection: [
          { type: "ContactDirectionItem", props: { id: "cd-1", title: "交互叙事与关卡设计", subtitle: "Interactive Narrative & Level Design" } }
        ] as any
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
                company: entry?.props?.company ?? entry?.company ?? "",
                role: entry?.props?.role ?? entry?.role ?? "",
              }))
              : undefined}
            creativeDirection={Array.isArray(creativeDirection)
              ? (creativeDirection as any[]).map((entry) => ({
                title: entry?.props?.title ?? entry?.title ?? "",
                subtitle: entry?.props?.subtitle ?? entry?.subtitle ?? "",
              }))
              : undefined}
            experienceContent={ExperienceSlot ? <ExperienceSlot allow={["ContactExperienceItem"]} className="space-y-6" minEmptyHeight={20} /> : undefined}
            creativeContent={CreativeSlot ? <CreativeSlot allow={["ContactDirectionItem"]} className="space-y-6" minEmptyHeight={20} /> : undefined}
          />
        );
      }
    },

    MetadataListItem: {
      fields: {
        label: { type: "text", contentEditable: true },
        value: { type: "text", contentEditable: true },
        align: {
          type: "select",
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
        text: { type: "textarea", contentEditable: true },
      },
      defaultProps: {
        text: "This is a paragraph block.",
      },
      render: ({ text }) => <TextParagraphBlock text={text} />,
    },

    ContactExperienceItem: {
      fields: {
        company: { type: "text", contentEditable: true },
        role: { type: "text", contentEditable: true },
      },
      defaultProps: {
        company: "腾讯光子工作室",
        role: "Lighting Technical Art Intern",
      },
      render: ({ company, role }) => <ContactExperienceItem company={company} role={role} />,
    },

    ContactDirectionItem: {
      fields: {
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
      },
      defaultProps: {
        title: "交互叙事与关卡设计",
        subtitle: "Interactive Narrative & Level Design",
      },
      render: ({ title, subtitle }) => <ContactDirectionItem title={title} subtitle={subtitle} />,
    }
  },
};

export default config;
