import { notFound, redirect } from "next/navigation";

import { renderPuckPage } from "@/lib/render-puck-page";
import { isLegacyWorkSlug, toCanonicalWorkSlug } from "@/lib/public-paths";

type WorkDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  if (!params.id || params.id === "lighting-portfolio") {
    notFound();
  }

  const canonicalId = toCanonicalWorkSlug(params.id);
  if (isLegacyWorkSlug(params.id)) {
    redirect(`/works/${canonicalId}`);
  }

  return renderPuckPage(["works", canonicalId]);
}
