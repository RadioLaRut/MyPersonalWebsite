import { redirect } from "next/navigation";

import { normalizePuckSlugInput } from "@/lib/puck-slug";
import { toCanonicalWorkSlug, toPublicPathFromSlugKey } from "@/lib/public-paths";

type LegacyPuckPageParams = {
  slug?: string[];
};

function toCanonicalPublicSlug(slugKey: string) {
  if (!slugKey.startsWith("works/")) {
    return slugKey;
  }

  const segments = slugKey.split("/");
  if (segments.length === 2) {
    return `works/${toCanonicalWorkSlug(segments[1])}`;
  }

  return slugKey;
}

export default function LegacyPuckPage({ params }: { params: LegacyPuckPageParams }) {
  const normalizedSlug = normalizePuckSlugInput(params.slug);
  const publicPath = toPublicPathFromSlugKey(toCanonicalPublicSlug(normalizedSlug.slugKey));
  redirect(publicPath);
}
