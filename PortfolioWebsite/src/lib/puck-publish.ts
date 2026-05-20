import type { JsonValue } from "./puck-content.ts";
import type { NormalizedPuckSlug } from "./puck-slug.ts";

type PublishPuckPageOptions = {
  data: JsonValue;
  listPageSlugs: () => Promise<string[]>;
  normalizedSlug: NormalizedPuckSlug;
  writePageData: (normalizedSlug: NormalizedPuckSlug, data: JsonValue) => Promise<void>;
};

export type PublishPuckPageResult = {
  ok: true;
  path: string;
  slug: string;
  slugs?: string[];
};

export async function publishPuckPage({
  data,
  listPageSlugs,
  normalizedSlug,
  writePageData,
}: PublishPuckPageOptions): Promise<PublishPuckPageResult> {
  await writePageData(normalizedSlug, data);

  let slugs: string[] | undefined;
  try {
    slugs = await listPageSlugs();
  } catch {
    slugs = undefined;
  }

  const result: PublishPuckPageResult = {
    ok: true,
    path: normalizedSlug.relativeJsonPath,
    slug: normalizedSlug.slugKey,
  };

  if (slugs) {
    result.slugs = slugs;
  }

  return result;
}
