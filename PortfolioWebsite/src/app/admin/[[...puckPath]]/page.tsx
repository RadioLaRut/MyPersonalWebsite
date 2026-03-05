import { notFound } from "next/navigation";

import { normalizePuckSlugInput, SlugValidationError } from "@/lib/puck-slug";
import { assertLocalEditorAccess } from "@/lib/security";
import PuckEditorClient from "@/puck/editor-client";

type AdminPuckPageParams = {
  puckPath?: string[];
};

export default function AdminPuckPage({
  params,
}: {
  params: AdminPuckPageParams;
}) {
  assertLocalEditorAccess("page");

  let initialSlug = "index";
  try {
    initialSlug = normalizePuckSlugInput(params.puckPath).slugKey;
  } catch (error) {
    if (error instanceof SlugValidationError) {
      notFound();
    }

    throw error;
  }

  return <PuckEditorClient initialSlug={initialSlug} />;
}
