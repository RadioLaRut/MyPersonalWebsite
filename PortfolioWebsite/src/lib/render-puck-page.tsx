import type { Data } from "@puckeditor/core";
import { Render } from "@puckeditor/core/rsc";
import { notFound } from "next/navigation";

import { readComponentDesignConfig } from "@/lib/component-design-config";
import {
  ContentNotFoundError,
  contentRepository,
} from "@/lib/content-repository";
import { normalizePuckSlugInput } from "@/lib/puck-slug";
import { synchronizeNextProjectBlocks } from "@/lib/project-catalog";
import {
  createPublicRuntimeConfig,
  type PublicRendererLoader,
} from "@/puck/runtime-config-core";

export async function renderPuckPage(
  rawSlug: string | string[] | undefined,
  loadRenderer: PublicRendererLoader,
) {
  try {
    const normalizedSlug = normalizePuckSlugInput(rawSlug);
    const [normalizedData, designDocument] = await Promise.all([
      contentRepository.readPage(normalizedSlug.slugSegments),
      readComponentDesignConfig(),
    ]);
    const currentProjectId =
      normalizedSlug.slugSegments.length === 2 && normalizedSlug.slugSegments[0] === "works"
        ? normalizedSlug.slugSegments[1]
        : null;
    const data: Data = currentProjectId
      ? synchronizeNextProjectBlocks(
        normalizedData,
        currentProjectId,
        await contentRepository.readProjectCatalog(),
      )
      : normalizedData;
    const runtimeConfig = await createPublicRuntimeConfig(data as typeof normalizedData, {
      designDocument,
      loadRenderer,
    });

    return (
      <main className="min-h-screen bg-black text-white">
        <Render config={runtimeConfig} data={data} />
      </main>
    );
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      notFound();
    }
    throw error;
  }
}
