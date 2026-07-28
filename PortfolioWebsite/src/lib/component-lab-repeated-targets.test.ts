import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import React, { type CSSProperties, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

import {
  createNestedComponentVariantLayout,
  mapPlacementToNestedTwelveColumnGrid,
} from "./component-design-nested-grid.ts";

type ModuleExports = Record<string, unknown>;

const require = createRequire(import.meta.url);
const root = process.cwd();
const contactPath = path.join(
  root,
  "src/components/blocks/ContactFlashlightBlock.tsx",
);
const textSplitPath = path.join(
  root,
  "src/components/breakdowns/TextSplitLayout.tsx",
);
const contentCardPath = path.join(
  root,
  "src/components/breakdowns/ContentCard.tsx",
);
const highDensityPath = path.join(
  root,
  "src/components/breakdowns/HighDensityInfoBlock.tsx",
);
const triptychPath = path.join(
  root,
  "src/components/breakdowns/BreakdownTriptych.tsx",
);
const metadataItemPath = path.join(
  root,
  "src/components/common/MetadataListItem.tsx",
);
const metadataLayoutContextPath = path.join(
  root,
  "src/components/common/MetadataListItemLayoutContext.tsx",
);

function componentModule(
  component: React.ElementType,
  named: Record<string, unknown> = {},
) {
  return {
    __esModule: true,
    default: component,
    ...named,
  };
}

const ComponentLayoutNodeMock = ({
  children,
  className,
  layout,
  nodeId,
  style,
}: {
  children?: ReactNode;
  className?: string;
  layout?: {
    componentLabAnnotations?: true;
    nodes?: Record<string, {
      placement?: { desktop?: { start?: number } };
    }>;
  };
  nodeId: string;
  style?: CSSProperties;
}) => React.createElement(
  "div",
  {
    className,
    ...(layout?.componentLabAnnotations
      ? { "data-component-lab-node": nodeId }
      : {}),
    "data-test-desktop-start":
      layout?.nodes?.[nodeId]?.placement?.desktop?.start,
    style,
  },
  children,
);

const TypographyMock = ({
  align,
  as = "span",
  children,
  preset,
  size,
}: {
  align?: unknown;
  as?: React.ElementType;
  children?: ReactNode;
  preset?: unknown;
  size?: unknown;
}) => React.createElement(as, {
  "data-test-align": typeof align === "string" ? align : undefined,
  "data-test-preset": typeof preset === "string" ? preset : undefined,
  "data-test-size": typeof size === "string" ? size : undefined,
}, children);

const sharedMocks: Record<string, unknown> = {
  "@/components/common/ComponentLayoutNode": componentModule(
    ComponentLayoutNodeMock,
    {
      getComponentLayoutAlignment: (
        layout: {
          nodes?: Record<string, { alignment?: unknown }>;
        } | undefined,
        nodeId: string,
        fallback = "left",
      ) => layout?.nodes?.[nodeId]?.alignment ?? fallback,
      getComponentLabNodeAttributes: (
        layout: { componentLabAnnotations?: true } | undefined,
        nodeId: string,
        occurrence?: number,
      ) => layout?.componentLabAnnotations
        ? {
          "data-component-lab-node": nodeId,
          ...(occurrence === undefined
            ? {}
            : { "data-component-lab-occurrence": occurrence }),
        }
        : {},
      getComponentLayoutNode: (
        layout: { nodes?: Record<string, unknown> } | undefined,
        nodeId: string,
      ) => layout?.nodes?.[nodeId],
      getComponentLayoutTypography: (
        layout: {
          nodes?: Record<string, { typography?: unknown }>;
        } | undefined,
        nodeId: string,
      ) => layout?.nodes?.[nodeId]?.typography ?? {
        preset: "sans-body",
        size: "body",
        wrap: "prose",
      },
    },
  ),
  "@/components/common/Typography": componentModule(TypographyMock),
  "@/lib/component-design-runtime": {
    __esModule: true,
    resolveComponentDesign: () => ({
      bodyAutoWrap: true,
      bodySize: "body",
      headingImageGap: "24",
      paragraphGap: "24",
    }),
  },
  "@/lib/component-design-nested-grid": {
    __esModule: true,
    createNestedComponentVariantLayout,
    mapPlacementToNestedTwelveColumnGrid,
  },
  "@/lib/component-design-style": {
    __esModule: true,
    createResponsiveGridBounds: () => ({}),
    getComponentLayoutGap: () => ({
      desktop: 24,
      mobile: 24,
      tablet: 24,
    }),
    getComponentLayoutNodeClassName: () => "col-span-6",
    getComponentLayoutNodeStyle: () => undefined,
    getComponentSectionProfileClassName: () => "",
    getComponentSectionStyle: () => undefined,
    getGridColumnClassName: () => "",
    getResponsiveGapStyle: () => ({
      "--component-gap-desktop": "24px",
      "--component-gap-mobile": "24px",
      "--component-gap-tablet": "24px",
    }),
    getResponsiveGridColumnClassName: () => "",
    getSectionSpacingClassName: () => "",
    getSpacingRem: () => "1.5rem",
  },
  "@/lib/editable-text": {
    __esModule: true,
    hasEditableTextContent: (value: unknown) => Boolean(value),
    toParagraphNodes: (value: unknown) =>
      Array.isArray(value) ? value : value ? [value] : [],
    toPlainText: (value: unknown) =>
      typeof value === "string" ? value : "",
  },
};

function loadTsxModule(
  filePath: string,
  mocks: Record<string, unknown>,
) {
  const source = readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} as ModuleExports };
  const factory = new vm.Script(
    `(function (require, module, exports) { ${output}\n})`,
    { filename: filePath },
  ).runInThisContext() as (
    localRequire: (id: string) => unknown,
    targetModule: typeof compiledModule,
    exports: ModuleExports,
  ) => void;
  factory(
    (id) => id in mocks ? mocks[id] : require(id),
    compiledModule,
    compiledModule.exports,
  );
  return compiledModule.exports;
}

function loadTsxDefault(
  filePath: string,
  mocks: Record<string, unknown>,
) {
  return loadTsxModule(filePath, mocks).default as
    React.ComponentType<Record<string, unknown>>;
}

function countRole(markup: string, roleId: string) {
  return markup.match(
    new RegExp(`data-component-lab-node="${roleId.replace(".", "\\.")}"`, "g"),
  )?.length ?? 0;
}

function FakeSlot({
  as: Root = "div",
  className,
  componentLabAnnotations,
}: {
  allow?: readonly string[];
  as?: React.ElementType;
  className?: string;
  componentLabAnnotations?: true;
  minEmptyHeight?: CSSProperties["minHeight"] | number;
}) {
  return React.createElement(
    Root,
    { className, componentLabAnnotations },
    React.createElement("p", { key: "first" }, "第一条"),
    React.createElement("p", { key: "second" }, "第二条"),
  );
}

const componentLayout = {
  componentLabAnnotations: true,
  gaps: {},
  nodes: {},
  sectionProfile: "normal",
};

function layoutNode(
  start: number,
  span: number,
  options: {
    alignment?: string;
    preset?: string;
    size?: string;
  } = {},
) {
  const placement = {
    desktop: { span, start },
    mobile: { span, start },
    tablet: { span, start },
  };
  return {
    alignment: options.alignment,
    placement,
    typography: {
      preset: options.preset ?? "sans-body",
      size: options.size ?? "body",
      wrap: "prose",
    },
  };
}

function createThreeColumnLayout() {
  const nodes: Record<string, ReturnType<typeof layoutNode>> = {};
  for (const column of [1, 2, 3]) {
    const prefix = `column${column}`;
    const start = column === 1 ? 1 : column === 2 ? 5 : 9;
    nodes[prefix] = layoutNode(start, 4);
    for (const suffix of ["label", "title", "subtitle", "body", "media"]) {
      nodes[`${prefix}.${suffix}`] = layoutNode(start, 4);
    }
    if (column < 3) {
      nodes[`${prefix}.item.label`] = layoutNode(start, 4, {
        alignment: "right",
        preset: "luna-editorial",
        size: "label",
      });
      nodes[`${prefix}.item.value`] = layoutNode(start, 4, {
        alignment: "center",
        preset: "sans-body",
        size: "body",
      });
    }
  }
  return {
    componentLabAnnotations: true,
    gaps: {},
    nodes,
    sectionProfile: "normal",
  };
}

function createMetadataSlot(
  MetadataListItem: React.ComponentType<Record<string, unknown>>,
) {
  return function MetadataSlot({
    as: Root = "div",
    className,
  }: {
    allow?: readonly string[];
    as?: React.ElementType;
    className?: string;
    minEmptyHeight?: CSSProperties["minHeight"] | number;
  }) {
    return React.createElement(
      Root,
      { className },
      React.createElement(MetadataListItem, {
        key: "first",
        label: "标签一",
        value: "内容一",
      }),
      React.createElement(MetadataListItem, {
        key: "second",
        label: "标签二",
        value: "内容二",
      }),
    );
  };
}

test("重复条目源码契约使用 Slot as 根组件并在真实 DOM 标记角色", () => {
  const contactSource = readFileSync(contactPath, "utf8");
  const textSplitSource = readFileSync(textSplitPath, "utf8");

  assert.match(contactSource, /React\.Children\.toArray\(children\)/);
  assert.match(contactSource, /as:\s*SlotRoot/);
  assert.match(contactSource, /"data-component-lab-node":\s*roleId/);
  assert.match(contactSource, /roleId="clients\.item"/);
  assert.match(contactSource, /roleId="employment\.item"/);

  assert.match(textSplitSource, /React\.Children\.toArray\(children\)/);
  assert.match(textSplitSource, /as:\s*RepeatedBodySlotRoot/);
  assert.match(textSplitSource, /nodeId="body\.item"/);
  assert.match(textSplitSource, /getComponentLayoutTypography\([\s\S]*?"body\.item"/);
  assert.doesNotMatch(
    textSplitSource,
    /<Typography\b[^>]*data-component-lab-node=/,
  );
});

test("Contact 的 Slot 与数组回退都逐条渲染真实选择目标", () => {
  const ContactFlashlightBlock = loadTsxDefault(contactPath, {
    ...sharedMocks,
    "./ContactFlashlightIsland": componentModule(() => null),
    "@/lib/public-copy": {
      __esModule: true,
      PUBLIC_COPY: {
        contact: {
          copyErrorMessage: "复制失败",
          copyLabel: "复制",
          copySuccessMessage: "已复制",
        },
      },
    },
  });

  const slotMarkup = renderToStaticMarkup(React.createElement(
    ContactFlashlightBlock,
    {
      componentLayout,
      creativeContent: React.createElement(FakeSlot, {
        allow: ["MetadataListItem"],
        minEmptyHeight: 20,
      }),
      editMode: true,
      experienceContent: React.createElement(FakeSlot, {
        allow: ["MetadataListItem"],
        minEmptyHeight: 20,
      }),
    },
  ));
  assert.equal(countRole(slotMarkup, "clients.item"), 2);
  assert.equal(countRole(slotMarkup, "employment.item"), 2);

  const arrayMarkup = renderToStaticMarkup(React.createElement(
    ContactFlashlightBlock,
    {
      componentLayout,
      creativeDirection: [
        { subtitle: "甲", title: "一" },
        { subtitle: "乙", title: "二" },
      ],
      editMode: true,
      experienceHistory: [
        { company: "甲", role: "一" },
        { company: "乙", role: "二" },
      ],
    },
  ));
  assert.equal(countRole(arrayMarkup, "clients.item"), 2);
  assert.equal(countRole(arrayMarkup, "employment.item"), 2);
});

test("TextSplit 的 Slot 与 paragraphs 都逐段渲染 body.item", () => {
  const TextSplitLayout = loadTsxDefault(textSplitPath, {
    ...sharedMocks,
    "@/components/common/PresetImage": {
      __esModule: true,
      PresetImage: () => null,
    },
    "@/lib/image-presentation": { __esModule: true },
  });

  const slotMarkup = renderToStaticMarkup(React.createElement(
    TextSplitLayout,
    {
      componentLayout,
      heading: "标题",
      paragraphs: [],
      paragraphsContent: React.createElement(FakeSlot, {
        allow: ["TextParagraphBlock"],
        minEmptyHeight: 24,
      }),
    },
  ));
  assert.equal(countRole(slotMarkup, "body.item"), 2);
  assert.match(slotMarkup, /data-component-lab-occurrence="0"/);
  assert.match(slotMarkup, /data-component-lab-occurrence="1"/);

  const arrayMarkup = renderToStaticMarkup(React.createElement(
    TextSplitLayout,
    {
      componentLayout,
      heading: "标题",
      paragraphs: ["第一段", "第二段"],
    },
  ));
  assert.equal(countRole(arrayMarkup, "body.item"), 2);
});

test("关键组件源码保留真实容器与重复布局节点", () => {
  const contentCardSource = readFileSync(contentCardPath, "utf8");
  const highDensitySource = readFileSync(highDensityPath, "utf8");
  const triptychSource = readFileSync(triptychPath, "utf8");

  assert.match(contentCardSource, /nodeId="body"/);
  assert.match(contentCardSource, /nodeId="body\.item"/);
  assert.match(
    contentCardSource,
    /getComponentLayoutTypography\(\s*componentLayout,\s*"body\.item"/,
  );
  assert.doesNotMatch(
    contentCardSource,
    /<Typography\b[^>]*data-component-lab-node=/,
  );

  assert.match(highDensitySource, /nodeId=\{prefix\}/);
  assert.match(highDensitySource, /MetadataListItemLayoutProvider/);
  assert.match(highDensitySource, /as:\s*MetadataListItemSlotRoot/);
  assert.match(triptychSource, /nodeId=\{prefix\}/);
});

test("ContentCard 为每个段落渲染独立的 body.item occurrence", () => {
  const ContentCard = loadTsxDefault(contentCardPath, {
    ...sharedMocks,
    "@/components/common/PresetImage": {
      __esModule: true,
      PresetImage: () => null,
    },
    "@/lib/image-presentation": { __esModule: true },
  });
  const layout = {
    componentLabAnnotations: true,
    gaps: {},
    nodes: {
      body: layoutNode(7, 6),
      "body.item": layoutNode(7, 6, {
        alignment: "right",
        preset: "luna-editorial",
        size: "body",
      }),
      heading: layoutNode(7, 6),
    },
    sectionProfile: "normal",
  };

  const markup = renderToStaticMarkup(React.createElement(ContentCard, {
    componentLayout: layout,
    description: ["first", "second"],
    title: "title",
  }));

  assert.equal(countRole(markup, "body"), 1);
  assert.equal(countRole(markup, "body.item"), 2);
  assert.match(
    markup,
    /data-component-lab-node="body\.item"[\s\S]*?data-test-align="right"[\s\S]*?data-test-preset="luna-editorial"/,
  );
});

test("ThreeColumn 阶段版式渲染真实栏位和 Slot 标签值目标", () => {
  const metadataContext = loadTsxModule(
    metadataLayoutContextPath,
    sharedMocks,
  );
  const MetadataListItem = loadTsxDefault(metadataItemPath, {
    ...sharedMocks,
    "@/components/common/MetadataListItemLayoutContext": metadataContext,
  });
  const HighDensityInfoBlock = loadTsxDefault(highDensityPath, {
    ...sharedMocks,
    "@/components/common/MetadataListItemLayoutContext": metadataContext,
    "@/components/common/PresetImage": {
      __esModule: true,
      PresetImage: () => null,
    },
    "@/lib/image-presentation": { __esModule: true },
  });
  const MetadataSlot = createMetadataSlot(MetadataListItem);
  const layout = createThreeColumnLayout();

  const markup = renderToStaticMarkup(React.createElement(
    HighDensityInfoBlock,
    {
      componentLayout: layout,
      phase1: { content: "body one", title: "title one" },
      phase1ItemsContent: React.createElement(MetadataSlot, {
        allow: ["MetadataListItem"],
        minEmptyHeight: 20,
      }),
      phase2: { content: "body two", title: "title two" },
      phase2ItemsContent: React.createElement(MetadataSlot, {
        allow: ["MetadataListItem"],
        minEmptyHeight: 20,
      }),
      phase3: { content: "body three", title: "title three" },
    },
  ));

  assert.equal(countRole(markup, "column1"), 1);
  assert.equal(countRole(markup, "column2"), 1);
  assert.equal(countRole(markup, "column3"), 1);
  assert.equal(countRole(markup, "column1.item.label"), 2);
  assert.equal(countRole(markup, "column1.item.value"), 2);
  assert.equal(countRole(markup, "column2.item.label"), 2);
  assert.equal(countRole(markup, "column2.item.value"), 2);
  assert.match(
    markup,
    /data-component-lab-node="column1\.item\.label"[^>]*data-component-lab-occurrence="0"[\s\S]*?data-test-align="right"[\s\S]*?data-test-preset="luna-editorial"/,
  );
  assert.match(
    markup,
    /data-component-lab-node="column1\.item\.value"[^>]*data-component-lab-occurrence="1"[\s\S]*?data-test-align="center"/,
  );

  const Provider = metadataContext.MetadataListItemLayoutProvider as
    React.ComponentType<Record<string, unknown>>;
  const SlotRoot = metadataContext.MetadataListItemSlotRoot as
    React.ComponentType<Record<string, unknown>>;
  const editMarkup = renderToStaticMarkup(React.createElement(
    Provider,
    {
      firstGapFrom: "column1.body",
      labelNodeId: "column1.item.label",
      layout,
      valueNodeId: "column1.item.value",
    },
    React.createElement(
      SlotRoot,
      {
        className: "space-y-3 col-span-12",
        "data-puck-dropzone": "component:items",
      },
      React.createElement(MetadataListItem, {
        label: "label",
        value: "value",
      }),
    ),
  ));
  assert.match(editMarkup, /data-puck-dropzone="component:items"/);
  assert.match(editMarkup, /class="space-y-3 col-span-12"/);
  assert.equal(countRole(editMarkup, "column1.item.label"), 1);
  assert.equal(countRole(editMarkup, "column1.item.value"), 1);

  const publicMarkup = renderToStaticMarkup(React.createElement(
    Provider,
    {
      firstGapFrom: "column1.body",
      labelNodeId: "column1.item.label",
      layout: { ...layout, componentLabAnnotations: undefined },
      valueNodeId: "column1.item.value",
    },
    React.createElement(
      SlotRoot,
      null,
      React.createElement(MetadataListItem, {
        label: "label",
        value: "value",
      }),
    ),
  ));
  assert.doesNotMatch(publicMarkup, /data-component-lab-node=/);
  assert.match(publicMarkup, /data-test-preset="luna-editorial"/);
});

test("ThreeColumn 三联版式把三栏渲染为真实布局容器", () => {
  const BreakdownTriptych = loadTsxDefault(triptychPath, {
    ...sharedMocks,
    "@/components/common/PresetImage": {
      __esModule: true,
      PresetImage: () => null,
    },
    "@/lib/image-presentation": { __esModule: true },
  });
  const layout = createThreeColumnLayout();
  const markup = renderToStaticMarkup(React.createElement(
    BreakdownTriptych,
    {
      col1Img: "",
      col1Text: "body one",
      col1Title: "title one",
      col2Img: "",
      col2Text: "body two",
      col2Title: "title two",
      col3Img: "",
      col3Text: "body three",
      col3Title: "title three",
      componentLayout: layout,
    },
  ));

  assert.equal(countRole(markup, "column1"), 1);
  assert.equal(countRole(markup, "column2"), 1);
  assert.equal(countRole(markup, "column3"), 1);
  assert.equal(countRole(markup, "column1.title"), 1);
  assert.equal(countRole(markup, "column2.body"), 1);
  assert.equal(countRole(markup, "column3.title"), 1);
});
