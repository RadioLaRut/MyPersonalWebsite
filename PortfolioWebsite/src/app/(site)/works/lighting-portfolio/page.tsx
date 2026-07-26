import { createPageMetadata } from "@/lib/page-metadata";
import { readPublicPage } from "@/lib/public-content-service";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadLightingIndexPublicRenderer } from "@/puck/generated/lighting-index-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await readPublicPage("works/lighting-portfolio"));
}

export default async function LightingPortfolioPage() {
  return renderPuckPage("works/lighting-portfolio", loadLightingIndexPublicRenderer);
}
