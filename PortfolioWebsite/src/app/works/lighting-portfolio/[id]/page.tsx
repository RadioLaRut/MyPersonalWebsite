import { notFound } from "next/navigation";

import { renderPuckPage } from "@/lib/render-puck-page";

type LightingCollectionPageProps = {
  params: {
    id: string;
  };
};

export default async function LightingCollectionPage({ params }: LightingCollectionPageProps) {
  if (!params.id) {
    notFound();
  }

  return renderPuckPage(["works", "lighting-portfolio", params.id]);
}
