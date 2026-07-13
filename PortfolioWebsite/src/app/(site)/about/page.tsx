import { contentRepository } from "@/lib/content-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { renderPuckPage } from "@/lib/render-puck-page";
import { loadAboutPublicRenderer } from "@/puck/generated/about-public-renderer-loaders";

export async function generateMetadata() {
  return createPageMetadata(await contentRepository.readPage("about"));
}

export default function AboutPage() {
  return renderPuckPage("about", loadAboutPublicRenderer);
}
