import type { Metadata } from "next";

import type { PageDocument } from "./page-document-contract.ts";

type PageMetadataOverrides = {
  description?: string;
  image?: string;
  title?: string;
};

export function createPageMetadata(
  document: PageDocument,
  overrides: PageMetadataOverrides = {},
): Metadata {
  const title = overrides.title || document.root.props.title || "JIANG CHENGYAN";
  const description = overrides.description || document.root.props.description || undefined;
  const image = overrides.image || document.root.props.image || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      ...(description ? { description } : {}),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    robots: document.root.props.noIndex ? { follow: false, index: false } : undefined,
  };
}
