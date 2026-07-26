"use client";

import type { Config } from "@puckeditor/core";

import { useComponentDesignDocument } from "@/components/layout/ComponentDesignProvider";
import type { PuckComponentType } from "@/puck/component-manifest";
import { getEditorComponentMeta } from "@/puck/editor/component-metadata";
import { renderWithAdapter } from "@/puck/render-adapter";

type GenericRenderProps = Record<string, unknown>;

const INLINE_EDITABLE_FIELDS = new Set([
  "body",
  "buttonLabel",
  "caption",
  "category",
  "col1Body",
  "col1Label",
  "col1Subtitle",
  "col1Text",
  "col1Title",
  "col2Body",
  "col2Label",
  "col2Subtitle",
  "col2Text",
  "col2Title",
  "col3Body",
  "col3Label",
  "col3Subtitle",
  "col3Text",
  "col3Title",
  "content",
  "copyLabel",
  "ctaLabel",
  "desc",
  "description",
  "descriptionLine1",
  "descriptionLine2",
  "eyebrow",
  "heading",
  "indexLabel",
  "indexSummary",
  "label",
  "leftLabel",
  "name",
  "navLinkLabel",
  "number",
  "phase1Content",
  "phase1Label",
  "phase1Subtitle",
  "phase1Title",
  "phase2Content",
  "phase2Label",
  "phase2Subtitle",
  "phase2Title",
  "phase3Content",
  "phase3Label",
  "phase3Subtitle",
  "phase3Title",
  "positioning",
  "primaryCtaLabel",
  "rightLabel",
  "secondaryCtaLabel",
  "subtitle",
  "taglineSub",
  "taglineText",
  "text",
  "title",
  "value",
]);

const CHINESE_FIELD_LABELS: Record<string, string> = {
  align: "对齐",
  aliases: "历史别名",
  alt: "替代文本",
  anchorId: "锚点",
  backHref: "返回链接",
  backgroundColor: "背景颜色",
  body: "正文",
  bodyMode: "正文模式",
  buttonHref: "按钮链接",
  buttonLabel: "按钮文案",
  caption: "图片说明",
  category: "分类",
  content: "正文",
  copyErrorMessage: "复制失败反馈",
  copyLabel: "复制按钮文案",
  copySuccessMessage: "复制成功反馈",
  ctaHref: "行动链接",
  ctaLabel: "行动按钮文案",
  darkTextColor: "暗部文字颜色",
  desc: "描述",
  description: "描述",
  descriptionLine1: "描述第一行",
  descriptionLine2: "描述第二行",
  email: "邮箱",
  eyebrow: "眉题",
  fitMode: "图片适应方式",
  heading: "标题",
  href: "链接",
  imageAlt: "图片替代文本",
  imageFitMode: "图片适应方式",
  imagePosition: "图片位置",
  imagePreset: "图片预设",
  imageSrc: "图片路径",
  index: "序号",
  indexLabel: "章节序号",
  indexSummary: "索引说明",
  initialPosition: "初始滑块位置",
  label: "标签",
  layoutVariant: "布局方式",
  leftLabel: "左侧标签",
  lightTextColor: "亮部文字颜色",
  link: "链接",
  maskRadius: "光圈半径",
  maskSmoothness: "光圈柔化",
  mediaSrc: "媒体路径",
  minHeight: "最小高度",
  mobileImageFocalX: "移动端焦点 X",
  mobileImageFocalY: "移动端焦点 Y",
  name: "名称",
  navLink: "导航链接",
  navLinkLabel: "导航文案",
  nextId: "下一项目 ID",
  noIndex: "搜索收录",
  number: "编号",
  positioning: "定位文案",
  preset: "图片预设",
  primaryCtaHref: "主要按钮链接",
  primaryCtaLabel: "主要按钮文案",
  rightLabel: "右侧标签",
  secondaryCtaHref: "次要按钮链接",
  secondaryCtaLabel: "次要按钮文案",
  src: "图片路径",
  subtitle: "副标题",
  taglineSub: "身份补充",
  taglineText: "身份描述",
  text: "正文",
  title: "标题",
  value: "内容",
  variant: "样式",
  wechat: "微信",
};

function getChineseFieldLabel(name: string, fallback?: string) {
  const phaseMatch = name.match(/^phase([123])(Label|Title|Subtitle|Content)$/);
  if (phaseMatch) {
    const fieldLabel = {
      Content: "正文",
      Label: "标签",
      Subtitle: "副标题",
      Title: "标题",
    }[phaseMatch[2]];
    return `阶段 ${phaseMatch[1]} ${fieldLabel}|${name}`;
  }
  const columnMatch = name.match(
    /^col([123])(Label|Title|Subtitle|Body|Text|Items|Img|MediaSrc|MediaPreset|MediaFitMode|Preset|FitMode)$/,
  );
  if (columnMatch) {
    const fieldLabel = {
      Body: "正文",
      FitMode: "适应方式",
      Img: "图片",
      Items: "条目",
      Label: "标签",
      MediaFitMode: "媒体适应方式",
      MediaPreset: "媒体预设",
      MediaSrc: "媒体路径",
      Preset: "图片预设",
      Subtitle: "副标题",
      Text: "正文",
      Title: "标题",
    }[columnMatch[2]];
    return `第 ${columnMatch[1]} 栏${fieldLabel}|${name}`;
  }
  return `${CHINESE_FIELD_LABELS[name] ?? fallback ?? name}|${name}`;
}

function createEditorFields(
  fields: Config["components"][string]["fields"],
) {
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([name, field]) => {
      if (name.startsWith("_g_") || !field || typeof field !== "object") {
        return [name, field];
      }
      const nextField: Record<string, unknown> = {
        ...field,
        label: getChineseFieldLabel(name, field.label),
      };
      if (
        INLINE_EDITABLE_FIELDS.has(name) &&
        (field.type === "text" || field.type === "textarea")
      ) {
        nextField.contentEditable = true;
      }
      return [name, nextField];
    }),
  );
}
function DesignAwareRender({
  render,
  renderProps,
  type,
}: {
  render: Config["components"][string]["render"];
  renderProps: GenericRenderProps;
  type: PuckComponentType;
}) {
  const designDocument = useComponentDesignDocument();
  return renderWithAdapter({
    designDocument,
    props: renderProps,
    render,
    surface: "editor",
    type,
  });
}

export function createDesignAwareEditorConfig(baseConfig: Config): Config {
  const components = Object.fromEntries(
    Object.entries(baseConfig.components).map(([type, component]) => {
      const editorComponent = {
        ...component,
        fields: createEditorFields(component.fields),
        label: getEditorComponentMeta(type)?.label ?? component.label,
      };

      return [
        type,
        {
          ...editorComponent,
          render: (renderProps: GenericRenderProps) => (
            <DesignAwareRender
              render={component.render}
              renderProps={renderProps}
              type={type as PuckComponentType}
            />
          ),
        },
      ];
    }),
  ) as Config["components"];

  return { ...baseConfig, components };
}
