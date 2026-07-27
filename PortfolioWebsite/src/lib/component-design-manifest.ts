import type {
  TypographyPreset,
  TypographySize,
  TypographyWrapPolicy,
} from "./typography-tokens.ts";

export const COMPONENT_DESIGN_AUTHOR_COMPONENTS = [
  "HeroSection",
  "HeroHeadline",
  "EditorialHeader",
  "EditorialSplit",
  "ThreeColumnSection",
  "StatementBlock",
  "RichParagraph",
  "ImagePanel",
  "BilibiliEmbed",
  "ProjectCoverLink",
  "WorksList",
  "ParameterGrid",
  "ImageSlider",
  "BreakdownHeadline",
  "NextProjectBlock",
  "HomeEndcapSection",
  "ContactFlashlight",
] as const;

export type ComponentDesignAuthorComponent =
  (typeof COMPONENT_DESIGN_AUTHOR_COMPONENTS)[number];

export type ComponentDesignNodeKind =
  | "action"
  | "container"
  | "media"
  | "repeater"
  | "text";

export type ComponentDesignNodeLayer =
  | "background"
  | "content"
  | "decoration";

export type ComponentDesignNodePositioning =
  | "fixed"
  | "flow"
  | "overlay";

export type ComponentDesignManifestMediaFrame =
  | "auto"
  | "cinematic"
  | "landscape"
  | "portrait"
  | "square"
  | "viewport"
  | "wide";

export type ComponentDesignSampleTextBinding =
  | {
      kind: "prop";
      path: string;
      placeholder: string;
    }
  | {
      collectionPath: string;
      itemPath: string;
      kind: "repeated";
      placeholder: string;
      secondaryItemPath?: string;
      separator?: string;
    }
  | {
      fallback: string;
      key: string;
      kind: "virtual";
      placeholder: string;
    };

export type ComponentDesignTypographyDefault = {
  preset: TypographyPreset;
  size: TypographySize;
  wrap: TypographyWrapPolicy;
};

export type ComponentDesignNodeDescriptor = {
  group: string;
  groupLabel: string;
  id: string;
  kind: ComponentDesignNodeKind;
  label: string;
  layer: ComponentDesignNodeLayer;
  mediaFrames?: readonly ComponentDesignManifestMediaFrame[];
  positioning: ComponentDesignNodePositioning;
  alignment?: boolean;
  bleed?: "none" | "viewport";
  optional: boolean;
  opticalPull?: boolean;
  repeated: boolean;
  sampleBinding?: ComponentDesignSampleTextBinding;
  typography?: ComponentDesignTypographyDefault;
};

export type ComponentDesignVariantDescriptor = {
  id: string;
  label: string;
  nodes: readonly ComponentDesignNodeDescriptor[];
};

export type ComponentDesignManifestEntry = {
  component: ComponentDesignAuthorComponent;
  defaultVariant: string;
  label: string;
  variants: readonly ComponentDesignVariantDescriptor[];
};

const sans = (
  size: TypographySize,
  wrap: TypographyWrapPolicy = "prose",
): ComponentDesignTypographyDefault => ({
  preset: "sans-body",
  size,
  wrap,
});

const luna = (
  size: TypographySize,
  wrap: TypographyWrapPolicy = "heading",
): ComponentDesignTypographyDefault => ({
  preset: "luna-editorial",
  size,
  wrap,
});

const gothic = (
  size: TypographySize,
  wrap: TypographyWrapPolicy = "label",
): ComponentDesignTypographyDefault => ({
  preset: "gothic-editorial",
  size,
  wrap,
});

const propBinding = (
  path: string,
  label: string,
): ComponentDesignSampleTextBinding => ({
  kind: "prop",
  path,
  placeholder: `填写${label}`,
});

const repeatedBinding = (
  collectionPath: string,
  itemPath: string,
  label: string,
  options: Pick<
    Extract<ComponentDesignSampleTextBinding, { kind: "repeated" }>,
    "secondaryItemPath" | "separator"
  > = {},
): ComponentDesignSampleTextBinding => ({
  collectionPath,
  itemPath,
  kind: "repeated",
  placeholder: `填写${label}`,
  ...options,
});

const virtualBinding = (
  key: string,
  fallback: string,
  label: string,
): ComponentDesignSampleTextBinding => ({
  fallback,
  key,
  kind: "virtual",
  placeholder: `填写${label}`,
});

type TextNodeOptions = Pick<
  ComponentDesignNodeDescriptor,
  | "group"
  | "groupLabel"
  | "layer"
  | "optional"
  | "opticalPull"
  | "positioning"
  | "repeated"
  | "sampleBinding"
>;

const textNode = (
  id: string,
  label: string,
  typography: ComponentDesignTypographyDefault,
  options: Partial<TextNodeOptions> = {},
): ComponentDesignNodeDescriptor => ({
  alignment: true,
  group: id.includes(".") ? id.split(".")[0] : "content",
  groupLabel: id.startsWith("item.") ? "重复条目" : "内容",
  id,
  kind: "text",
  label,
  layer: "content",
  optional: false,
  positioning: "flow",
  repeated: false,
  sampleBinding: propBinding(id, label),
  typography,
  ...options,
});

const actionNode = (
  id: string,
  label: string,
  options: Partial<
    Pick<
      ComponentDesignNodeDescriptor,
      "group" | "groupLabel" | "layer" | "optional" | "positioning" | "sampleBinding"
    >
  > = {},
): ComponentDesignNodeDescriptor => ({
  alignment: true,
  group: "actions",
  groupLabel: "操作",
  id,
  kind: "action",
  label,
  layer: "content",
  optional: false,
  positioning: "flow",
  repeated: false,
  sampleBinding: propBinding(`${id}Label`, label),
  typography: sans("label", "label"),
  ...options,
});

const mediaNode = (
  id: string,
  label: string,
  options: Partial<Pick<
    ComponentDesignNodeDescriptor,
    "bleed" | "group" | "groupLabel" | "layer" | "optional" | "positioning" | "repeated"
  > & {
    mediaFrames: readonly ComponentDesignManifestMediaFrame[];
  }> = {},
): ComponentDesignNodeDescriptor => ({
  group: "media",
  groupLabel: options.bleed === "viewport" ? "背景" : "媒体",
  id,
  kind: "media",
  label,
  layer: options.bleed === "viewport" ? "background" : "content",
  mediaFrames: options.mediaFrames ??
    (
      options.bleed === "viewport"
        ? ["viewport"]
        : ["auto", "cinematic", "landscape", "wide", "square", "portrait"]
    ),
  optional: false,
  positioning: options.bleed === "viewport" ? "fixed" : "flow",
  repeated: false,
  ...options,
});

const containerNode = (
  id: string,
  label: string,
  options: Partial<
    Pick<
      ComponentDesignNodeDescriptor,
      "group" | "groupLabel" | "layer" | "optional" | "positioning" | "repeated"
    >
  > = {},
): ComponentDesignNodeDescriptor => ({
  group: id.includes(".") ? id.split(".")[0] : "content",
  groupLabel: "内容结构",
  id,
  kind: options.repeated ? "repeater" : "container",
  label,
  layer: "content",
  optional: false,
  positioning: "flow",
  repeated: false,
  ...options,
});

const heroMedia = mediaNode("media", "全屏媒体", { bleed: "viewport" });

const editorialSplitNodes = [
  mediaNode("media", "媒体", { optional: true }),
  textNode("heading", "标题", sans("title-sm", "heading")),
  textNode("body", "正文", sans("body", "prose"), { optional: true }),
  textNode("body.item", "段落模板", sans("body", "prose"), {
    group: "body",
    groupLabel: "正文段落",
    optional: true,
    repeated: true,
    sampleBinding: repeatedBinding("paragraphs", "props.text", "段落"),
  }),
] as const;

const threeColumnPhaseNodes = ([1, 2, 3] as const).flatMap((column) => {
  const group = `column${column}`;
  const groupLabel = `第 ${column} 栏`;
  const nodes: ComponentDesignNodeDescriptor[] = [
    containerNode(group, groupLabel, { group, groupLabel }),
    textNode(`${group}.label`, `第 ${column} 栏标签`, sans("label", "label"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Label`, `第 ${column} 栏标签`),
    }),
    textNode(`${group}.title`, `第 ${column} 栏标题`, sans("title-sm", "heading"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Title`, `第 ${column} 栏标题`),
    }),
    textNode(`${group}.subtitle`, `第 ${column} 栏副标题`, sans("body", "prose"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Subtitle`, `第 ${column} 栏副标题`),
    }),
    textNode(`${group}.body`, `第 ${column} 栏正文`, sans("body", "prose"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Body`, `第 ${column} 栏正文`),
    }),
  ];

  if (column < 3) {
    nodes.push(
      textNode(
        `${group}.item.label`,
        `第 ${column} 栏条目标签`,
        sans("label", "label"),
        {
          group,
          groupLabel,
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding(
            `col${column}Items`,
            "props.label",
            `第 ${column} 栏条目标签`,
          ),
        },
      ),
      textNode(
        `${group}.item.value`,
        `第 ${column} 栏条目内容`,
        sans("body", "prose"),
        {
          group,
          groupLabel,
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding(
            `col${column}Items`,
            "props.value",
            `第 ${column} 栏条目内容`,
          ),
        },
      ),
    );
  } else {
    nodes.push(mediaNode(`${group}.media`, "第 3 栏媒体", {
      group,
      groupLabel,
      optional: true,
    }));
  }

  return nodes;
});

const threeColumnTriptychNodes = ([1, 2, 3] as const).flatMap((column) => {
  const group = `column${column}`;
  const groupLabel = `第 ${column} 栏`;
  return [
    containerNode(group, groupLabel, { group, groupLabel }),
    textNode(`${group}.title`, `第 ${column} 栏标题`, sans("title-sm", "heading"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Title`, `第 ${column} 栏标题`),
    }),
    textNode(`${group}.body`, `第 ${column} 栏正文`, sans("body", "prose"), {
      group,
      groupLabel,
      optional: true,
      sampleBinding: propBinding(`col${column}Body`, `第 ${column} 栏正文`),
    }),
    mediaNode(`${group}.media`, `第 ${column} 栏媒体`, {
      group,
      groupLabel,
      optional: true,
    }),
  ];
}) as readonly ComponentDesignNodeDescriptor[];

const imagePanelNodes = [
  mediaNode("media", "图片", { bleed: "none" }),
  textNode("caption", "图注", sans("caption", "prose"), { optional: true }),
] as const;

const projectImmersiveNodes = [
  heroMedia,
  textNode("subtitle", "副标题", sans("label", "label"), {
    group: "overlay",
    groupLabel: "叠加内容",
    optional: true,
    positioning: "overlay",
  }),
  textNode("title", "标题", luna("display", "heading"), {
    group: "overlay",
    groupLabel: "叠加内容",
    opticalPull: true,
    positioning: "overlay",
  }),
  containerNode("underline", "标题锁线", {
    group: "decoration",
    groupLabel: "装饰",
    layer: "decoration",
    positioning: "overlay",
  }),
] as const;

const defaultVariant = (
  id: string,
  label: string,
  nodes: readonly ComponentDesignNodeDescriptor[],
): ComponentDesignVariantDescriptor => ({ id, label, nodes });

export const COMPONENT_DESIGN_MANIFEST = [
  {
    component: "HeroSection",
    defaultVariant: "poster",
    label: "首页首屏",
    variants: [
      defaultVariant("poster", "海报", [
        heroMedia,
        textNode("title", "标题", luna("hero", "heading"), {
          group: "overlay",
          groupLabel: "叠加内容",
          positioning: "overlay",
        }),
        textNode("subtitle", "副标题", sans("title", "label"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("positioning", "定位文案", sans("body-sm", "prose"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("eyebrow", "眉题", sans("caption", "prose"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
      ]),
      defaultVariant("full", "完整信息", [
        heroMedia,
        textNode("eyebrow", "眉题", sans("caption", "label"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("title", "标题", luna("display", "heading"), {
          group: "overlay",
          groupLabel: "叠加内容",
          positioning: "overlay",
        }),
        textNode("subtitle", "副标题", sans("label", "label"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("description", "说明", sans("body", "prose"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        actionNode("primaryCta", "主行动按钮", {
          group: "overlay-actions",
          groupLabel: "叠加操作",
          optional: true,
          positioning: "overlay",
        }),
        actionNode("secondaryCta", "次行动按钮", {
          group: "overlay-actions",
          groupLabel: "叠加操作",
          optional: true,
          positioning: "overlay",
        }),
      ]),
    ],
  },
  {
    component: "HeroHeadline",
    defaultVariant: "default",
    label: "作品首屏标题",
    variants: [
      defaultVariant("default", "默认", [
        heroMedia,
        textNode("eyebrow", "眉题", sans("caption", "label"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("title", "标题", luna("display", "heading"), {
          group: "overlay",
          groupLabel: "叠加内容",
          positioning: "overlay",
        }),
        textNode("subtitle", "副标题", sans("body", "prose"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        actionNode("navLink", "视频入口", {
          group: "overlay-actions",
          groupLabel: "叠加操作",
          optional: true,
          positioning: "overlay",
        }),
      ]),
    ],
  },
  {
    component: "EditorialHeader",
    defaultVariant: "index",
    label: "编辑式页头",
    variants: [
      defaultVariant("index", "作品索引", [
        textNode("title", "标题", luna("display", "heading")),
        textNode("subtitle", "副标题", luna("title", "heading"), { optional: true }),
        textNode("sideEyebrow", "侧栏眉题", sans("caption", "label"), {
          optional: true,
          sampleBinding: propBinding("descriptionLine1", "侧栏眉题"),
        }),
        textNode("description", "说明", sans("body", "prose"), {
          optional: true,
          sampleBinding: propBinding("descriptionLine2", "说明"),
        }),
        actionNode("cta", "行动入口", { optional: true }),
      ]),
      defaultVariant("collection", "灯光合集", [
        actionNode("backLink", "返回入口", {
          sampleBinding: virtualBinding(
            "backLink",
            "BACK TO LIGHTING",
            "返回入口",
          ),
        }),
        textNode("number", "编号", sans("label", "label"), { optional: true }),
        textNode("title", "标题", luna("display", "heading")),
        textNode("description", "说明", sans("body", "prose"), { optional: true }),
      ]),
    ],
  },
  {
    component: "EditorialSplit",
    defaultVariant: "media-right",
    label: "编辑式图文",
    variants: [
      defaultVariant("media-left", "媒体在左", editorialSplitNodes),
      defaultVariant("media-right", "媒体在右", editorialSplitNodes),
      defaultVariant("stack", "上下堆叠", editorialSplitNodes),
    ],
  },
  {
    component: "ThreeColumnSection",
    defaultVariant: "phase",
    label: "三栏信息",
    variants: [
      defaultVariant("phase", "叙事阶段", threeColumnPhaseNodes),
      defaultVariant("triptych", "独立图文", threeColumnTriptychNodes),
    ],
  },
  {
    component: "StatementBlock",
    defaultVariant: "medium",
    label: "陈述区块",
    variants: [
      defaultVariant("small", "小", [textNode("content", "正文", sans("body-lg", "prose"))]),
      defaultVariant("medium", "中", [textNode("content", "正文", sans("body-lg", "prose"))]),
      defaultVariant("large", "大", [textNode("content", "正文", sans("body-lg", "prose"))]),
    ],
  },
  {
    component: "RichParagraph",
    defaultVariant: "default",
    label: "长正文",
    variants: [
      defaultVariant("default", "默认", [
        textNode("body", "正文", sans("body", "prose"), {
          sampleBinding: propBinding("content", "正文"),
        }),
      ]),
    ],
  },
  {
    component: "ImagePanel",
    defaultVariant: "content",
    label: "图片面板",
    variants: [
      defaultVariant("content", "内容宽度", imagePanelNodes),
      defaultVariant("large", "大图", imagePanelNodes),
      defaultVariant("fullscreen", "全屏", [
        mediaNode("media", "全屏图片", { bleed: "viewport" }),
        textNode("caption", "图注", sans("caption", "prose"), {
          group: "overlay",
          groupLabel: "叠加内容",
          optional: true,
          positioning: "overlay",
        }),
      ]),
    ],
  },
  {
    component: "BilibiliEmbed",
    defaultVariant: "default",
    label: "B 站视频",
    variants: [
      defaultVariant("default", "默认", [
        mediaNode("player", "播放器"),
        textNode("caption", "图注", sans("caption", "prose"), { optional: true }),
        actionNode("externalLink", "外部播放入口", { optional: true }),
      ]),
    ],
  },
  {
    component: "ProjectCoverLink",
    defaultVariant: "immersive-left",
    label: "项目封面入口",
    variants: [
      defaultVariant("card", "卡片", [
        mediaNode("media", "封面"),
        textNode("number", "编号", sans("label", "label"), { optional: true }),
        textNode("prompt", "进入提示", sans("caption", "label"), { optional: true }),
        textNode("title", "标题", luna("title", "heading")),
      ]),
      defaultVariant("immersive-left", "沉浸式左侧", projectImmersiveNodes),
      defaultVariant("immersive-right", "沉浸式右侧", projectImmersiveNodes),
    ],
  },
  {
    component: "WorksList",
    defaultVariant: "default",
    label: "作品列表",
    variants: [
      defaultVariant("default", "默认", [
        textNode("heading", "列表标题", sans("label", "label"), { optional: true }),
        textNode("indexSummary", "索引说明", sans("body-sm", "prose"), { optional: true }),
        textNode("item.number", "条目编号", sans("label", "label"), {
          repeated: true,
          sampleBinding: repeatedBinding("entries", "props.number", "条目编号"),
        }),
        textNode("item.title", "条目标题", luna("title", "heading"), {
          repeated: true,
          sampleBinding: repeatedBinding("entries", "props.title", "条目标题"),
        }),
        textNode("item.category", "条目分类", gothic("label", "label"), {
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding("entries", "props.category", "条目分类"),
        }),
        textNode("item.description", "条目说明", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding("entries", "props.desc", "条目说明"),
        }),
        mediaNode("item.media", "激活媒体", {
          group: "item",
          groupLabel: "重复条目",
          optional: true,
          repeated: true,
        }),
      ]),
    ],
  },
  {
    component: "ParameterGrid",
    defaultVariant: "default",
    label: "参数网格",
    variants: [
      defaultVariant("default", "默认", [
        mediaNode("media", "全宽媒体", {
          bleed: "viewport",
          layer: "content",
          optional: true,
          positioning: "flow",
        }),
        textNode("mediaLabel", "媒体标签", sans("label", "label"), {
          group: "media-overlay",
          groupLabel: "媒体叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        containerNode("items", "参数容器", {
          group: "items",
          groupLabel: "参数条目",
        }),
        textNode("item.name", "参数名称", sans("label", "label"), {
          repeated: true,
          sampleBinding: repeatedBinding("parameters", "name", "参数名称"),
        }),
        textNode("item.value", "参数值", sans("body", "label"), {
          repeated: true,
          sampleBinding: repeatedBinding("parameters", "value", "参数值"),
        }),
        textNode("item.description", "参数说明", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding(
            "parameters",
            "description",
            "参数说明",
          ),
        }),
      ]),
    ],
  },
  {
    component: "ImageSlider",
    defaultVariant: "default",
    label: "图片对比滑块",
    variants: [
      defaultVariant("default", "默认", [
        mediaNode("media", "对比媒体"),
        textNode("title", "叠加标题", sans("title-sm", "heading"), {
          group: "media-overlay",
          groupLabel: "媒体叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("leftLabel", "左侧标签", sans("caption", "label"), {
          group: "media-overlay",
          groupLabel: "媒体叠加内容",
          optional: true,
          positioning: "overlay",
        }),
        textNode("rightLabel", "右侧标签", sans("caption", "label"), {
          group: "media-overlay",
          groupLabel: "媒体叠加内容",
          optional: true,
          positioning: "overlay",
        }),
      ]),
    ],
  },
  {
    component: "BreakdownHeadline",
    defaultVariant: "section",
    label: "章节标题",
    variants: [
      defaultVariant("chapter", "章节", [
        textNode("index", "章节号", sans("label", "label"), {
          optional: true,
          sampleBinding: propBinding("indexLabel", "章节号"),
        }),
        textNode("title", "标题", luna("display", "heading")),
      ]),
      defaultVariant("section", "小节", [
        textNode("index", "章节号", sans("label", "label"), {
          optional: true,
          sampleBinding: propBinding("indexLabel", "章节号"),
        }),
        textNode("title", "标题", sans("title", "heading")),
      ]),
    ],
  },
  {
    component: "NextProjectBlock",
    defaultVariant: "default",
    label: "下一项目",
    variants: [
      defaultVariant("default", "默认", [
        heroMedia,
        textNode("eyebrow", "固定眉题", sans("label", "label"), {
          group: "overlay",
          groupLabel: "叠加内容",
          positioning: "overlay",
        }),
        textNode("title", "项目名", luna("title", "heading"), {
          group: "overlay",
          groupLabel: "叠加内容",
          positioning: "overlay",
          sampleBinding: propBinding("nextName", "项目名"),
        }),
        textNode("footerLeft", "左页脚", sans("caption", "label"), {
          group: "footer",
          groupLabel: "页脚",
          optional: true,
        }),
        textNode("footerRight", "右页脚", sans("caption", "label"), {
          group: "footer",
          groupLabel: "页脚",
          optional: true,
        }),
      ]),
    ],
  },
  {
    component: "HomeEndcapSection",
    defaultVariant: "default",
    label: "首页收束",
    variants: [
      defaultVariant("default", "默认", [
        textNode("eyebrow", "眉题", sans("caption", "label"), { optional: true }),
        textNode("title", "标题", luna("display", "heading")),
        textNode("description", "说明", sans("body", "prose"), { optional: true }),
        actionNode("cta", "行动按钮", {
          optional: true,
          sampleBinding: propBinding("buttonLabel", "行动按钮"),
        }),
      ]),
    ],
  },
  {
    component: "ContactFlashlight",
    defaultVariant: "default",
    label: "联系手电筒",
    variants: [
      defaultVariant("default", "默认", [
        textNode("name", "姓名", luna("display", "heading")),
        textNode("tagline", "身份文字", sans("title-sm", "heading"), {
          optional: true,
          sampleBinding: propBinding("taglineText", "身份文字"),
        }),
        textNode("taglineSub", "次级身份", sans("body", "prose"), { optional: true }),
        textNode("clientsHeading", "客户栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("clients.item", "客户条目", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding(
            "experienceHistory",
            "props.label",
            "客户条目",
            {
              secondaryItemPath: "props.value",
              separator: "\n",
            },
          ),
        }),
        textNode("employmentHeading", "经历栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("employment.item", "经历条目", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
          sampleBinding: repeatedBinding(
            "creativeDirection",
            "props.label",
            "经历条目",
            {
              secondaryItemPath: "props.value",
              separator: "\n",
            },
          ),
        }),
        textNode("contactHeading", "联系栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("emailHeading", "邮箱栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("wechat", "微信", sans("body", "url"), { optional: true }),
        textNode("copyPrompt", "复制提示", sans("caption", "label"), {
          optional: true,
          sampleBinding: propBinding("copyLabel", "复制提示"),
        }),
        actionNode("email", "邮箱", {
          optional: true,
          sampleBinding: propBinding("email", "邮箱"),
        }),
      ]),
    ],
  },
] as const satisfies readonly ComponentDesignManifestEntry[];

export type ComponentDesignVariantId<
  Component extends ComponentDesignAuthorComponent,
> = Extract<
  (typeof COMPONENT_DESIGN_MANIFEST)[number],
  { component: Component }
>["variants"][number]["id"];

export const COMPONENT_DESIGN_MANIFEST_BY_COMPONENT = Object.fromEntries(
  COMPONENT_DESIGN_MANIFEST.map((entry) => [entry.component, entry]),
) as unknown as Record<
  ComponentDesignAuthorComponent,
  (typeof COMPONENT_DESIGN_MANIFEST)[number]
>;

export function getComponentDesignVariantDescriptor(
  component: ComponentDesignAuthorComponent,
  variant: string,
) {
  const entry = COMPONENT_DESIGN_MANIFEST_BY_COMPONENT[component];
  return entry.variants.find((candidate) => candidate.id === variant) ??
    entry.variants.find((candidate) => candidate.id === entry.defaultVariant) ??
    entry.variants[0];
}

export function getComponentDesignNodeDescriptor(
  component: ComponentDesignAuthorComponent,
  variant: string,
  nodeId: string,
) {
  return getComponentDesignVariantDescriptor(component, variant).nodes.find(
    (node) => node.id === nodeId,
  );
}
