import fs from "node:fs/promises";
import path from "node:path";

import { normalizePuckData } from "../src/lib/puck-data-normalization.ts";
import { PUCK_COMPONENT_TYPES } from "../src/puck/component-manifest.ts";

const presetPath = path.resolve(
  process.cwd(),
  "content/component-design/component-lab-presets.json",
);

const SOURCE_KEY_BY_TARGET = {
  EditorialHeader: "PortfolioHeroHeader",
  EditorialSplit: "ContentCard",
  ProjectCoverLink: "ProjectSection",
  ThreeColumnSection: "HighDensityInfoBlock",
};

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStressSample(targetType, sourceType, stressSample) {
  if (stressSample.kind === "standalone") {
    const node = normalizePuckData(cloneJson(stressSample.node));
    return {
      kind: "standalone",
      node: {
        ...node,
        type: targetType,
      },
    };
  }

  const normalizedNode = normalizePuckData({
    props: {
      id: `component-lab-migrate-${targetType}`,
      ...cloneJson(stressSample.props),
    },
    type: sourceType,
  });
  const props = { ...normalizedNode.props };
  delete props.id;
  return {
    instance: cloneJson(stressSample.instance),
    kind: "derived",
    props,
  };
}

const raw = JSON.parse(await fs.readFile(presetPath, "utf8"));
const components = Object.fromEntries(PUCK_COMPONENT_TYPES.map((targetType) => {
  if (targetType === "BilibiliEmbed") {
    return [
      targetType,
      {
        defaultInstance: {
          componentId: "bilibili-works-im-explode",
          pageSlug: "works/im-explode",
        },
        stressSample: {
          kind: "standalone",
          node: {
            props: {
              caption:
                "跨语言长图注测试：A Bilibili project film with mixed Chinese and English copy.",
              captionAlign: "justify",
              id: "component-lab-stress-BilibiliEmbed",
              source: "BV1DNwUeDEos",
              title: "ComponentLab B 站播放器压力样本",
            },
            type: "BilibiliEmbed",
          },
        },
      },
    ];
  }

  const sourceType = SOURCE_KEY_BY_TARGET[targetType] ?? targetType;
  const sourceEntry = raw.components[sourceType];
  if (!sourceEntry) {
    throw new Error(`ComponentLab 预设缺少迁移来源：${sourceType}`);
  }

  return [
    targetType,
    {
      defaultInstance: cloneJson(sourceEntry.defaultInstance),
      stressSample: normalizeStressSample(
        targetType,
        sourceType,
        sourceEntry.stressSample,
      ),
    },
  ];
}));

await fs.writeFile(
  presetPath,
  `${JSON.stringify({ components, version: raw.version }, null, 2)}\n`,
  "utf8",
);

console.log(`已迁移 ComponentLab 预设：${PUCK_COMPONENT_TYPES.length} 个组件类型。`);
