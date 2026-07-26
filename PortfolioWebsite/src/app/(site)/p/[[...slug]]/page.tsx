import { redirect } from "next/navigation";

import { normalizePuckSlugInput } from "@/lib/puck-slug";
import {
  listPublicPages,
  readPublicProjectCatalog,
} from "@/lib/public-content-service";
import { toPublicPathFromSlugKey } from "@/lib/public-paths";

type LegacyPuckPageParams = {
  slug?: string[];
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { slug: [] },
    ...(await listPublicPages())
      .filter((page) => page.slug !== "index")
      .map((page) => ({ slug: page.slug.split("/") })),
  ];
}

function toCanonicalPublicSlug(
  slugKey: string,
  resolveAlias: (slug: string) => string | null,
) {
  if (!slugKey.startsWith("works/")) {
    return slugKey;
  }

  const segments = slugKey.split("/");
  if (segments.length === 2) {
    return `works/${resolveAlias(segments[1]) ?? segments[1]}`;
  }

  return slugKey;
}

export default async function LegacyPuckPage({ params }: { params: Promise<LegacyPuckPageParams> }) {
  const { slug } = await params;
  const normalizedSlug = normalizePuckSlugInput(slug);
  const catalog = await readPublicProjectCatalog();
  const publicPath = toPublicPathFromSlugKey(toCanonicalPublicSlug(
    normalizedSlug.slugKey,
    (candidate) => catalog.getAliasTarget(candidate),
  ));
  redirect(publicPath);
}
