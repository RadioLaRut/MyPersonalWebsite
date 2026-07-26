import "server-only";

import { cache } from "react";

import { contentRepository } from "./content-repository.ts";

export const readPublicPage = cache(async (slug: string) =>
  contentRepository.readPage(slug),
);

export const readPublicProjectCatalog = cache(async () =>
  contentRepository.readProjectCatalog(),
);

export const listPublicPages = cache(async () =>
  contentRepository.listPages(),
);
