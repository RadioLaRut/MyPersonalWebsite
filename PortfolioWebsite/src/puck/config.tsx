import type { Config } from "@measured/puck";

import { PUCK_COMPONENT_CATEGORIES, PUCK_COMPONENT_TYPES } from "@/puck/component-manifest";
import { contactCommonComponents } from "@/puck/config/contact-common-components";
import { layoutComponents } from "@/puck/config/layout-components";
import { lightingComponents } from "@/puck/config/lighting-components";
import { worksComponents } from "@/puck/config/works-components";

export const config: Config = {
  categories: PUCK_COMPONENT_CATEGORIES,
  components: {
    ...layoutComponents,
    ...worksComponents,
    ...lightingComponents,
    ...contactCommonComponents,
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
