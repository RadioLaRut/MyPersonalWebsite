import type { Config } from "@measured/puck";
import HighDensityInfoBlock from "../components/breakdowns/HighDensityInfoBlock";
import ImageSlider from "../components/breakdowns/ImageSlider";
import MediaTextCard from "../components/breakdowns/MediaTextCard";
import MosaicGallery from "../components/breakdowns/MosaicGallery";
import ParameterGrid from "../components/breakdowns/ParameterGrid";
import TextSplitLayout from "../components/breakdowns/TextSplitLayout";
import BeforeAfterSlider from "../components/works/BeforeAfterSlider";
import ContactFlashlightBlock from "../components/blocks/ContactFlashlightBlock";
import ProjectSection from "../components/home/ProjectSection";
import HeroSection from "../components/home/HeroSection";
import NextProjectBlock from "../components/blocks/NextProjectBlock";
import LightingProjectCard from "../components/works/LightingProjectCard";
import PortfolioHeroHeader from "../components/works/PortfolioHeroHeader";
import WorksList from "../components/works/WorksList";

function toEditorAwareHref(href: string | undefined, editMode?: boolean): string | undefined {
  if (!href || !editMode || !href.startsWith("/")) {
    return href;
  }

  if (href === "/") {
    return "/admin";
  }

  if (href.startsWith("/admin")) {
    return href;
  }

  if (href.startsWith("/p/")) {
    const cmsPath = href.slice(3);
    return cmsPath ? `/admin/${cmsPath}` : "/admin";
  }

  return `/admin${href}`;
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
      },
      defaultProps: {
        eyebrow: "Portfolio",
        title: "Build your page with Puck",
        subtitle: "This is a local editor scaffold for the staged migration.",
      },
      render: ({ eyebrow, title, subtitle }) => {
        return (
          <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-16 md:px-8">
            <p className="font-futura text-xs uppercase tracking-[0.2em] text-white/65">{eyebrow}</p>
            <h1 className="font-display text-4xl leading-tight md:text-6xl">{title}</h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">{subtitle}</p>
          </section>
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
          <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-8">
            <p className="font-body text-base leading-8 text-white/85 md:text-lg">{content}</p>
          </section>
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
        link: "/works",
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
        coverImage: { type: "text" }
      },
      defaultProps: {
        id: "collection-1",
        number: "01",
        title: "NEW COLLECTION",
        coverImage: "/images/City2026Add/002.PNG"
      },
      render: ({ id, number, title, coverImage, editMode }) => (
        <LightingProjectCard
          id={id}
          number={number}
          title={title}
          coverImage={coverImage}
          href={toEditorAwareHref(`/works/lighting-portfolio/${id}`, editMode)}
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
          href: toEditorAwareHref(work?.href ?? `/works/${work?.id ?? ""}`, editMode),
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
          href={toEditorAwareHref(`/works/${nextId}`, editMode)}
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
