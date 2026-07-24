import path from "node:path";

import {
  ContentBudgetExceededError,
  ContentQuotaExceededError,
} from "./content-budget.ts";
import {
  type JsonValue,
  listPageSlugs,
  readPageDataByNormalizedSlug,
  writePageDataByNormalizedSlug,
} from "./puck-content.ts";
import {
  PageDocumentValidationError,
  type PageDocument,
  parseEditorPageDraft,
  parseCurrentPageDocument,
  validateCurrentPageDocument,
  validatePageReferences,
} from "./page-document-contract.ts";
import {
  createProjectCatalogProjection,
  type ProjectCatalog,
} from "./project-catalog.ts";
import {
  type NormalizedPuckSlug,
  normalizePuckSlugInput,
} from "./puck-slug.ts";

type ContentRepositoryDependencies = {
  listSlugs: () => Promise<string[]>;
  publicRoot: string;
  readData: (slug: NormalizedPuckSlug) => Promise<JsonValue>;
  writeData: (slug: NormalizedPuckSlug, data: JsonValue) => Promise<void>;
};

export type ContentPageEntry = {
  document: PageDocument;
  slug: string;
};

export type PublishPageResult = {
  ok: true;
  path: string;
  slug: string;
  slugs: string[];
};

export class ContentNotFoundError extends Error {
  readonly code = "CONTENT_NOT_FOUND";
  readonly slug: string;

  constructor(slug: string, options?: ErrorOptions) {
    super(`Content page "${slug}" does not exist`, options);
    this.name = "ContentNotFoundError";
    this.slug = slug;
  }
}

export class StoredContentInvalidError extends Error {
  readonly code = "INVALID_STORED_CONTENT";
  readonly slug: string;

  constructor(slug: string, options?: ErrorOptions) {
    super(`Stored content page "${slug}" is invalid`, options);
    this.name = "StoredContentInvalidError";
    this.slug = slug;
  }
}

export class ContentPersistenceError extends Error {
  readonly code = "CONTENT_PERSISTENCE_ERROR";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ContentPersistenceError";
  }
}

const defaultDependencies: ContentRepositoryDependencies = {
  listSlugs: listPageSlugs,
  publicRoot: path.resolve(process.cwd(), "public"),
  readData: readPageDataByNormalizedSlug,
  writeData: writePageDataByNormalizedSlug,
};

export class ContentRepository {
  private readonly dependencies: ContentRepositoryDependencies;

  constructor(dependencies: Partial<ContentRepositoryDependencies> = {}) {
    this.dependencies = { ...defaultDependencies, ...dependencies };
  }

  async readPage(rawSlug: string | string[] | undefined): Promise<PageDocument> {
    const normalizedSlug = normalizePuckSlugInput(rawSlug);
    let storedData: JsonValue;
    try {
      storedData = await this.dependencies.readData(normalizedSlug);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new ContentNotFoundError(normalizedSlug.slugKey, { cause: error });
      }
      if (error instanceof SyntaxError) {
        throw new StoredContentInvalidError(normalizedSlug.slugKey, { cause: error });
      }
      if (error instanceof ContentBudgetExceededError) {
        throw new StoredContentInvalidError(normalizedSlug.slugKey, { cause: error });
      }
      throw error;
    }

    try {
      return parseCurrentPageDocument(storedData);
    } catch (error) {
      if (error instanceof PageDocumentValidationError) {
        throw new StoredContentInvalidError(normalizedSlug.slugKey, { cause: error });
      }
      throw error;
    }
  }

  async listPages(): Promise<ContentPageEntry[]> {
    const slugs = await this.listPageSlugs();
    return Promise.all(
      slugs.map(async (slug) => ({
        document: await this.readPage(slug),
        slug,
      })),
    );
  }

  async listPageSlugs(): Promise<string[]> {
    return this.dependencies.listSlugs();
  }

  async publishPage(
    rawSlug: string | string[] | undefined,
    draft: unknown,
  ): Promise<PublishPageResult> {
    const normalizedSlug = normalizePuckSlugInput(rawSlug);
    const document = parseEditorPageDraft(draft);
    const referenceIssues = validatePageReferences(document, this.dependencies.publicRoot);
    if (referenceIssues.length > 0) {
      throw new PageDocumentValidationError(referenceIssues);
    }

    let knownSlugs: string[] | undefined;
    if (normalizedSlug.slugKey === "works") {
      let catalog: ProjectCatalog;
      try {
        catalog = createProjectCatalogProjection(document);
      } catch (error) {
        throw new PageDocumentValidationError([{
          message: error instanceof Error ? error.message : "invalid project catalog",
          path: "$.content.WorksList.entries",
        }]);
      }

      try {
        knownSlugs = await this.dependencies.listSlugs();
      } catch (error) {
        throw new ContentPersistenceError("Failed to validate project catalog pages", { cause: error });
      }
      const knownSlugSet = new Set(knownSlugs);
      const missingIssues = catalog.entries
        .filter((entry) => !knownSlugSet.has(`works/${entry.id}`))
        .map((entry) => ({
          message: `catalog project page "works/${entry.id}" does not exist`,
          path: "$.content.WorksList.entries",
        }));
      if (missingIssues.length > 0) {
        throw new PageDocumentValidationError(missingIssues);
      }
    }

    try {
      await this.dependencies.writeData(normalizedSlug, document as JsonValue);
    } catch (error) {
      if (
        error instanceof ContentBudgetExceededError ||
        error instanceof ContentQuotaExceededError
      ) {
        throw error;
      }
      throw new ContentPersistenceError("Failed to persist page content", { cause: error });
    }

    let storedData: JsonValue;
    try {
      storedData = await this.dependencies.readData(normalizedSlug);
      const readBackIssues = validateCurrentPageDocument(storedData);
      if (readBackIssues.length > 0) {
        throw new Error("Published page failed strict read-back validation");
      }
    } catch (error) {
      throw new ContentPersistenceError("Failed to verify persisted page content", { cause: error });
    }

    if (JSON.stringify(storedData) !== JSON.stringify(document)) {
      throw new ContentPersistenceError("Published page failed read-back verification");
    }

    const slugs = knownSlugs ?? await this.listPageSlugs().catch(() => []);

    return {
      ok: true,
      path: normalizedSlug.relativeJsonPath,
      slug: normalizedSlug.slugKey,
      slugs,
    };
  }

  async readProjectCatalog(): Promise<ProjectCatalog> {
    const worksPage = await this.readPage("works");
    try {
      return createProjectCatalogProjection(worksPage);
    } catch (error) {
      throw new StoredContentInvalidError("works", { cause: error });
    }
  }
}

export const contentRepository = new ContentRepository();
