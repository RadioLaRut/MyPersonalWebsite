import { contentRepository } from "@/lib/content-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadWorksIndexPublicRenderer } from "@/puck/generated/works-index-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await contentRepository.readPage("works"));
}

export default async function WorksPage() {
  return renderPuckPage("works", loadWorksIndexPublicRenderer);
}
