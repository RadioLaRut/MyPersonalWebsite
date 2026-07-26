import { createPageMetadata } from "@/lib/page-metadata";
import { readPublicPage } from "@/lib/public-content-service";
import { renderHomePage } from "@/lib/render-home-page";

export async function generateMetadata() {
  return createPageMetadata(await readPublicPage("index"));
}

export default async function Home() {
  return renderHomePage();
}
