import type { ComponentDefinitionRegistry } from "./component-definition";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";
import { buildImagePickerFieldTriple } from "@/puck/fields/image-source-field";

const lightingProjectImageFields = buildImagePickerFieldTriple("coverImage", {
  defaultFitMode: "cover",
  defaultPreset: "ratio-21-9",
  defaultSrc: CANONICAL_PLACEHOLDER_PATH,
  fitModeKey: "imageFitMode",
  presetKey: "imagePreset",
  srcLabel: "Cover Image",
});

export const lightingComponents = {
    LightingProjectCard: {
      fields: {
        number: { type: "text", label: "Number" },
        title: { type: "text", label: "Title" },
        ...lightingProjectImageFields.fields,
        href: { type: "text", label: "Href" },
      },
      defaultProps: {
        number: "01",
        title: "Collection Title",
        ...lightingProjectImageFields.defaults,
        href: "/works/lighting-portfolio/collection-1",
      },
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
    },
} satisfies ComponentDefinitionRegistry;
