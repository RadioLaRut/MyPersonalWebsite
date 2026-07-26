import { notFound } from "next/navigation";

import { createPageMetadata } from "@/lib/page-metadata";
import {
  listPublicPages,
  readPublicPage,
} from "@/lib/public-content-service";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadLightingDetailPublicRenderer } from "@/puck/generated/lighting-detail-public-renderer-loaders";

type LightingCollectionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listPublicPages())
    .filter((page) => {
      const segments = page.slug.split("/");
      return segments.length === 3 &&
        segments[0] === "works" &&
        segments[1] === "lighting-portfolio";
    })
    .map((page) => ({ id: page.slug.split("/")[2] }));
}

export async function generateMetadata({ params }: LightingCollectionPageProps) {
  const { id } = await params;
  return createPageMetadata(
    await readPublicPage(`works/lighting-portfolio/${id}`),
  );
}

export default async function LightingCollectionPage({ params }: LightingCollectionPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return renderPuckPage(
    ["works", "lighting-portfolio", id],
    loadLightingDetailPublicRenderer,
  );
}
