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

export type ComponentDesignTypographyDefault = {
  preset: TypographyPreset;
  size: TypographySize;
  wrap: TypographyWrapPolicy;
};

export type ComponentDesignNodeDescriptor = {
  id: string;
  kind: ComponentDesignNodeKind;
  label: string;
  alignment?: boolean;
  bleed?: "none" | "viewport";
  optional?: boolean;
  opticalPull?: boolean;
  repeated?: boolean;
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

const textNode = (
  id: string,
  label: string,
  typography: ComponentDesignTypographyDefault,
  options: Pick<
    ComponentDesignNodeDescriptor,
    "optional" | "opticalPull" | "repeated"
  > = {},
): ComponentDesignNodeDescriptor => ({
  alignment: true,
  id,
  kind: "text",
  label,
  typography,
  ...options,
});

const actionNode = (
  id: string,
  label: string,
  options: Pick<ComponentDesignNodeDescriptor, "optional"> = {},
): ComponentDesignNodeDescriptor => ({
  alignment: true,
  id,
  kind: "action",
  label,
  typography: sans("label", "label"),
  ...options,
});

const mediaNode = (
  id: string,
  label: string,
  options: Pick<
    ComponentDesignNodeDescriptor,
    "bleed" | "optional" | "repeated"
  > = {},
): ComponentDesignNodeDescriptor => ({
  id,
  kind: "media",
  label,
  ...options,
});

const containerNode = (
  id: string,
  label: string,
  options: Pick<ComponentDesignNodeDescriptor, "optional" | "repeated"> = {},
): ComponentDesignNodeDescriptor => ({
  id,
  kind: options.repeated ? "repeater" : "container",
  label,
  ...options,
});

const heroMedia = mediaNode("media", "全屏媒体", { bleed: "viewport" });

const editorialSplitNodes = [
  mediaNode("media", "媒体", { optional: true }),
  textNode("heading", "标题", sans("title-sm", "heading")),
  textNode("body", "正文", sans("body", "prose"), { optional: true }),
  textNode("body.item", "段落模板", sans("body", "prose"), {
    optional: true,
    repeated: true,
  }),
] as const;

const threeColumnNodes = ([1, 2, 3] as const).flatMap((column) => [
  containerNode(`column${column}`, `第 ${column} 栏`),
  textNode(`column${column}.label`, `第 ${column} 栏标签`, sans("label", "label"), {
    optional: true,
  }),
  textNode(`column${column}.title`, `第 ${column} 栏标题`, sans("title-sm", "heading"), {
    optional: true,
  }),
  textNode(`column${column}.subtitle`, `第 ${column} 栏副标题`, sans("body", "prose"), {
    optional: true,
  }),
  textNode(`column${column}.body`, `第 ${column} 栏正文`, sans("body", "prose"), {
    optional: true,
  }),
  mediaNode(`column${column}.media`, `第 ${column} 栏媒体`, { optional: true }),
  textNode(
    `column${column}.item.label`,
    `第 ${column} 栏条目标签`,
    sans("label", "label"),
    { optional: true, repeated: true },
  ),
  textNode(
    `column${column}.item.value`,
    `第 ${column} 栏条目内容`,
    sans("body", "prose"),
    { optional: true, repeated: true },
  ),
]) as readonly ComponentDesignNodeDescriptor[];

const imagePanelNodes = [
  mediaNode("media", "图片", { bleed: "none" }),
  textNode("caption", "图注", sans("caption", "prose"), { optional: true }),
] as const;

const projectImmersiveNodes = [
  heroMedia,
  textNode("subtitle", "副标题", sans("label", "label"), { optional: true }),
  textNode("title", "标题", luna("display", "heading"), { opticalPull: true }),
  containerNode("underline", "标题锁线"),
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
        textNode("title", "标题", luna("hero", "heading")),
        textNode("subtitle", "副标题", sans("title", "label"), { optional: true }),
        textNode("positioning", "定位文案", sans("body-sm", "prose"), { optional: true }),
        textNode("eyebrow", "眉题", sans("caption", "prose"), { optional: true }),
      ]),
      defaultVariant("full", "完整信息", [
        heroMedia,
        textNode("eyebrow", "眉题", sans("caption", "label"), { optional: true }),
        textNode("title", "标题", luna("display", "heading")),
        textNode("subtitle", "副标题", sans("label", "label"), { optional: true }),
        textNode("description", "说明", sans("body", "prose"), { optional: true }),
        actionNode("primaryCta", "主行动按钮", { optional: true }),
        actionNode("secondaryCta", "次行动按钮", { optional: true }),
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
        textNode("eyebrow", "眉题", sans("caption", "label"), { optional: true }),
        textNode("title", "标题", luna("display", "heading")),
        textNode("subtitle", "副标题", sans("body", "prose"), { optional: true }),
        actionNode("navLink", "视频入口", { optional: true }),
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
        textNode("sideEyebrow", "侧栏眉题", sans("caption", "label"), { optional: true }),
        textNode("description", "说明", sans("body", "prose"), { optional: true }),
        actionNode("cta", "行动入口", { optional: true }),
      ]),
      defaultVariant("collection", "灯光合集", [
        actionNode("backLink", "返回入口"),
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
      defaultVariant("phase", "叙事阶段", threeColumnNodes),
      defaultVariant("triptych", "独立图文", threeColumnNodes),
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
        textNode("body", "正文", sans("body", "prose")),
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
        imagePanelNodes[1],
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
        textNode("item.number", "条目编号", sans("label", "label"), { repeated: true }),
        textNode("item.title", "条目标题", luna("title", "heading"), { repeated: true }),
        textNode("item.category", "条目分类", gothic("label", "label"), {
          optional: true,
          repeated: true,
        }),
        textNode("item.description", "条目说明", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
        }),
        mediaNode("item.media", "激活媒体", { optional: true, repeated: true }),
      ]),
    ],
  },
  {
    component: "ParameterGrid",
    defaultVariant: "default",
    label: "参数网格",
    variants: [
      defaultVariant("default", "默认", [
        mediaNode("media", "全宽媒体", { bleed: "viewport", optional: true }),
        textNode("mediaLabel", "媒体标签", sans("label", "label"), { optional: true }),
        containerNode("items", "参数容器"),
        textNode("item.name", "参数名称", sans("label", "label"), { repeated: true }),
        textNode("item.value", "参数值", sans("body", "label"), { repeated: true }),
        textNode("item.description", "参数说明", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
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
        textNode("title", "叠加标题", sans("title-sm", "heading"), { optional: true }),
        textNode("leftLabel", "左侧标签", sans("caption", "label"), { optional: true }),
        textNode("rightLabel", "右侧标签", sans("caption", "label"), { optional: true }),
      ]),
    ],
  },
  {
    component: "BreakdownHeadline",
    defaultVariant: "section",
    label: "章节标题",
    variants: [
      defaultVariant("chapter", "章节", [
        textNode("index", "章节号", sans("label", "label"), { optional: true }),
        textNode("title", "标题", luna("display", "heading")),
      ]),
      defaultVariant("section", "小节", [
        textNode("index", "章节号", sans("label", "label"), { optional: true }),
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
        textNode("eyebrow", "固定眉题", sans("label", "label")),
        textNode("title", "项目名", luna("title", "heading")),
        textNode("footerLeft", "左页脚", sans("caption", "label"), { optional: true }),
        textNode("footerRight", "右页脚", sans("caption", "label"), { optional: true }),
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
        actionNode("cta", "行动按钮", { optional: true }),
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
        textNode("tagline", "身份文字", sans("title-sm", "heading"), { optional: true }),
        textNode("taglineSub", "次级身份", sans("body", "prose"), { optional: true }),
        textNode("clientsHeading", "客户栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("clients.item", "客户条目", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
        }),
        textNode("employmentHeading", "经历栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("employment.item", "经历条目", sans("body-sm", "prose"), {
          optional: true,
          repeated: true,
        }),
        textNode("contactHeading", "联系栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("emailHeading", "邮箱栏目标题", sans("label", "label"), {
          optional: true,
        }),
        textNode("wechat", "微信", sans("body", "url"), { optional: true }),
        textNode("copyPrompt", "复制提示", sans("caption", "label"), { optional: true }),
        actionNode("email", "邮箱", { optional: true }),
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
