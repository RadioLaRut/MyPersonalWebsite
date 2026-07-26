import { createPageMetadata } from "@/lib/page-metadata";
import { readPublicPage } from "@/lib/public-content-service";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadAboutPublicRenderer } from "@/puck/generated/about-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await readPublicPage("about"));
}

export default function AboutPage() {
  return renderPuckPage("about", loadAboutPublicRenderer);
}
