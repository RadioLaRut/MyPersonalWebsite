import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
  type ComponentDesignAuthorComponent,
  type ComponentDesignSampleTextBinding,
} from "./component-design-manifest.ts";
import type {
  ComponentLabCatalogEntry,
  ComponentLabNode,
} from "./component-lab-presets.ts";
import { isPlainRecord } from "./json-utils.ts";

export const COMPONENT_LAB_VIRTUAL_TEXT_PROP =
  "__componentLabSampleText" as const;

export type ComponentLabSampleText = Record<string, string | string[]>;

export type ComponentLabSamplePlaceholder = {
  occurrence: number;
  roleId: string;
  text: string;
};

export class ComponentLabSampleTextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComponentLabSampleTextError";
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getSampleVariantDescriptor(
  component: ComponentDesignAuthorComponent,
  variant: string,
) {
  const descriptor = COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[
    component
  ].variants.find((candidate) => candidate.id === variant);
  if (!descriptor) {
    throw new ComponentLabSampleTextError(
      `${component} 不存在版式 ${variant}`,
    );
  }
  return descriptor;
}

function readPath(value: unknown, path: string): unknown {
  let current = value;
  for (const segment of path.split(".")) {
    if (!isPlainRecord(current)) return undefined;
    current = current[segment];
  }
  return current;
}

function writePath(
  value: Record<string, unknown>,
  path: string,
  nextValue: string,
) {
  const segments = path.split(".");
  let current = value;
  segments.slice(0, -1).forEach((segment) => {
    const child = current[segment];
    if (!isPlainRecord(child)) current[segment] = {};
    current = current[segment] as Record<string, unknown>;
  });
  current[segments.at(-1) as string] = nextValue;
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readVirtualText(
  node: ComponentLabNode,
  binding: Extract<ComponentDesignSampleTextBinding, { kind: "virtual" }>,
) {
  const virtualText = node.props[COMPONENT_LAB_VIRTUAL_TEXT_PROP];
  if (!isPlainRecord(virtualText)) return binding.fallback;
  return typeof virtualText[binding.key] === "string"
    ? virtualText[binding.key] as string
    : binding.fallback;
}

function readVirtualRepeatedText(node: ComponentLabNode, roleId: string) {
  const virtualText = node.props[COMPONENT_LAB_VIRTUAL_TEXT_PROP];
  if (!isPlainRecord(virtualText)) return undefined;
  const value = virtualText[roleId];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value as string[]
    : undefined;
}

function writeVirtualValue(
  node: ComponentLabNode,
  key: string,
  value: string | string[],
) {
  const current = node.props[COMPONENT_LAB_VIRTUAL_TEXT_PROP];
  const virtualText = isPlainRecord(current) ? current : {};
  node.props[COMPONENT_LAB_VIRTUAL_TEXT_PROP] = {
    ...virtualText,
    [key]: cloneJson(value),
  };
}

function extractBindingValue(
  node: ComponentLabNode,
  roleId: string,
  binding: ComponentDesignSampleTextBinding,
): string | string[] {
  if (binding.kind === "prop") {
    return readText(readPath(node.props, binding.path));
  }
  if (binding.kind === "virtual") {
    return readVirtualText(node, binding);
  }

  const virtualValue = readVirtualRepeatedText(node, roleId);
  if (virtualValue) return virtualValue;
  const collection = readPath(node.props, binding.collectionPath);
  if (!Array.isArray(collection)) return [];
  return collection.map((item) => {
    const primary = readText(readPath(item, binding.itemPath));
    if (!binding.secondaryItemPath) return primary;
    const secondary = readText(readPath(item, binding.secondaryItemPath));
    return `${primary}${binding.separator ?? "\n"}${secondary}`;
  });
}

function applyBindingValue(
  node: ComponentLabNode,
  roleId: string,
  binding: ComponentDesignSampleTextBinding,
  value: string | string[],
) {
  if (binding.kind === "prop") {
    if (typeof value !== "string") {
      throw new ComponentLabSampleTextError(`${roleId} 必须是单段文字`);
    }
    writePath(node.props, binding.path, value);
    return;
  }

  if (binding.kind === "virtual") {
    if (typeof value !== "string") {
      throw new ComponentLabSampleTextError(`${roleId} 必须是单段文字`);
    }
    writeVirtualValue(node, binding.key, value);
    return;
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ComponentLabSampleTextError(`${roleId} 必须是文字数组`);
  }
  const collection = readPath(node.props, binding.collectionPath);
  if (!Array.isArray(collection) || value.length !== collection.length) {
    writeVirtualValue(node, roleId, value);
    return;
  }

  collection.forEach((item, index) => {
    if (!isPlainRecord(item)) {
      throw new ComponentLabSampleTextError(`${roleId} 的第 ${index + 1} 个条目非法`);
    }
    const text = value[index] ?? "";
    if (!binding.secondaryItemPath) {
      writePath(item, binding.itemPath, text);
      return;
    }
    const separator = binding.separator ?? "\n";
    const separatorIndex = text.indexOf(separator);
    const primary = separatorIndex < 0 ? text : text.slice(0, separatorIndex);
    const secondary = separatorIndex < 0
      ? ""
      : text.slice(separatorIndex + separator.length);
    writePath(item, binding.itemPath, primary);
    writePath(item, binding.secondaryItemPath, secondary);
  });
}

export function isComponentDesignAuthorComponent(
  value: string,
): value is ComponentDesignAuthorComponent {
  return (COMPONENT_DESIGN_AUTHOR_COMPONENTS as readonly string[]).includes(value);
}

export function extractVariantSampleText(
  component: ComponentDesignAuthorComponent,
  variant: string,
  node: ComponentLabNode,
): ComponentLabSampleText {
  const descriptor = getSampleVariantDescriptor(component, variant);
  return Object.fromEntries(
    descriptor.nodes
      .filter((candidate) => candidate.sampleBinding)
      .map((candidate) => [
        candidate.id,
        extractBindingValue(
          node,
          candidate.id,
          candidate.sampleBinding as ComponentDesignSampleTextBinding,
        ),
      ]),
  );
}

export function applyVariantSampleText(
  component: ComponentDesignAuthorComponent,
  variant: string,
  node: ComponentLabNode,
  sampleText: ComponentLabSampleText,
): ComponentLabNode {
  const nextNode = cloneJson(node);
  const descriptor = getSampleVariantDescriptor(component, variant);
  const nodesById = new Map(
    descriptor.nodes.map((candidate) => [candidate.id, candidate]),
  );

  Object.entries(sampleText).forEach(([roleId, value]) => {
    const binding = nodesById.get(roleId)?.sampleBinding;
    if (!binding) {
      throw new ComponentLabSampleTextError(
        `${component}/${variant} 不允许修改 ${roleId} 的样例文字`,
      );
    }
    applyBindingValue(nextNode, roleId, binding, value);
  });

  return nextNode;
}

export function createVariantSampleNode(
  entry: Pick<
    ComponentLabCatalogEntry,
    "componentKey" | "stressSample" | "variantSamples"
  >,
  variant: string,
  sampleText: ComponentLabSampleText = {},
): ComponentLabNode {
  if (!isComponentDesignAuthorComponent(entry.componentKey)) {
    throw new ComponentLabSampleTextError(
      `${entry.componentKey} 不是可编辑的页面级组件`,
    );
  }
  const source = entry.variantSamples[variant] ?? entry.stressSample.node;
  return applyVariantSampleText(
    entry.componentKey,
    variant,
    source,
    sampleText,
  );
}

export function createVariantSamplePlaceholders(
  component: ComponentDesignAuthorComponent,
  variant: string,
  node: ComponentLabNode,
  sampleText: ComponentLabSampleText = {},
): ComponentLabSamplePlaceholder[] {
  const descriptor = getSampleVariantDescriptor(component, variant);
  const effectiveSampleText = {
    ...extractVariantSampleText(component, variant, node),
    ...sampleText,
  };
  return descriptor.nodes.flatMap((node) => {
    if (!node.optional || !node.sampleBinding) return [];
    const value = effectiveSampleText[node.id];
    if (Array.isArray(value)) {
      const placeholders = value.flatMap((text, occurrence) => (
        text.trim()
          ? []
          : [{ occurrence, roleId: node.id, text: node.sampleBinding!.placeholder }]
      ));
      return placeholders.length > 0 || value.length > 0
        ? placeholders
        : [{ occurrence: 0, roleId: node.id, text: node.sampleBinding.placeholder }];
    }
    return typeof value === "string" && value.trim()
      ? []
      : [{ occurrence: 0, roleId: node.id, text: node.sampleBinding.placeholder }];
  });
}
