import { Render, type Data } from "@measured/puck";
import { notFound } from "next/navigation";

import { normalizePuckData } from "@/lib/puck-data-normalization";
import { readPageDataByNormalizedSlug } from "@/lib/puck-content";
import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import config from "@/puck/config";

export async function renderPuckPage(rawSlug: string | string[] | undefined) {
  try {
    const normalizedSlug = normalizePuckSlugInput(rawSlug);
    const data = normalizePuckData(await readPageDataByNormalizedSlug(normalizedSlug) as Data);

    return (
      <main className="min-h-screen bg-black text-white">
        <Render config={config} data={data} />
      </main>
    );
  } catch (error) {
    if (error instanceof SlugValidationError) {
      notFound();
    }

    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      notFound();
    }

    if (error instanceof SyntaxError) {
      notFound();
    }

    throw error;
  }
}
