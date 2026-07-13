import { notFound, redirect } from "next/navigation";

import { contentRepository } from "@/lib/content-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadWorkDetailPublicRenderer } from "@/puck/generated/work-detail-public-renderer-loaders";

type WorkDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const catalog = await contentRepository.readProjectCatalog();
  return catalog.entries
    .filter((project) => project.id !== "lighting-portfolio")
    .flatMap((project) => [project.id, ...project.aliases])
    .map((id) => ({ id }));
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { id } = await params;
  const catalog = await contentRepository.readProjectCatalog();
  const canonicalId = catalog.getCanonicalId(id);
  const [document, project] = await Promise.all([
    contentRepository.readPage(["works", canonicalId]),
    Promise.resolve(catalog.resolveDestination(canonicalId)),
  ]);

  return createPageMetadata(document, {
    image: project?.cover,
    title: document.root.props.title || project?.name,
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;

  if (!id || id === "lighting-portfolio") {
    notFound();
  }

  const catalog = await contentRepository.readProjectCatalog();
  const canonicalId = catalog.getCanonicalId(id);
  if (catalog.getAliasTarget(id)) {
    redirect(`/works/${canonicalId}`);
  }

  return renderPuckPage(["works", canonicalId], loadWorkDetailPublicRenderer);
}
