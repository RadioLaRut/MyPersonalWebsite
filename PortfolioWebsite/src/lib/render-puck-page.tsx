import { Render, type Data } from "@measured/puck";
import { notFound } from "next/navigation";

import { normalizePuckData } from "@/lib/puck-data-normalization";
import { readPageDataByNormalizedSlug } from "@/lib/puck-content";
import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import { synchronizeNextProjectBlocks } from "@/lib/project-catalog";
import config from "@/puck/config";

export async function renderPuckPage(rawSlug: string | string[] | undefined) {
  try {
    const normalizedSlug = normalizePuckSlugInput(rawSlug);
    const normalizedData = normalizePuckData(
      await readPageDataByNormalizedSlug(normalizedSlug) as Data,
    );
    const currentProjectId =
      normalizedSlug.slugSegments.length === 2 && normalizedSlug.slugSegments[0] === "works"
        ? normalizedSlug.slugSegments[1]
        : null;
    const data = currentProjectId
      ? synchronizeNextProjectBlocks(normalizedData, currentProjectId)
      : normalizedData;

    return (
      <main className="min-h-screen bg-black text-white">
        <Render config={config} data={data} />
      </main>
    );
  } catch (error) {
    if (
      error instanceof SlugValidationError ||
      error instanceof SyntaxError ||
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      notFound();
    }
    throw error;
  }
}
