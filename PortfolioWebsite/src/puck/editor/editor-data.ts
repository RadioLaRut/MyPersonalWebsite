import type { ComponentData, Data } from "@puckeditor/core";

import type { PageSummary } from "../../lib/editor-page-contract.ts";
export type {
  CreatePageRequest,
  PageSummary,
} from "../../lib/editor-page-contract.ts";
import { getEditorComponentMeta } from "./component-metadata.ts";
import {
  isKnownPuckComponentType,
  PUCK_COMPONENT_TYPES,
  type PuckComponentType,
} from "../component-manifest.ts";

export const ROOT_INSERTION_ZONE = "root:default-zone";
export const EDITOR_DISPLAY_NAME_MAX_LENGTH = 80;

export type EditorFieldGroup =
  | "content"
  | "media"
  | "link"
  | "layout"
  | "advanced";

export type InsertionTarget = {
  zone: string;
  index: number;
};

export type EditorPageTreeNode = {
  children: EditorPageTreeNode[];
  page: PageSummary | null;
  publicPath: string;
  title: string;
};

export type EditorOutlineNode = {
  id: string;
  type: PuckComponentType;
  displayName: string;
  children: EditorOutlineZone[];
};

export type EditorOutlineZone = {
  zone: string;
  label: string;
  nodes: EditorOutlineNode[];
};

const SLOT_COMPATIBILITY: Partial<
  Record<PuckComponentType, Readonly<Record<string, readonly PuckComponentType[]>>>
> = {
  ContactFlashlight: {
    creativeDirection: ["MetadataListItem"],
    experienceHistory: ["MetadataListItem"],
  },
  EditorialSplit: {
    paragraphs: ["TextParagraphBlock"],
  },
  ThreeColumnSection: {
    col1Items: ["MetadataListItem"],
    col2Items: ["MetadataListItem"],
  },
  WorksList: {
    entries: ["WorksListEntry"],
  },
};

const ROOT_ONLY_COMPONENTS = new Set<PuckComponentType>(
  PUCK_COMPONENT_TYPES.filter((type) => (
    type !== "MetadataListItem" &&
    type !== "TextParagraphBlock" &&
    type !== "WorksListEntry"
  )),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isComponentNode(value: unknown): value is ComponentData {
  return (
    isRecord(value) &&
    isKnownPuckComponentType(value.type) &&
    isRecord(value.props) &&
    typeof value.props.id === "string"
  );
}

export function normalizeEditorDisplayName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().slice(0, EDITOR_DISPLAY_NAME_MAX_LENGTH);
  return normalized || undefined;
}

export function getNodeDisplayName(node: ComponentData) {
  return normalizeEditorDisplayName(node.props.editorDisplayName) ??
    getEditorComponentMeta(node.type)?.label ??
    node.type;
}

function getSlotLabel(slotName: string) {
  const labels: Record<string, string> = {
    creativeDirection: "创作方向",
    col1Items: "第一栏信息",
    col2Items: "第二栏信息",
    entries: "作品条目",
    experienceHistory: "经历信息",
    paragraphs: "正文段落",
  };
  return labels[slotName] ?? slotName;
}

function buildNode(node: ComponentData): EditorOutlineNode {
  const componentType = node.type as PuckComponentType;
  const compatibleSlots = SLOT_COMPATIBILITY[componentType] ?? {};
  const children = Object.keys(compatibleSlots).map((slotName) => {
    const value = node.props[slotName];
    const nodes = Array.isArray(value) ? value.filter(isComponentNode).map(buildNode) : [];
    return {
      zone: `${node.props.id}:${slotName}`,
      label: getSlotLabel(slotName),
      nodes,
    };
  });

  return {
    id: String(node.props.id),
    type: componentType,
    displayName: getNodeDisplayName(node),
    children,
  };
}

export function buildEditorOutline(data: Data): EditorOutlineZone[] {
  const rootNodes = Array.isArray(data.content)
    ? data.content.filter(isComponentNode).map(buildNode)
    : [];

  const legacyZones = isRecord(data.zones)
    ? Object.entries(data.zones)
      .filter(([, value]) => Array.isArray(value))
      .map(([zone, value]) => ({
        zone,
        label: zone.split(":")[1] || zone,
        nodes: (value as unknown[]).filter(isComponentNode).map(buildNode),
      }))
    : [];

  return [
    {
      zone: ROOT_INSERTION_ZONE,
      label: "页面内容",
      nodes: rootNodes,
    },
    ...legacyZones,
  ];
}

function mapNodeById(
  node: ComponentData,
  id: string,
  mapper: (current: ComponentData) => ComponentData,
): ComponentData {
  const nextNode = node.props.id === id ? mapper(node) : node;
  let changed = nextNode !== node;
  const nextProps = Object.fromEntries(
    Object.entries(nextNode.props).map(([key, value]) => {
      if (!Array.isArray(value)) return [key, value];
      const nextValue = value.map((entry) => (
        isComponentNode(entry) ? mapNodeById(entry, id, mapper) : entry
      ));
      if (nextValue.some((entry, index) => entry !== value[index])) changed = true;
      return [key, nextValue];
    }),
  );

  return changed
    ? { ...nextNode, props: nextProps as ComponentData["props"] }
    : nextNode;
}

export function renameEditorNode(
  data: Data,
  id: string,
  rawDisplayName: string,
): Data {
  const displayName = normalizeEditorDisplayName(rawDisplayName);
  const mapper = (node: ComponentData) => {
    const currentDisplayName = normalizeEditorDisplayName(
      node.props.editorDisplayName,
    );
    if (currentDisplayName === displayName) return node;

    const props = { ...node.props };
    if (displayName) props.editorDisplayName = displayName;
    else delete props.editorDisplayName;
    return { ...node, props };
  };

  const content = data.content.map((node) => mapNodeById(node, id, mapper));
  const zones = Object.fromEntries(
    Object.entries(data.zones ?? {}).map(([zone, nodes]) => [
      zone,
      nodes.map((node) => mapNodeById(node, id, mapper)),
    ]),
  );
  const contentChanged = content.some((node, index) => node !== data.content[index]);
  const zonesChanged = Object.entries(zones).some(([zone, nodes]) => (
    nodes.some((node, index) => node !== data.zones?.[zone]?.[index])
  ));

  if (!contentChanged && !zonesChanged) return data;
  return { ...data, content, zones };
}

export function stripEditorMetadata<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripEditorMetadata(entry)) as T;
  }
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "editorDisplayName")
      .map(([key, entry]) => [key, stripEditorMetadata(entry)]),
  ) as T;
}

export function getAllowedComponentsForZone(
  zone: string,
  data: Data,
): ReadonlySet<PuckComponentType> {
  if (zone === ROOT_INSERTION_ZONE) return ROOT_ONLY_COMPONENTS;
  const separatorIndex = zone.indexOf(":");
  if (separatorIndex === -1) return new Set();

  const parentId = zone.slice(0, separatorIndex);
  const slotName = zone.slice(separatorIndex + 1);
  let parentType: PuckComponentType | undefined;

  const visit = (value: unknown) => {
    if (parentType) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!isRecord(value)) return;
    if (
      isKnownPuckComponentType(value.type) &&
      isRecord(value.props) &&
      value.props.id === parentId
    ) {
      parentType = value.type;
      return;
    }
    Object.values(value).forEach(visit);
  };
  visit(data);

  return new Set(parentType ? SLOT_COMPATIBILITY[parentType]?.[slotName] ?? [] : []);
}

export function explainZoneCompatibility(zone: string) {
  if (zone === ROOT_INSERTION_ZONE) return "仅可用于嵌套槽";
  const slotName = zone.split(":").slice(1).join(":");
  const labels: Record<string, string> = {
    creativeDirection: "仅接受元数据列表项",
    entries: "仅接受作品列表项",
    experienceHistory: "仅接受元数据列表项",
    paragraphs: "仅接受文本段落项",
    phase1Items: "仅接受元数据列表项",
    phase2Items: "仅接受元数据列表项",
  };
  return labels[slotName] ?? "不适用于当前插入位置";
}

export function searchPageSummaries(pages: PageSummary[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return pages;
  return pages.filter((page) => (
    page.title.toLocaleLowerCase().includes(normalizedQuery) ||
    page.slug.toLocaleLowerCase().includes(normalizedQuery) ||
    page.publicPath.toLocaleLowerCase().includes(normalizedQuery)
  ));
}

function formatVirtualPageTitle(pathSegment: string) {
  let decodedSegment = pathSegment;

  try {
    decodedSegment = decodeURIComponent(pathSegment);
  } catch {
    // 非法转义仍应保留原始路径片段，避免整个页面树不可用。
  }

  return decodedSegment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

export function buildPageSummaryTree(
  pages: PageSummary[],
  query = "",
): EditorPageTreeNode[] {
  type MutablePageTreeNode = EditorPageTreeNode & {
    firstSeenIndex: number;
    childMap: Map<string, MutablePageTreeNode>;
  };

  const root: MutablePageTreeNode = {
    childMap: new Map(),
    children: [],
    firstSeenIndex: -1,
    page: null,
    publicPath: "/",
    title: "Home",
  };

  pages.forEach((page, pageIndex) => {
    const segments = page.publicPath.split("/").filter(Boolean);

    if (segments.length === 0) {
      root.page = page;
      root.title = page.title || "未命名页面";
      return;
    }

    let parent = root;
    segments.forEach((segment, segmentIndex) => {
      const publicPath = `/${segments.slice(0, segmentIndex + 1).join("/")}`;
      let node = parent.childMap.get(segment);

      if (!node) {
        node = {
          childMap: new Map(),
          children: [],
          firstSeenIndex: pageIndex,
          page: null,
          publicPath,
          title: formatVirtualPageTitle(segment),
        };
        parent.childMap.set(segment, node);
      }

      node.firstSeenIndex = Math.min(node.firstSeenIndex, pageIndex);
      if (segmentIndex === segments.length - 1) {
        node.page = page;
        node.title = page.title || "未命名页面";
      }
      parent = node;
    });
  });

  const matchingPaths = new Set(
    searchPageSummaries(pages, query).map((page) => page.publicPath),
  );
  const hasQuery = query.trim().length > 0;

  const finalizeNode = (
    node: MutablePageTreeNode,
  ): EditorPageTreeNode | null => {
    const children = [...node.childMap.values()]
      .sort((left, right) => (
        left.firstSeenIndex - right.firstSeenIndex ||
        left.publicPath.localeCompare(right.publicPath)
      ))
      .map(finalizeNode)
      .filter((child): child is EditorPageTreeNode => child !== null);
    const matches = node.page
      ? matchingPaths.has(node.page.publicPath)
      : false;

    if (hasQuery && !matches && children.length === 0) {
      return null;
    }

    return {
      children,
      page: node.page,
      publicPath: node.publicPath,
      title: node.title,
    };
  };

  const finalizedRoot = finalizeNode(root);
  if (!finalizedRoot) {
    return [];
  }

  return finalizedRoot.page ? [finalizedRoot] : finalizedRoot.children;
}

export function flattenPageSummaryTree(nodes: EditorPageTreeNode[]) {
  const pages: PageSummary[] = [];

  const visit = (node: EditorPageTreeNode) => {
    if (node.page) {
      pages.push(node.page);
    }
    node.children.forEach(visit);
  };

  nodes.forEach(visit);
  return pages;
}

export function formatEditorTechnicalName(value: string) {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((word) => (
      /^[A-Z0-9]+$/.test(word)
        ? word
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    ))
    .join(" ");
}

export function getEditorFieldGroup(
  fieldName: string,
): EditorFieldGroup | null {
  if (/^_+(?:g|group)_/i.test(fieldName)) {
    return null;
  }
  if (
    /(?:image|media|src|alt|caption|preset|fitMode|focal|video)/i.test(fieldName)
  ) {
    return "media";
  }
  if (/(?:href|link|anchor|nextId|email|wechat)/i.test(fieldName)) {
    return "link";
  }
  if (/(?:layout|variant|minHeight|initialPosition)/i.test(fieldName)) {
    return "layout";
  }
  if (/(?:aliases|color|maskRadius|maskSmoothness|noIndex)/i.test(fieldName)) {
    return "advanced";
  }
  return "content";
}
