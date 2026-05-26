import type { ComponentProps } from "react";
import type { Config } from "@measured/puck";
import NextProjectBlock from "@/components/blocks/NextProjectBlock";
import BreakdownSectionHeadline from "@/components/breakdowns/BreakdownHeadline";
import BreakdownTriptych from "@/components/breakdowns/BreakdownTriptych";
import ContentCard from "@/components/breakdowns/ContentCard";
import HighDensityInfoBlock from "@/components/breakdowns/HighDensityInfoBlock";
import ImageSlider from "@/components/breakdowns/ImageSlider";
import ParameterGrid from "@/components/breakdowns/ParameterGrid";
import ProjectSection from "@/components/home/ProjectSection";
import PortfolioHeroHeader from "@/components/works/PortfolioHeroHeader";
import WorksList from "@/components/works/WorksList";
import WorksListEntry from "@/components/works/WorksListEntry";
import { normalizeImageSrc } from "@/lib/public-paths";
import { createFieldGroup } from "@/puck/fields/field-groups";
import {
  buildImageFieldTriple,
  castImageFitMode,
  castImagePreset,
  imageFitModeField,
  imagePresetField,
} from "@/puck/fields/image-fields";
import { castSelectValue, coerceLegacyBooleanSelectValue } from "@/puck/fields/select-fields";
import {
  ALLOW_METADATA_LIST_ITEM,
  ALLOW_WORKS_LIST_ENTRY,
  pickEntryField,
  readSlot,
  toEditorAwareHref,
} from "./shared";

const contentCardImageFields = buildImageFieldTriple("imageSrc");
const parameterGridImageFields = buildImageFieldTriple("mediaSrc", {
  defaultPreset: "ratio-21-9",
  fitModeKey: "imageFitMode",
  presetKey: "imagePreset",
  srcLabel: "Media Source",
});
const highDensityPhase3ImageFields = buildImageFieldTriple("phase3ImageSrc", {
  fitModeLabel: "Phase 3 Image Fit Mode",
  presetLabel: "Phase 3 Image Preset",
  srcLabel: "Phase 3 Image Source",
});
const projectSectionImageFields = buildImageFieldTriple("imageSrc");
const worksListEntryImageFields = buildImageFieldTriple("imageSrc", {
  defaultPreset: "ratio-21-9",
});
const nextProjectImageFields = buildImageFieldTriple("nextBg", {
  defaultPreset: "ratio-21-9",
  defaultSrc: "/images/penguin/CyberRestaurant.webp",
  fitModeKey: "imageFitMode",
  presetKey: "imagePreset",
  srcLabel: "Next Background",
});
const CONTENT_CARD_IMAGE_POSITION_VALUES = ["left", "right"] as const;
const PROJECT_SECTION_ALIGN_VALUES = ["auto", "left", "right"] as const;
const BOOLEAN_SELECT_VALUES = [false, true] as const;
type ParameterGridParameters = ComponentProps<typeof ParameterGrid>["parameters"];

function buildTriptychColumnFields(column: 1 | 2 | 3) {
  return {
    [`_g_col${column}`]: createFieldGroup(`列 ${column}`),
    [`col${column}Title`]: { type: "text", contentEditable: true, label: `Column ${column} Title` },
    [`col${column}Text`]: { type: "textarea", contentEditable: true, label: `Column ${column} Text` },
    [`col${column}Img`]: { type: "text", label: `Column ${column} Image` },
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

function buildPhaseTextFields(phase: 1 | 2 | 3) {
  return {
    [`phase${phase}Label`]: { type: "text", contentEditable: true, label: `Phase ${phase} Label` },
    [`phase${phase}Title`]: { type: "text", contentEditable: true, label: `Phase ${phase} Title` },
    [`phase${phase}Subtitle`]: { type: "text", contentEditable: true, label: `Phase ${phase} Subtitle` },
    [`phase${phase}Content`]: { type: "textarea", contentEditable: true, label: `Phase ${phase} Content` },
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

function readPhaseTextFields(props: Record<string, unknown>, phase: 1 | 2 | 3) {
  return {
    content: props[`phase${phase}Content`] as string,
    label: props[`phase${phase}Label`] as string,
    subtitle: props[`phase${phase}Subtitle`] as string,
    title: props[`phase${phase}Title`] as string,
  };
}

function readTriptychColumnFields(props: Record<string, unknown>, column: 1 | 2 | 3) {
  return {
    fitMode: castImageFitMode(props[`col${column}FitMode`]),
    img: props[`col${column}Img`] as string,
    preset: castImagePreset(props[`col${column}Preset`]),
    text: props[`col${column}Text`] as string,
    title: props[`col${column}Title`] as string,
  };
}

function resolveNextWorkHref(href: string | undefined, nextId: string | undefined) {
  return href || `/works/${nextId ?? ""}`;
}

// TODO(component-lab): defaultProps 中的字面量文案与图片路径需迁移到 ComponentLab 预设链路，当前为兼容历史 JSON 暂留。
// NextProjectBlock 字段名固化在历史 JSON，统一收敛需要内容校验升级与 JSON migration，不在本轮改 schema。
export const worksComponents = {
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
        title: { type: "text", label: "Title" },
        unlitSrc: { type: "text", label: "Unlit Source" },
        litSrc: { type: "text", label: "Lit Source" },
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
      render: ({ title, unlitSrc, litSrc, alt, imagePreset, imageFitMode, initialPosition, leftLabel, rightLabel, editMode }) => (
        <ImageSlider
          title={title}
          unlitSrc={unlitSrc}
          litSrc={litSrc}
          alt={alt}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          initialPosition={typeof initialPosition === "number" ? initialPosition : 50}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          editMode={editMode}
        />
      )
    },

    ContentCard: {
      fields: {
        _g_text: createFieldGroup("文本内容"),
        title: { type: "text", contentEditable: true, label: "Title" },
        description: { type: "textarea", contentEditable: true, label: "Description" },
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
      render: ({ title, description, imageSrc, imagePreset, imageFitMode, imagePosition }) => (
        <ContentCard
          title={title}
          description={description}
          imageSrc={imageSrc}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          imagePosition={castSelectValue(imagePosition, CONTENT_CARD_IMAGE_POSITION_VALUES, "right")}
        />
      )
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
      render: (props) => {
        const col1 = readTriptychColumnFields(props, 1);
        const col2 = readTriptychColumnFields(props, 2);
        const col3 = readTriptychColumnFields(props, 3);

        return (
          <BreakdownTriptych
            col1Title={col1.title}
            col1Text={col1.text}
            col1Img={col1.img}
            col1Preset={col1.preset}
            col1FitMode={col1.fitMode}
            col2Title={col2.title}
            col2Text={col2.text}
            col2Img={col2.img}
            col2Preset={col2.preset}
            col2FitMode={col2.fitMode}
            col3Title={col3.title}
            col3Text={col3.text}
            col3Img={col3.img}
            col3Preset={col3.preset}
            col3FitMode={col3.fitMode}
          />
        );
      }
    },

    ParameterGrid: {
      fields: {
        _g_media: createFieldGroup("媒体配置"),
        ...parameterGridImageFields.fields,
        isVideo: {
          type: "select",
          label: "Is Video",
          options: [
            { label: "Image", value: false },
            { label: "Video", value: true }
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
        ...parameterGridImageFields.defaults,
        isVideo: false,
        parameters: []
      },
      render: ({ mediaSrc, imagePreset, imageFitMode, isVideo, parameters }) => (
        <ParameterGrid
          mediaSrc={mediaSrc}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          isVideo={castSelectValue(coerceLegacyBooleanSelectValue(isVideo), BOOLEAN_SELECT_VALUES, false)}
          parameters={parameters as ParameterGridParameters}
        />
      )
    },

    HighDensityInfoBlock: {
      fields: {
        _g_phase1: createFieldGroup("阶段 1"),
        ...buildPhaseTextFields(1),
        phase1Items: { type: "slot", label: "Phase 1 Items" },
        _g_phase2: createFieldGroup("阶段 2"),
        ...buildPhaseTextFields(2),
        phase2Items: { type: "slot", label: "Phase 2 Items" },
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
      render: (props) => {
        const { items: phase1FallbackItems, SlotComponent: Phase1ItemsSlot } = readSlot(
          props.phase1Items,
          (item) => ({
            label: pickEntryField(item, "label") ?? "",
            value: pickEntryField(item, "value") ?? "",
          }),
        );
        const { items: phase2FallbackItems, SlotComponent: Phase2ItemsSlot } = readSlot(
          props.phase2Items,
          (item) => ({
            label: pickEntryField(item, "label") ?? "",
            value: pickEntryField(item, "value") ?? "",
          }),
        );

        const phase1 = {
          ...readPhaseTextFields(props, 1),
          items: phase1FallbackItems,
        };
        const phase2 = {
          ...readPhaseTextFields(props, 2),
          items: phase2FallbackItems,
        };
        const phase3 = {
          ...readPhaseTextFields(props, 3),
          imageSrc: props.phase3ImageSrc,
          imagePreset: castImagePreset(props.phase3ImagePreset),
          imageFitMode: castImageFitMode(props.phase3ImageFitMode),
        };
        return (
          <HighDensityInfoBlock
            phase1={phase1}
            phase2={phase2}
            phase3={phase3}
            phase1ItemsContent={Phase1ItemsSlot ? <Phase1ItemsSlot allow={ALLOW_METADATA_LIST_ITEM} className="space-y-3" minEmptyHeight={20} /> : undefined}
            phase2ItemsContent={Phase2ItemsSlot ? <Phase2ItemsSlot allow={ALLOW_METADATA_LIST_ITEM} className="space-y-3" minEmptyHeight={20} /> : undefined}
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
        ...projectSectionImageFields.fields,
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
        link: "",
        index: 0,
        align: "auto",
      },
      render: ({ title, subtitle, imageSrc, imagePreset, imageFitMode, link, index, align, editMode }) => (
        <ProjectSection
          title={title}
          subtitle={subtitle}
          imageSrc={imageSrc}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          link={toEditorAwareHref(link, editMode)}
          index={index}
          align={castSelectValue(align, PROJECT_SECTION_ALIGN_VALUES, "auto")}
          editMode={editMode}
        />
      )
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

    WorksList: {
      fields: {
        heading: { type: "text", contentEditable: true, label: "Heading" },
        entries: { type: "slot", label: "Entries" }
      },
      defaultProps: {
        heading: "",
        entries: []
      },
      render: ({ heading, entries, editMode }) => {
        const { items: fallbackWorks = [], SlotComponent: EntriesSlot } = readSlot(
          entries,
          (entry) => ({
            id: pickEntryField<string>(entry, "id") ?? "",
            number: pickEntryField<string>(entry, "number"),
            href: toEditorAwareHref(pickEntryField(entry, "href"), editMode),
            title: pickEntryField<string>(entry, "title") ?? "",
            category: pickEntryField<string>(entry, "category") ?? "",
            imageSrc: normalizeImageSrc(pickEntryField(entry, "imageSrc")),
            imagePreset: castImagePreset(
              pickEntryField(entry, "imagePreset") ?? worksListEntryImageFields.defaults.imagePreset,
            ),
            imageFitMode: castImageFitMode(
              pickEntryField(entry, "imageFitMode") ?? worksListEntryImageFields.defaults.imageFitMode,
            ),
            desc: pickEntryField<string>(entry, "desc") ?? "",
          }),
        );

        return (
          <WorksList
            heading={heading}
            works={fallbackWorks}
            entriesContent={EntriesSlot ? <EntriesSlot allow={ALLOW_WORKS_LIST_ENTRY} className="flex flex-col w-full" minEmptyHeight={48} /> : undefined}
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
        ...worksListEntryImageFields.fields,
      },
      defaultProps: {
        number: "",
        href: "",
        title: "",
        category: "",
        ...worksListEntryImageFields.defaults,
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
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
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
        href: { type: "text", label: "Href" },
        _g_image: createFieldGroup("图片配置"),
        ...nextProjectImageFields.fields,
      },
      defaultProps: {
        nextId: "penguin",
        nextName: "PENGUIN TRADING CO.",
        href: "/works/penguin",
        ...nextProjectImageFields.defaults,
      },
      render: ({ nextId, nextName, href, nextBg, imagePreset, imageFitMode, editMode }) => (
        <NextProjectBlock
          nextId={nextId}
          nextName={nextName}
          nextBg={nextBg}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          href={toEditorAwareHref(resolveNextWorkHref(href, nextId), editMode)}
          editMode={editMode}
        />
      )
    },
} satisfies Config["components"];
