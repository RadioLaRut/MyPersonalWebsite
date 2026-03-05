import type { Config } from "@measured/puck";
import HighDensityInfoBlock from "../components/breakdowns/HighDensityInfoBlock";
import BreakdownTriptych from "../components/breakdowns/BreakdownTriptych";
import ImageSlider from "../components/breakdowns/ImageSlider";
import MediaTextCard from "../components/breakdowns/MediaTextCard";
import MosaicGallery from "../components/breakdowns/MosaicGallery";
import ParameterGrid from "../components/breakdowns/ParameterGrid";
import TextSplitLayout from "../components/breakdowns/TextSplitLayout";
import BreakdownHeadline from "../components/breakdowns/BreakdownHeadline";
import BeforeAfterSlider from "../components/works/BeforeAfterSlider";
import ContactFlashlightBlock from "../components/blocks/ContactFlashlightBlock";
import ProjectSection from "../components/home/ProjectSection";
import HeroSection from "../components/home/HeroSection";
import NextProjectBlock from "../components/blocks/NextProjectBlock";
import LightingProjectCard from "../components/works/LightingProjectCard";
import PortfolioHeroHeader from "../components/works/PortfolioHeroHeader";
import WorksList from "../components/works/WorksList";

const isCmsPreviewEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" || process.env.NEXT_PUBLIC_USE_JSON === "true";

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

  const normalizedHref = isCmsPreviewEnabled ? toCmsPreviewHref(href) : href;

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
        heroImage: "/images/TrainStation/2Day.png",
        navLink: "",
      },
      render: ({ eyebrow, title, subtitle, heroImage, navLink }) => {
        return (
          <header className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-black">
            {heroImage ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={heroImage} alt={title} className="w-full h-full object-cover opacity-70" />
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
    RichParagraph: {
      fields: {
        content: { type: "textarea", contentEditable: true },
      },
      defaultProps: {
        content:
          "Use this block to draft content in the local visual editor. Data persistence will be wired in phase 3.",
      },
      render: ({ content }) => {
        return (
          <article className="w-full py-24 md:py-32 relative z-20 bg-black">
            <div className="grid-container w-full">
              <div className="col-span-4 md:col-start-3 md:col-span-8">
                <p className="text-xl md:text-[24px] font-medium leading-[2.2] text-white/90 text-justify font-futura tracking-wide">
                  {content}
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
        src: "/images/TrainStation/2Day.png",
      },
      render: ({ alt, caption, src }) => {
        return (
          <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
            <figure className="overflow-hidden border border-white/15 bg-white/[0.03]">
              <img alt={alt} className="h-auto w-full object-cover" loading="lazy" src={src} />
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
    BreakdownHeadline: {
      fields: {
        title: { type: "text", contentEditable: true }
      },
      defaultProps: {
        title: "BREAKDOWN SECTION"
      },
      render: ({ title }) => <BreakdownHeadline title={title} />
    },

    BeforeAfterSlider: {
      fields: {
        beforeImage: { type: "text" },
        afterImage: { type: "text" },
        beforeAlt: { type: "text" },
        afterAlt: { type: "text" },
      },
      defaultProps: {
        beforeImage: "/images/TrainStation/2Day.png",
        afterImage: "/images/TrainStation/2Night.png",
        beforeAlt: "Before",
        afterAlt: "After",
      },
      render: ({ beforeImage, afterImage, beforeAlt, afterAlt }) => {
        return (
          <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8 aspect-video relative">
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeAlt={beforeAlt}
              afterAlt={afterAlt}
            />
          </section>
        );
      }
    },

    ImageSlider: {
      fields: {
        unlitSrc: { type: "text" },
        litSrc: { type: "text" },
        alt: { type: "text" },
      },
      defaultProps: {
        unlitSrc: "/images/TrainStation/2Day.png",
        litSrc: "/images/TrainStation/2Night.png",
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
          { src: "/images/TrainStation/2Day.png", caption: "Main View", _arrayItem: { id: "img-1" } },
          { src: "/images/TrainStation/1Day.png", caption: "Detail 1", _arrayItem: { id: "img-2" } },
          { src: "/images/TrainStation/3Day.png", caption: "Detail 2", _arrayItem: { id: "img-3" } },
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
        description: "Detailed description of the process goes here.",
        imageSrc: "/images/TrainStation/2Day.png",
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
        col1Title: "Column 1",
        col1Text: "Column 1 description",
        col1Img: "/images/TrainStation/2Day.png",
        col2Title: "Column 2",
        col2Text: "Column 2 description",
        col2Img: "/images/TrainStation/2Night.png",
        col3Title: "Column 3",
        col3Text: "Column 3 description",
        col3Img: "/images/City2026Add/001.PNG",
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
        mediaSrc: "/images/TrainStation/2Night.png",
        isVideo: "false",
        parameters: [
          { name: "Global Illumination", value: "Lumen", description: "Real-time GI", _arrayItem: { id: "param-1" } }
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
          { text: "Detailing the creative approach behind the layout.", _arrayItem: { id: "para-1" } }
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
        phase1Content: "Information here.",
        phase1Items: [] as any,
        phase2Title: "Architecture",
        phase2Content: "Information here.",
        phase2Items: [] as any,
        phase3Title: "Execution",
        phase3Content: "Information here."
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
        imageSrc: "/images/TrainStation/2Day.png",
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
        coverImage: "/images/City2026Add/002.PNG",
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
            imageSrc: "/images/TrainStation/2Day.png",
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
        nextBg: "/images/Others/CyberRestaurant.png"
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
