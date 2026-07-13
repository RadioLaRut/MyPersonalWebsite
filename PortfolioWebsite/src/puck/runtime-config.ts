import type { ComponentDesignDocument } from "../lib/component-design-schema.ts";
import type { PageDocument } from "../lib/page-document-contract.ts";
import { loadPublicRenderer } from "./public-renderer-loaders.ts";
import { createPublicRuntimeConfig as createRuntimeConfig } from "./runtime-config-core.ts";

export async function createPublicRuntimeConfig(
  document: PageDocument,
  designDocument?: ComponentDesignDocument,
) {
  return createRuntimeConfig(document, {
    designDocument,
    loadRenderer: loadPublicRenderer,
  });
}
