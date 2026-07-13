import { contentRepository } from "@/lib/content-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadLightingIndexPublicRenderer } from "@/puck/generated/lighting-index-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await contentRepository.readPage("works/lighting-portfolio"));
}

export default async function LightingPortfolioPage() {
  return renderPuckPage("works/lighting-portfolio", loadLightingIndexPublicRenderer);
}
