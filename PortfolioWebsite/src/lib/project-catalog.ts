export type ProjectCatalogEntry = {
  aliases: string[];
  cover: string;
  href: string;
  id: string;
  name: string;
  number: string;
};

export type ProjectDestination = {
  cover: string;
  href: string;
  id: string;
  name: string;
};

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(value: unknown, pathName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${pathName} must be a non-empty string`);
  }

  return value.trim();
}

function readAliasSlugs(value: unknown, pathName: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${pathName} must be an array`);
  }

  return value.map((alias, index) => {
    const slug = isRecord(alias) ? alias.slug : alias;
    const normalizedSlug = readRequiredString(slug, `${pathName}[${index}].slug`);
    if (!PROJECT_SLUG_PATTERN.test(normalizedSlug)) {
      throw new Error(`${pathName}[${index}].slug must be a canonical lowercase slug`);
    }
    return normalizedSlug;
  });
}

function readProjectId(href: string, pathName: string) {
  const match = /^\/works\/([^/]+)$/.exec(href);
  if (!match) {
    throw new Error(`${pathName} must match /works/<slug>`);
  }

  if (!PROJECT_SLUG_PATTERN.test(match[1])) {
    throw new Error(`${pathName} must contain a canonical lowercase slug`);
  }

  return match[1];
}

export function createProjectCatalog(data: unknown): ProjectCatalogEntry[] {
  if (!isRecord(data) || !Array.isArray(data.content)) {
    throw new Error("works page must contain a content array");
  }

  const worksLists = data.content.filter(
    (item) => isRecord(item) && item.type === "WorksList" && isRecord(item.props),
  );
  if (worksLists.length !== 1) {
    throw new Error("works page must contain exactly one WorksList");
  }
  const [worksList] = worksLists;
  if (!isRecord(worksList) || !isRecord(worksList.props) || !Array.isArray(worksList.props.entries)) {
    throw new Error("works page must contain one WorksList with entries");
  }

  const entries = worksList.props.entries.map((entry, index) => {
    const pathName = `content.WorksList.entries[${index}]`;
    if (!isRecord(entry) || entry.type !== "WorksListEntry" || !isRecord(entry.props)) {
      throw new Error(`${pathName} must be a WorksListEntry node`);
    }

    const href = readRequiredString(entry.props.href, `${pathName}.props.href`);
    return {
      aliases: readAliasSlugs(entry.props.aliases, `${pathName}.props.aliases`),
      cover: readRequiredString(entry.props.imageSrc, `${pathName}.props.imageSrc`),
      href,
      id: readProjectId(href, `${pathName}.props.href`),
      name: readRequiredString(entry.props.title, `${pathName}.props.title`),
      number: readRequiredString(entry.props.number, `${pathName}.props.number`),
    };
  });

  if (entries.length === 0) {
    throw new Error("作品目录不能为空");
  }

  const allIds = new Set<string>();
  const allNumbers = new Set<string>();
  for (const entry of entries) {
    if (allIds.has(entry.id)) throw new Error(`duplicate project id "${entry.id}"`);
    allIds.add(entry.id);
    if (allNumbers.has(entry.number)) throw new Error(`duplicate project number "${entry.number}"`);
    allNumbers.add(entry.number);
  }

  const allAliases = new Set<string>();
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      if (allIds.has(alias) || allAliases.has(alias)) {
        throw new Error(`duplicate project alias "${alias}"`);
      }
      allAliases.add(alias);
    }
  }

  return entries;
}

export class ProjectCatalog {
  readonly entries: readonly ProjectCatalogEntry[];
  readonly worksIndexDestination: ProjectDestination;
  private readonly canonicalIdByAlias: ReadonlyMap<string, string>;
  private readonly projectById: ReadonlyMap<string, ProjectCatalogEntry>;

  constructor(entries: readonly ProjectCatalogEntry[]) {
    const firstProject = entries[0];
    if (!firstProject) throw new Error("作品目录不能为空");

    this.entries = entries;
    this.projectById = new Map(entries.map((project) => [project.id, project]));
    this.canonicalIdByAlias = new Map(
      entries.flatMap((project) => project.aliases.map((alias) => [alias, project.id] as const)),
    );
    this.worksIndexDestination = {
      cover: firstProject.cover,
      href: "/works",
      id: "works",
      name: "返回作品索引",
    };
  }

  getCanonicalId(id: string) {
    return this.canonicalIdByAlias.get(id) ?? id;
  }

  getAliasTarget(id: string) {
    return this.canonicalIdByAlias.get(id) ?? null;
  }

  resolveDestination(id: string): ProjectDestination | null {
    if (id === this.worksIndexDestination.id) return this.worksIndexDestination;

    const project = this.projectById.get(this.getCanonicalId(id));
    return project
      ? { cover: project.cover, href: project.href, id: project.id, name: project.name }
      : null;
  }

  getNextDestination(currentId: string): ProjectDestination | null {
    const canonicalId = this.getCanonicalId(currentId);
    const currentIndex = this.entries.findIndex((project) => project.id === canonicalId);
    if (currentIndex < 0) return null;

    const nextProject = this.entries[currentIndex + 1];
    return nextProject
      ? { cover: nextProject.cover, href: nextProject.href, id: nextProject.id, name: nextProject.name }
      : this.worksIndexDestination;
  }
}

export function createProjectCatalogProjection(data: unknown) {
  return new ProjectCatalog(createProjectCatalog(data));
}

export function synchronizeNextProjectBlocks<T>(
  data: T,
  currentId: string,
  catalog: ProjectCatalog,
): T {
  const nextProject = catalog.getNextDestination(currentId);
  if (!nextProject) return data;

  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!isRecord(value)) return value;

    const nextValue = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, visit(entry)]),
    );

    if (nextValue.type === "NextProjectBlock" && isRecord(nextValue.props)) {
      nextValue.props = {
        ...nextValue.props,
        href: nextProject.href,
        nextBg: nextProject.cover,
        nextId: nextProject.id,
        nextName: nextProject.name,
      };
    }

    return nextValue;
  };

  return visit(data) as T;
}
