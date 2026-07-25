import type { Config } from "@puckeditor/core";

import { CANONICAL_PUCK_RENDERERS } from "@/puck/canonical-renderers";
import { PUCK_COMPONENT_CATEGORIES, PUCK_COMPONENT_TYPES } from "@/puck/component-manifest";
import { contactCommonComponents } from "@/puck/config/contact-common-components";
import { consolidatedComponents } from "@/puck/config/consolidated-components";
import type { ComponentDefinition } from "@/puck/config/component-definition";
import { layoutComponents } from "@/puck/config/layout-components";
import { lightingComponents } from "@/puck/config/lighting-components";
import { worksComponents } from "@/puck/config/works-components";
import { createImageSourceField } from "@/puck/fields/image-source-field";

const componentDefinitions = {
  ...consolidatedComponents,
  ...layoutComponents,
  ...worksComponents,
  ...lightingComponents,
  ...contactCommonComponents,
};

const definitionRegistry = componentDefinitions as Record<string, ComponentDefinition>;
const components = Object.fromEntries(
  PUCK_COMPONENT_TYPES.map((type) => {
    const definition = definitionRegistry[type];
    if (!definition) {
      throw new Error(`Missing Puck component definition for "${type}"`);
    }
    return [type, { ...definition, render: CANONICAL_PUCK_RENDERERS[type] }];
  }),
) as Config["components"];

export const config: Config = {
  categories: PUCK_COMPONENT_CATEGORIES,
  components,
  root: {
    label: "页面设置",
    fields: {
      title: { type: "text", label: "页面标题|title" },
      description: { type: "textarea", label: "描述|description" },
      image: createImageSourceField("分享图片|image"),
    },
    defaultProps: {
      description: "",
      image: "",
      noIndex: true,
      title: "",
    },
  },
};

function assertConfigComponentsMatchManifest(currentConfig: Config) {
  const configured = new Set(Object.keys(currentConfig.components));
  const manifest: ReadonlySet<string> = new Set(PUCK_COMPONENT_TYPES);
  const missing = [...manifest].filter((type) => !configured.has(type));
  const extra = [...configured].filter((type) => !manifest.has(type));

  if (missing.length === 0 && extra.length === 0) return;

  throw new Error(
    [
      "Puck component manifest mismatch.",
      `missing in config: ${missing.join(", ") || "none"}`,
      `extra in config: ${extra.join(", ") || "none"}`,
    ].join("\n"),
  );
}

if (process.env.NODE_ENV !== "production") {
  assertConfigComponentsMatchManifest(config);
}

export default config;
