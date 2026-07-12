import worksPageData from "../../content/pages/works.json" with { type: "json" };

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readAliasSlugs(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((alias) => (isRecord(alias) ? readString(alias.slug) : readString(alias)))
    .filter(Boolean);
}

function readProjectId(href: string) {
  const match = /^\/works\/([^/]+)$/.exec(href);
  return match?.[1] ?? "";
}

export function createProjectCatalog(data: unknown): ProjectCatalogEntry[] {
  if (!isRecord(data) || !Array.isArray(data.content)) {
    return [];
  }

  const worksList = data.content.find(
    (item) => isRecord(item) && item.type === "WorksList" && isRecord(item.props),
  );
  if (!isRecord(worksList) || !isRecord(worksList.props) || !Array.isArray(worksList.props.entries)) {
    return [];
  }

  return worksList.props.entries.flatMap((entry) => {
    if (!isRecord(entry) || entry.type !== "WorksListEntry" || !isRecord(entry.props)) {
      return [];
    }

    const href = readString(entry.props.href);
    const id = readProjectId(href);
    const name = readString(entry.props.title);
    const cover = readString(entry.props.imageSrc);
    const number = readString(entry.props.number);
    if (!id || !name || !cover || !number) {
      return [];
    }

    return [{
      aliases: readAliasSlugs(entry.props.aliases),
      cover,
      href,
      id,
      name,
      number,
    }];
  });
}

export const PROJECT_CATALOG = createProjectCatalog(worksPageData);

const firstProject = PROJECT_CATALOG[0];
if (!firstProject) {
  throw new Error("作品目录不能为空");
}

const projectById = new Map(PROJECT_CATALOG.map((project) => [project.id, project]));
const canonicalIdByAlias = new Map(
  PROJECT_CATALOG.flatMap((project) => project.aliases.map((alias) => [alias, project.id] as const)),
);

export const WORKS_INDEX_DESTINATION: ProjectDestination = {
  id: "works",
  name: "返回作品索引",
  href: "/works",
  cover: firstProject.cover,
};

export function getCanonicalProjectId(id: string) {
  return canonicalIdByAlias.get(id) ?? id;
}

export function getProjectAliasTarget(id: string) {
  return canonicalIdByAlias.get(id) ?? null;
}

export function resolveProjectDestination(id: string): ProjectDestination | null {
  if (id === WORKS_INDEX_DESTINATION.id) {
    return WORKS_INDEX_DESTINATION;
  }

  const project = projectById.get(getCanonicalProjectId(id));
  return project
    ? { id: project.id, name: project.name, href: project.href, cover: project.cover }
    : null;
}

export function getNextProjectDestination(currentId: string): ProjectDestination | null {
  const canonicalId = getCanonicalProjectId(currentId);
  const currentIndex = PROJECT_CATALOG.findIndex((project) => project.id === canonicalId);
  if (currentIndex < 0) {
    return null;
  }

  const nextProject = PROJECT_CATALOG[currentIndex + 1];
  return nextProject
    ? { id: nextProject.id, name: nextProject.name, href: nextProject.href, cover: nextProject.cover }
    : WORKS_INDEX_DESTINATION;
}

export function synchronizeNextProjectBlocks<T>(data: T, currentId: string): T {
  const nextProject = getNextProjectDestination(currentId);
  if (!nextProject) {
    return data;
  }

  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(visit);
    }

    if (!isRecord(value)) {
      return value;
    }

    const nextValue = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, visit(entry)]),
    );

    if (nextValue.type === "NextProjectBlock" && isRecord(nextValue.props)) {
      nextValue.props = {
        ...nextValue.props,
        nextId: nextProject.id,
      };
    }

    return nextValue;
  };

  return visit(data) as T;
}
