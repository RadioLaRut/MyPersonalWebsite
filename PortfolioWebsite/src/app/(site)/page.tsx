import { contentRepository } from "@/lib/content-repository";
import { createPageMetadata } from "@/lib/page-metadata";
import { renderHomePage } from "@/lib/render-home-page";

export async function generateMetadata() {
  return createPageMetadata(await contentRepository.readPage("index"));
}

export default async function Home() {
  return renderHomePage();
}
