import { createPageMetadata } from "@/lib/page-metadata";
import { readPublicPage } from "@/lib/public-content-service";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadWorksIndexPublicRenderer } from "@/puck/generated/works-index-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await readPublicPage("works"));
}

export default async function WorksPage() {
  return renderPuckPage("works", loadWorksIndexPublicRenderer);
}
