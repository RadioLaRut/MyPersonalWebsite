import { notFound } from "next/navigation";

import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import { readComponentLabInstanceCatalog } from "@/lib/component-lab-presets";
import PuckEditorClient from "@/puck/editor-client";
import {
  PUCK_COMPONENT_TYPES,
  type PuckComponentType,
} from "@/puck/component-manifest";
import type { ComponentLabNode } from "@/lib/component-lab-presets";

type AdminPuckPageParams = {
  puckPath?: string[];
};

export default async function AdminPuckPage({
  params,
}: {
  params: Promise<AdminPuckPageParams>;
}) {
  const { puckPath } = await params;

  let initialSlug = "index";
  try {
    initialSlug = normalizePuckSlugInput(puckPath).slugKey;
  } catch (error) {
    if (error instanceof SlugValidationError) {
      notFound();
    }

    throw error;
  }

  const catalog = await readComponentLabInstanceCatalog();
  const previewSamples = Object.fromEntries(
    PUCK_COMPONENT_TYPES.map((type) => [
      type,
      catalog.components[type].stressSample.node,
    ]),
  ) as Record<PuckComponentType, ComponentLabNode>;

  return (
    <PuckEditorClient
      initialSlug={initialSlug}
      previewSamples={previewSamples}
    />
  );
}
