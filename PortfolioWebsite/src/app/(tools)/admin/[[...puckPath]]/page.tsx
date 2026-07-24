import { notFound } from "next/navigation";

import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import PuckEditorClient from "@/puck/editor-client";

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

  return <PuckEditorClient initialSlug={initialSlug} />;
}
