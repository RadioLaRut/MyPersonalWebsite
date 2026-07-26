import type { ComponentConfig, Config } from "@puckeditor/core";

import type { ComponentDesignDocument } from "../lib/component-design-v2.ts";
import {
  findPublicMediaPreloadCandidate,
  getMediaLayoutProfile,
  type MediaLayoutProfileKey,
  type PublicMediaHint,
} from "../lib/media-layout.ts";
import type { PageDocument } from "../lib/page-document-contract.ts";
import {
  isKnownPuckComponentType,
  PUCK_COMPONENT_DESCRIPTOR_BY_TYPE,
  type PuckComponentType,
} from "./component-manifest.ts";
import { renderWithAdapter } from "./render-adapter.ts";
import { collectPuckComponentTypes } from "./runtime-component-types.ts";

export type PublicRendererLoader = (
  type: PuckComponentType,
) => Promise<ComponentConfig["render"]>;

export type PublicRuntimeConfigOptions = {
  designDocument?: ComponentDesignDocument;
  loadRenderer: PublicRendererLoader;
};

function createPublicAdapter(
  type: PuckComponentType,
  renderer: ComponentConfig["render"],
  designDocument?: ComponentDesignDocument,
  firstMedia?: ReturnType<typeof findPublicMediaPreloadCandidate>,
): ComponentConfig["render"] {
  return (props) => {
    const safeProps = props ?? {};
    const isFirstMedia =
      Boolean(firstMedia) &&
      typeof safeProps.id === "string" &&
      safeProps.id === firstMedia?.componentId;
    const descriptor = PUCK_COMPONENT_DESCRIPTOR_BY_TYPE[type];
    let profileKey = "mediaProfile" in descriptor
      ? descriptor.mediaProfile
      : undefined;
    if (type === "ImagePanel" && safeProps.variant === "fullscreen") {
      profileKey = "full-bleed";
    } else if (
      type === "ProjectCoverLink" &&
      safeProps.variant === "card"
    ) {
      profileKey = "grid-10";
    }
    const profile = getMediaLayoutProfile(
      (profileKey ?? "grid-12") as MediaLayoutProfileKey,
    );
    const preset = typeof safeProps.imagePreset === "string"
      ? safeProps.imagePreset
      : typeof safeProps.preset === "string"
        ? safeProps.preset
        : "";
    const dimensions = preset === "ratio-21-9"
      ? { width: 2100, height: 900 }
      : { width: 1600, height: 900 };
    const publicMediaHint: PublicMediaHint | undefined = isFirstMedia && firstMedia
      ? {
          ...dimensions,
          preload: true,
          profile: profile.key,
          sizes: profile.sizes,
          src: firstMedia.src,
        }
      : undefined;

    return renderWithAdapter({
      designDocument,
      props: safeProps,
      publicMediaHint,
      render: renderer,
      surface: "public",
      type,
    });
  };
}

export async function createPublicRuntimeConfig(
  document: PageDocument,
  { designDocument, loadRenderer }: PublicRuntimeConfigOptions,
): Promise<Config> {
  const usedTypes = collectPuckComponentTypes(document);
  const firstMedia = findPublicMediaPreloadCandidate(
    document,
    (component) => {
      if (!isKnownPuckComponentType(component.type)) return false;
      const descriptor = PUCK_COMPONENT_DESCRIPTOR_BY_TYPE[component.type];
      return (
        "mediaPreload" in descriptor &&
        descriptor.mediaPreload === "first-viewport"
      );
    },
  );
  const components = Object.fromEntries(
    await Promise.all([...usedTypes].map(async (type) => {
      const loadedRenderer = await loadRenderer(type);
      if (typeof loadedRenderer !== "function") {
        throw new Error(`Missing public renderer for Puck component "${type}"`);
      }

      const render = createPublicAdapter(
        type,
        loadedRenderer,
        designDocument,
        firstMedia,
      );
      return [type, { render }] as const;
    })),
  );

  return { components };
}
