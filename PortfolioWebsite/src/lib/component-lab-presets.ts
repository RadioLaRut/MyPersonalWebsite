import fs from "node:fs/promises";
import path from "node:path";

import {
  COMPONENT_DESIGN_COMPONENT_KEYS,
  type ComponentDesignComponentKey,
} from "./component-design-schema.ts";
import { CONTENT_BUDGET_PROFILE_V1 } from "./content-budget.ts";
import {
  contentRepository,
  type ContentPageEntry,
} from "./content-repository.ts";
import { isPlainRecord } from "./json-utils.ts";
import { parseCurrentPageDocument } from "./page-document-contract.ts";
import { synchronizeNextProjectBlocks } from "./project-catalog.ts";
import {
  isKnownPuckComponentType,
  type PuckComponentType,
} from "../puck/component-manifest.ts";

export const COMPONENT_LAB_PRESET_VERSION = 1 as const;
export const COMPONENT_LAB_PRESET_FILE = path.resolve(
  process.cwd(),
  "content/component-design/component-lab-presets.json",
);

export type ComponentLabInstanceReference = {
  componentId: string;
  pageSlug: string;
};

export type ComponentLabNode = {
  props: Record<string, unknown>;
  type: PuckComponentType;
};

type DerivedStressSample = {
  instance: ComponentLabInstanceReference;
  kind: "derived";
  props: Record<string, unknown>;
};

type StandaloneStressSample = {
  kind: "standalone";
  node: ComponentLabNode;
};

export type ComponentLabPresetDocument = {
  components: Record<ComponentDesignComponentKey, {
    defaultInstance: ComponentLabInstanceReference | null;
    stressSample: DerivedStressSample | StandaloneStressSample;
  }>;
  version: typeof COMPONENT_LAB_PRESET_VERSION;
};

export type ComponentLabCatalogInstance = {
  componentId: string;
  id: string;
  label: string;
  node: ComponentLabNode;
  pageSlug: string | null;
  source: "page" | "stress";
};

export type ComponentLabCatalogEntry = {
  componentKey: ComponentDesignComponentKey;
  instances: ComponentLabCatalogInstance[];
  preferredInstanceId: string | null;
  stressSample: ComponentLabCatalogInstance;
};

export type ComponentLabInstanceCatalog = {
  components: Record<ComponentDesignComponentKey, ComponentLabCatalogEntry>;
  version: typeof COMPONENT_LAB_PRESET_VERSION;
};

export class ComponentLabPresetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComponentLabPresetError";
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readReference(
  value: unknown,
  pathLabel: string,
): ComponentLabInstanceReference {
  if (!isPlainRecord(value)) {
    throw new ComponentLabPresetError(`${pathLabel} 必须是实例引用对象`);
  }

  const componentId = value.componentId;
  const pageSlug = value.pageSlug;
  if (
    typeof componentId !== "string" ||
    componentId.trim() === "" ||
    typeof pageSlug !== "string" ||
    pageSlug.trim() === ""
  ) {
    throw new ComponentLabPresetError(
      `${pathLabel} 必须包含非空 pageSlug 与 componentId`,
    );
  }

  return { componentId, pageSlug };
}

function readNode(value: unknown, pathLabel: string): ComponentLabNode {
  if (
    !isPlainRecord(value) ||
    !isKnownPuckComponentType(value.type) ||
    !isPlainRecord(value.props)
  ) {
    throw new ComponentLabPresetError(`${pathLabel} 不是合法 Puck 节点`);
  }

  return cloneJson(value as ComponentLabNode);
}

export function parseComponentLabPresetDocument(
  value: unknown,
): ComponentLabPresetDocument {
  if (!isPlainRecord(value) || value.version !== COMPONENT_LAB_PRESET_VERSION) {
    throw new ComponentLabPresetError(
      `ComponentLab 预设版本必须为 ${COMPONENT_LAB_PRESET_VERSION}`,
    );
  }
  if (!isPlainRecord(value.components)) {
    throw new ComponentLabPresetError("ComponentLab 预设缺少 components");
  }
  const rawComponents = value.components;

  const configuredKeys = Object.keys(rawComponents);
  const expectedKeys = new Set<string>(COMPONENT_DESIGN_COMPONENT_KEYS);
  const missing = COMPONENT_DESIGN_COMPONENT_KEYS.filter(
    (key) => !(key in rawComponents),
  );
  const extra = configuredKeys.filter((key) => !expectedKeys.has(key));
  if (missing.length > 0 || extra.length > 0) {
    throw new ComponentLabPresetError(
      `ComponentLab 预设组件清单不一致：缺少 ${missing.join(", ") || "无"}；多出 ${extra.join(", ") || "无"}`,
    );
  }

  const components = Object.fromEntries(
    COMPONENT_DESIGN_COMPONENT_KEYS.map((componentKey) => {
      const rawEntry = rawComponents[componentKey];
      const entryPath = `components.${componentKey}`;
      if (!isPlainRecord(rawEntry) || !("defaultInstance" in rawEntry)) {
        throw new ComponentLabPresetError(`${entryPath} 配置不完整`);
      }

      const defaultInstance = rawEntry.defaultInstance === null
        ? null
        : readReference(rawEntry.defaultInstance, `${entryPath}.defaultInstance`);
      const rawStress = rawEntry.stressSample;
      if (!isPlainRecord(rawStress)) {
        throw new ComponentLabPresetError(`${entryPath}.stressSample 配置不完整`);
      }

      let stressSample: DerivedStressSample | StandaloneStressSample;
      if (rawStress.kind === "derived") {
        if (!isPlainRecord(rawStress.props)) {
          throw new ComponentLabPresetError(
            `${entryPath}.stressSample.props 必须是对象`,
          );
        }
        stressSample = {
          instance: readReference(
            rawStress.instance,
            `${entryPath}.stressSample.instance`,
          ),
          kind: "derived",
          props: cloneJson(rawStress.props),
        };
      } else if (rawStress.kind === "standalone") {
        stressSample = {
          kind: "standalone",
          node: readNode(rawStress.node, `${entryPath}.stressSample.node`),
        };
      } else {
        throw new ComponentLabPresetError(
          `${entryPath}.stressSample.kind 必须是 derived 或 standalone`,
        );
      }

      return [componentKey, { defaultInstance, stressSample }];
    }),
  ) as ComponentLabPresetDocument["components"];

  return { components, version: COMPONENT_LAB_PRESET_VERSION };
}

function toInstanceId(reference: ComponentLabInstanceReference) {
  return `${reference.pageSlug}#${reference.componentId}`;
}

function* iterateNodes(value: unknown): Generator<ComponentLabNode> {
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      for (let index = current.length - 1; index >= 0; index -= 1) {
        stack.push(current[index]);
      }
      continue;
    }
    if (!isPlainRecord(current)) continue;

    if (isKnownPuckComponentType(current.type) && isPlainRecord(current.props)) {
      yield current as ComponentLabNode;
    }
    const entries = Object.values(current);
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      stack.push(entries[index]);
    }
  }
}

function createValidatedStressNode(
  componentKey: ComponentDesignComponentKey,
  rawNode: ComponentLabNode,
) {
  if (rawNode.type !== componentKey) {
    throw new ComponentLabPresetError(
      `${componentKey} 压力样本类型为 ${rawNode.type}，与组件类型不符`,
    );
  }

  const node = cloneJson(rawNode);
  node.props.id = `component-lab-stress-${componentKey}`;
  const runtimeProjection = componentKey === "NextProjectBlock"
    ? {
      href: node.props.href,
      nextBg: node.props.nextBg,
      nextName: node.props.nextName,
    }
    : null;
  if (runtimeProjection) {
    delete node.props.href;
    delete node.props.nextBg;
    delete node.props.nextName;
  }
  try {
    const parsed = parseCurrentPageDocument({
      content: [node],
      root: {
        props: {
          description: "ComponentLab stress sample",
          image: "",
          noIndex: true,
          title: componentKey,
        },
      },
      version: 1,
      zones: {},
    });
    const validated = cloneJson(parsed.content[0] as ComponentLabNode);
    if (runtimeProjection) {
      validated.props = {
        ...validated.props,
        ...Object.fromEntries(
          Object.entries(runtimeProjection).filter(([, value]) => value !== undefined),
        ),
      };
    }
    return validated;
  } catch (error) {
    throw new ComponentLabPresetError(
      `${componentKey} 压力样本非法：${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}

export function createComponentLabInstanceCatalog(
  pages: ContentPageEntry[],
  presets: ComponentLabPresetDocument,
  options: {
    maxInstances?: number;
  } = {},
): ComponentLabInstanceCatalog {
  const maxInstances = options.maxInstances ??
    CONTENT_BUDGET_PROFILE_V1.componentLab.maxInstances;
  const allInstances = new Map<string, ComponentLabCatalogInstance>();
  const instancesByType = new Map<ComponentDesignComponentKey, ComponentLabCatalogInstance[]>();
  let materializedInstances = 0;

  for (const page of pages) {
    for (const rawNode of iterateNodes(page.document)) {
      if (!(COMPONENT_DESIGN_COMPONENT_KEYS as readonly string[]).includes(rawNode.type)) {
        continue;
      }
      materializedInstances += 1;
      if (materializedInstances > maxInstances) {
        throw new ComponentLabPresetError(
          `ComponentLab 页面实例超过维护上限 ${maxInstances}，请减少页面实例或调整版本化预算`,
        );
      }
      const node = cloneJson(rawNode);
      const componentKey = node.type as ComponentDesignComponentKey;
      const componentId = node.props.id;
      if (typeof componentId !== "string" || componentId.trim() === "") {
        throw new ComponentLabPresetError(
          `${page.slug} 中的 ${componentKey} 缺少 props.id`,
        );
      }

      const reference = { componentId, pageSlug: page.slug };
      const id = toInstanceId(reference);
      if (allInstances.has(id)) {
        throw new ComponentLabPresetError(`页面实例 ID 重复：${id}`);
      }

      const instance: ComponentLabCatalogInstance = {
        componentId,
        id,
        label: `${page.slug} / ${componentId}`,
        node,
        pageSlug: page.slug,
        source: "page",
      };
      allInstances.set(id, instance);
      instancesByType.set(componentKey, [
        ...(instancesByType.get(componentKey) ?? []),
        instance,
      ]);
    }
  }

  function resolveReference(
    componentKey: ComponentDesignComponentKey,
    reference: ComponentLabInstanceReference,
    pathLabel: string,
  ) {
    const instance = allInstances.get(toInstanceId(reference));
    if (!instance) {
      throw new ComponentLabPresetError(
        `${pathLabel} 引用不存在：${toInstanceId(reference)}`,
      );
    }
    if (instance.node.type !== componentKey) {
      throw new ComponentLabPresetError(
        `${pathLabel} 引用类型为 ${instance.node.type}，预期 ${componentKey}`,
      );
    }
    return instance;
  }

  const components = Object.fromEntries(
    COMPONENT_DESIGN_COMPONENT_KEYS.map((componentKey) => {
      const preset = presets.components[componentKey];
      const instances = instancesByType.get(componentKey) ?? [];
      const preferredInstance = preset.defaultInstance
        ? resolveReference(componentKey, preset.defaultInstance, `${componentKey}.defaultInstance`)
        : null;

      let stressNode: ComponentLabNode;
      if (preset.stressSample.kind === "derived") {
        const source = resolveReference(
          componentKey,
          preset.stressSample.instance,
          `${componentKey}.stressSample.instance`,
        );
        stressNode = {
          ...cloneJson(source.node),
          props: {
            ...cloneJson(source.node.props),
            ...cloneJson(preset.stressSample.props),
          },
        };
      } else {
        stressNode = preset.stressSample.node;
      }

      const stressSample: ComponentLabCatalogInstance = {
        componentId: `component-lab-stress-${componentKey}`,
        id: `stress#${componentKey}`,
        label: "压力样本",
        node: createValidatedStressNode(componentKey, stressNode),
        pageSlug: null,
        source: "stress",
      };

      return [
        componentKey,
        {
          componentKey,
          instances,
          preferredInstanceId: preferredInstance?.id ?? null,
          stressSample,
        },
      ];
    }),
  ) as ComponentLabInstanceCatalog["components"];

  return { components, version: COMPONENT_LAB_PRESET_VERSION };
}

export async function readComponentLabPresetDocument() {
  const raw = await fs.readFile(COMPONENT_LAB_PRESET_FILE, "utf8");
  return parseComponentLabPresetDocument(JSON.parse(raw) as unknown);
}

export async function readComponentLabInstanceCatalog() {
  const [pages, presets, projectCatalog] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
    contentRepository.readProjectCatalog(),
  ]);
  const projectedPages = pages.map((page) => {
    const segments = page.slug.split("/");
    if (segments.length !== 2 || segments[0] !== "works") return page;
    return {
      ...page,
      document: synchronizeNextProjectBlocks(
        page.document,
        segments[1],
        projectCatalog,
      ),
    };
  });
  return createComponentLabInstanceCatalog(projectedPages, presets);
}
