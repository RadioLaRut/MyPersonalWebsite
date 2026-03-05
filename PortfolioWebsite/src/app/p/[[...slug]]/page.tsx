import fs from "node:fs/promises";

import { Render } from "@measured/puck";
import { notFound } from "next/navigation";

import { listStaticPuckRouteParams } from "@/lib/puck-content";
import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import config from "@/puck/config";

type PuckPageParams = {
  slug?: string[];
};

export const dynamic = "error";
export const dynamicParams = false;

export async function generateStaticParams() {
  return listStaticPuckRouteParams();
}

export default async function PuckPage({ params }: { params: PuckPageParams }) {
  try {
    const normalizedSlug = normalizePuckSlugInput(params.slug);
    const rawFile = await fs.readFile(normalizedSlug.absoluteJsonPath, "utf8");
    const data = JSON.parse(rawFile);

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
