import {
  PUCK_COMPONENT_DESCRIPTORS,
  type PuckComponentType,
} from "./component-manifest.ts";

export const PUBLIC_RENDERER_MODULE_NAMES = Object.fromEntries(
  PUCK_COMPONENT_DESCRIPTORS.map((descriptor) => [
    descriptor.type,
    descriptor.rendererKey,
  ]),
) as Record<PuckComponentType, string>;
