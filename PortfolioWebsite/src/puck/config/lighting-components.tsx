import type { Config } from "@puckeditor/core";
import LightingCollectionHeader from "@/components/works/LightingCollectionHeader";
import LightingProjectCard from "@/components/works/LightingProjectCard";
import { CANONICAL_PLACEHOLDER_PATH } from "@/lib/public-paths";
import {
  buildImageFieldTriple,
  castImageFitMode,
  castImagePreset,
} from "@/puck/fields/image-fields";
import { toEditorAwareHref } from "./shared";

const lightingProjectImageFields = buildImageFieldTriple("coverImage", {
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
        number: { type: "text", contentEditable: true, label: "Number" },
        title: { type: "text", contentEditable: true, label: "Title" },
        ...lightingProjectImageFields.fields,
        href: { type: "text", label: "Href" },
      },
      defaultProps: {
        number: "01",
        title: "Collection Title",
        ...lightingProjectImageFields.defaults,
        href: "/works/lighting-portfolio/collection-1",
      },
      render: ({ number, title, coverImage, href, imagePreset, imageFitMode, editMode }) => (
        <LightingProjectCard
          number={number}
          title={title}
          coverImage={coverImage}
          href={toEditorAwareHref(href, editMode)}
          imagePreset={castImagePreset(imagePreset)}
          imageFitMode={castImageFitMode(imageFitMode)}
          editMode={editMode}
        />
      ),
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
          editMode={editMode}
        />
      ),
    },
} satisfies Config["components"];
