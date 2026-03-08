/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from "@measured/puck";
import { OptimizedImage } from "../components/common/OptimizedImage";
import BilingualText from "../components/common/BilingualText";
import HighDensityInfoBlock from "../components/breakdowns/HighDensityInfoBlock";
import BreakdownTriptych from "../components/breakdowns/BreakdownTriptych";
import ImageSlider from "../components/breakdowns/ImageSlider";
import MediaTextCard from "../components/breakdowns/MediaTextCard";
import MosaicGallery from "../components/breakdowns/MosaicGallery";
import ParameterGrid from "../components/breakdowns/ParameterGrid";
import TextSplitLayout from "../components/breakdowns/TextSplitLayout";
import BreakdownSectionHeadline from "../components/breakdowns/BreakdownHeadline";
import ContactFlashlightBlock from "../components/blocks/ContactFlashlightBlock";
import ProjectSection from "../components/home/ProjectSection";
import HeroSection from "../components/home/HeroSection";
import NextProjectBlock from "../components/blocks/NextProjectBlock";
import LightingProjectCard from "../components/works/LightingProjectCard";
import PortfolioHeroHeader from "../components/works/PortfolioHeroHeader";
import WorksList from "../components/works/WorksList";
import { isCmsPreviewEnabled } from "@/lib/site-mode";

function toCmsPreviewHref(href: string): string {
  if (href === "/") {
    return "/p";
  }

  if (href === "/p" || href.startsWith("/p/") || href.startsWith("/admin")) {
    return href;
  }

  return `/p${href}`;
}

function toEditorAwareHref(href: string | undefined, editMode?: boolean): string | undefined {
  if (!href || !href.startsWith("/")) {
    return href;
  }

  const normalizedHref = isCmsPreviewEnabled() ? toCmsPreviewHref(href) : href;

  if (editMode) {
    if (normalizedHref === "/p" || normalizedHref === "/") {
      return "/admin";
    }

    if (normalizedHref.startsWith("/admin")) {
      return normalizedHref;
    }

    if (normalizedHref.startsWith("/p/")) {
      const cmsPath = normalizedHref.slice(3);
      return cmsPath ? `/admin/${cmsPath}` : "/admin";
    }

    return `/admin${normalizedHref}`;
  }

  return normalizedHref;
}

export const config: Config = {
  components: {
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
        return (
          <header className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black">
            {heroImage ? (
              <div className="absolute inset-0 w-full h-full">
                <OptimizedImage
                  src={heroImage}
                  alt={title}
                  fill
                  sizes="100vw"
                  priority
                  className="w-full h-full object-cover opacity-70"
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
                  <BilingualText text={content} />
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
      },
      defaultProps: {
        alt: "Puck image",
        caption: "Visual block",
        src: "/images/train-station/2Day.webp",
      },
      render: ({ alt, caption, src }) => {
        return (
          <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
            <figure className="overflow-hidden border border-white/15 bg-white/[0.03]">
              <OptimizedImage alt={alt} className="h-auto w-full object-cover" src={src} width={1920} height={1080} />
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
      },
      defaultProps: {
        unlitSrc: "/images/train-station/2Day.webp",
        litSrc: "/images/train-station/2Night.webp",
        alt: "Lighting Comparison",
      },
      render: ({ unlitSrc, litSrc, alt }) => <ImageSlider unlitSrc={unlitSrc} litSrc={litSrc} alt={alt} />
    },

    MosaicGallery: {
      fields: {
        images: {
          type: "array",
          arrayFields: {
            src: { type: "text" },
            caption: { type: "text" },
          }
        }
      },
      defaultProps: {
        images: [
          { src: "/images/train-station/2Day.webp", caption: "Main View", _arrayItem: { id: "img-1" } },
          { src: "/images/train-station/Day.webp", caption: "Detail 1", _arrayItem: { id: "img-2" } },
          { src: "/images/train-station/Cut2Day.webp", caption: "Detail 2", _arrayItem: { id: "img-3" } },
        ] as any
      },
      render: ({ images }) => <MosaicGallery images={images as any} />
    },

    MediaTextCard: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        imageSrc: { type: "text" },
        tags: { type: "array", arrayFields: { tag: { type: "text" } } },
      },
      defaultProps: {
        title: "Breakdown Title",
        description: "这里用于承载更完整的拆解说明，包括为什么这样组织信息、为什么在这个节点切换视觉重点，以及不同素材如何共同服务于同一条阅读路径。 The English layer sits in the same paragraph block so you can compare Chinese and Latin weight matching under the same spacing system.\n\n当正文被拉长到四五行时，这个模块依然应该保持节奏稳定，让标题、标签、图像与文字之间的重心关系不被打散。 A longer bilingual paragraph should still hold the grid without collapsing the visual hierarchy.",
        imageSrc: "/images/train-station/2Day.webp",
        tags: [
          { tag: "Lighting", _arrayItem: { id: "tag-1" } },
          { tag: "Unreal Engine", _arrayItem: { id: "tag-2" } }
        ] as any
      },
      render: ({ title, description, imageSrc, tags }) => (
        <MediaTextCard
          title={title}
          description={description}
          imageSrc={imageSrc}
          tags={(tags as any)?.map((t: any) => t.tag)}
        />
      )
    },
    BreakdownTriptych: {
      fields: {
        col1Title: { type: "text" },
        col1Text: { type: "textarea" },
        col1Img: { type: "text" },
        col2Title: { type: "text" },
        col2Text: { type: "textarea" },
        col2Img: { type: "text" },
        col3Title: { type: "text" },
        col3Text: { type: "textarea" },
        col3Img: { type: "text" },
      },
      defaultProps: {
        col1Title: "Context Mapping",
        col1Text: "这一列用于说明问题的起点与观察维度，例如我首先锁定了哪些视觉矛盾、哪些叙事信息必须被优先传达，以及哪些环境元素会直接影响玩家的第一印象与阅读入口。 This first column defines the reading anchor and establishes what the viewer should notice before any system detail appears.",
        col1Img: "/images/train-station/2Day.webp",
        col2Title: "System Decision",
        col2Text: "这一列承接具体方法论，解释我如何在镜头、节奏、界面密度和情绪表达之间做取舍，并通过多次迭代把抽象概念转化成更清晰、更可执行的系统判断。 This middle block translates intention into method so Chinese and English can be checked side by side within the same weight logic.",
        col2Img: "/images/train-station/2Night.webp",
        col3Title: "Visual Outcome",
        col3Text: "最后一列聚焦结果与反馈，强调方案落地后带来的整体感受变化，以及为什么最终呈现能够同时满足氛围、功能性和画面秩序三方面的目标。 The final column closes the loop and verifies whether the implemented result still preserves hierarchy, contrast, and atmosphere.",
        col3Img: "/images/city-2026/001.webp",
      },
      render: ({
        col1Title,
        col1Text,
        col1Img,
        col2Title,
        col2Text,
        col2Img,
        col3Title,
        col3Text,
        col3Img,
      }) => (
        <BreakdownTriptych
          col1Title={col1Title}
          col1Text={col1Text}
          col1Img={col1Img}
          col2Title={col2Title}
          col2Text={col2Text}
          col2Img={col2Img}
          col3Title={col3Title}
          col3Text={col3Text}
          col3Img={col3Img}
        />
      )
    },

    ParameterGrid: {
      fields: {
        mediaSrc: { type: "text" },
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
      render: ({ mediaSrc, isVideo, parameters }) => (
        <ParameterGrid
          mediaSrc={mediaSrc}
          isVideo={isVideo === "true"}
          parameters={parameters as any}
        />
      )
    },

    TextSplitLayout: {
      fields: {
        heading: { type: "text", contentEditable: true },
        paragraphs: {
          type: "array",
          arrayFields: { text: { type: "textarea", contentEditable: true } }
        },
        imageSrc: { type: "text" },
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
            text: "这一段用于解释版式背后的核心判断：为什么标题需要先建立压倒性的识别度，为什么正文要在更克制的节奏里展开，以及图像、留白与信息密度之间如何共同形成一条稳定的阅读路径。",
            _arrayItem: { id: "para-1" }
          },
          {
            text: "当说明文字增长到四五行之后，模块不应该因为内容变长就失去秩序；相反，它应该通过网格、行高和段落间距的控制，把阅读压力重新转化成更明确的层次与更自然的浏览节奏。 The bilingual paragraph here is intentionally longer so you can inspect whether HanYi QiHei and Futura still feel balanced in the same block.",
            _arrayItem: { id: "para-2" }
          }
        ] as any,
        layoutVariant: "split-left"
      },
      render: ({ heading, paragraphs, imageSrc, layoutVariant }) => (
        <TextSplitLayout
          heading={heading}
          paragraphs={(paragraphs as any)?.map((p: any) => p.text) || []}
          imageSrc={imageSrc}
          layoutVariant={layoutVariant as any}
        />
      )
    },

    HighDensityInfoBlock: {
      fields: {
        phase1Title: { type: "text" },
        phase1Subtitle: { type: "text" },
        phase1Content: { type: "textarea" },
        phase1Items: { type: "array", arrayFields: { label: { type: "text" }, value: { type: "text" } } },
        phase2Title: { type: "text" },
        phase2Subtitle: { type: "text" },
        phase2Content: { type: "textarea" },
        phase2Items: { type: "array", arrayFields: { label: { type: "text" }, value: { type: "text" } } },
        phase3Title: { type: "text" },
        phase3Subtitle: { type: "text" },
        phase3Content: { type: "textarea" },
        phase3ImageSrc: { type: "text" },
      },
      defaultProps: {
        phase1Title: "Context",
        phase1Content: "这一部分用于交代问题背景与起始约束，说明项目在视觉、交互或系统层面最先暴露出的矛盾点，以及我为什么判断它值得被优先拆开分析。 This opening paragraph defines the problem frame before the implementation logic appears.",
        phase1Items: [] as any,
        phase2Title: "Architecture",
        phase2Content: "这一部分用于展开具体方案结构，强调我如何把复杂目标拆成更可执行的层级，并通过更清楚的步骤、参数与依赖关系来维持整体实现的可控性。 The English line is kept in the same tone so bilingual text can stress-test the layout.",
        phase2Items: [] as any,
        phase3Title: "Execution",
        phase3Content: "这一部分用于回收方法与结果，说明在真正落地之后，哪些判断被验证、哪些问题被修正，以及最终呈现为什么能够同时满足氛围、功能与叙事表达。 This concluding paragraph checks whether the final composition still reads clearly under longer mixed-language content."
      },
      render: (props) => {
        // Construct the phase objects required by the component
        const phase1 = {
          title: props.phase1Title,
          subtitle: props.phase1Subtitle,
          content: props.phase1Content,
          items: props.phase1Items as any
        };
        const phase2 = {
          title: props.phase2Title,
          subtitle: props.phase2Subtitle,
          content: props.phase2Content,
          items: props.phase2Items as any
        };
        const phase3 = {
          title: props.phase3Title,
          subtitle: props.phase3Subtitle,
          content: props.phase3Content,
          imageSrc: props.phase3ImageSrc
        };
        return <HighDensityInfoBlock phase1={phase1} phase2={phase2} phase3={phase3} />;
      }
    },

    ProjectSection: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        imageSrc: { type: "text" },
        link: { type: "text" },
        index: { type: "number" }
      },
      defaultProps: {
        title: "NEW PROJECT",
        subtitle: "Design / Development",
        imageSrc: "/images/train-station/2Day.webp",
        link: "/p/works",
        index: 0
      },
      render: ({ title, subtitle, imageSrc, link, index, editMode }) => (
        <ProjectSection
          title={title}
          subtitle={subtitle}
          imageSrc={imageSrc}
          link={toEditorAwareHref(link, editMode)}
          index={index}
        />
      )
    },

    HeroSection: {
      fields: {},
      render: () => <HeroSection />
    },

    PortfolioHeroHeader: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        descriptionLine1: { type: "text" },
        descriptionLine2: { type: "text" }
      },
      defaultProps: {
        title: "LIGHTING",
        subtitle: "PORTFOLIO",
        descriptionLine1: "A Curated Selection",
        descriptionLine2: "Unreal Engine 5"
      },
      render: ({ title, subtitle, descriptionLine1, descriptionLine2 }) => (
        <PortfolioHeroHeader
          title={title}
          subtitle={subtitle}
          descriptionLine1={descriptionLine1}
          descriptionLine2={descriptionLine2}
        />
      )
    },
    LightingCollectionHeroHeader: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        descriptionLine1: { type: "text" },
        descriptionLine2: { type: "text" },
      },
      defaultProps: {
        title: "LIGHTING",
        subtitle: "PORTFOLIO",
        descriptionLine1: "A Curated Selection",
        descriptionLine2: "Unreal Engine 5",
      },
      render: ({ title, subtitle, descriptionLine1, descriptionLine2 }) => (
        <PortfolioHeroHeader
          title={title}
          subtitle={subtitle}
          descriptionLine1={descriptionLine1}
          descriptionLine2={descriptionLine2}
        />
      )
    },

    LightingProjectCard: {
      fields: {
        id: { type: "text" },
        number: { type: "text" },
        title: { type: "text" },
        coverImage: { type: "text" },
        href: { type: "text" },
      },
      defaultProps: {
        id: "collection-1",
        number: "01",
        title: "NEW COLLECTION",
        coverImage: "/images/city-2026/002.webp",
        href: "/p/works/lighting-atmosphere",
      },
      render: ({ id, number, title, coverImage, href, editMode }) => (
        <LightingProjectCard
          id={id}
          number={number}
          title={title}
          coverImage={coverImage}
          href={toEditorAwareHref(href ?? `/p/works/lighting-portfolio/${id}`, editMode)}
        />
      )
    },

    WorksList: {
      fields: {
        heading: { type: "text" },
        works: {
          type: "array",
          arrayFields: {
            id: { type: "text" },
            href: { type: "text" },
            title: { type: "text" },
            category: { type: "text" },
            imageSrc: { type: "text" },
            desc: { type: "text" }
          }
        }
      },
      defaultProps: {
        heading: "All Selected Works",
        works: [
          {
            id: "lighting-portfolio",
            href: "/p/works/lighting-portfolio",
            title: "LIGHTING PORTFOLIO",
            category: "Lighting Art",
            imageSrc: "/images/train-station/2Day.webp",
            desc: "A curated collection of lighting and mood practices"
          }
        ]
      },
      render: ({ heading, works, editMode }) => {
        const normalizedWorks = (works as any[])?.map((work) => ({
          ...work,
          href: toEditorAwareHref(work?.href ?? `/p/works/${work?.id ?? ""}`, editMode),
        }));

        return <WorksList heading={heading} works={normalizedWorks as any[]} />;
      }
    },

    NextProjectBlock: {
      fields: {
        nextId: { type: "text" },
        nextName: { type: "text" },
        nextBg: { type: "text" }
      },
      defaultProps: {
        nextId: "penguin",
        nextName: "PENGUIN TRADING CO.",
        nextBg: "/images/penguin/CyberRestaurant.webp"
      },
      render: ({ nextId, nextName, nextBg, editMode }) => (
        <NextProjectBlock
          nextId={nextId}
          nextName={nextName}
          nextBg={nextBg}
          href={toEditorAwareHref(`/p/works/${nextId}`, editMode)}
        />
      )
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
        name: { type: "text" },
        taglineText: { type: "text" },
        taglineSub: { type: "text" },
        email: { type: "text" },
        wechat: { type: "text" },
        experienceHistory: {
          type: "array",
          arrayFields: { company: { type: "text" }, role: { type: "text" } }
        },
        creativeDirection: {
          type: "array",
          arrayFields: { title: { type: "text" }, subtitle: { type: "text" } }
        }
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
          { company: "腾讯光子工作室", role: "Lighing Technical Art Intern", _arrayItem: { id: "exp-1" } }
        ] as any,
        creativeDirection: [
          { title: "交互叙事与关卡设计", subtitle: "Interactive Narrative & Level Design", _arrayItem: { id: "cd-1" } }
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
      }) => (
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
          experienceHistory={experienceHistory as any}
          creativeDirection={creativeDirection as any}
        />
      )
    }
  },
};

export default config;
