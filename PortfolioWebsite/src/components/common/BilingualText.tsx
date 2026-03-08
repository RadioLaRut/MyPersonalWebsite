"use client";

import React, { type ReactNode } from "react";

// ============================================
// 类型定义
// ============================================
type Weight = "light" | "medium" | "black";

interface BilingualTextProps {
  text?: ReactNode | string | null | undefined;
  children?: ReactNode;
  weight?: Weight;
  className?: string;
}

// ============================================
// 全局配置常量
// ============================================

/** 字重配置：定义三种字重的中英文字重和英文大小 */
const WEIGHT_CONFIG: Record<Weight, { han: number; latin: number; latinSize?: string }> = {
  light: { han: 400, latin: 300 },
  medium: { han: 600, latin: 500 },
  black: { han: 900, latin: 700, latinSize: "100%" },
};

/** 中文字体族 */
const FONT_FAMILY_HAN = "var(--font-han-yi-qi-hei), sans-serif";

/** 英文字体族 */
const FONT_FAMILY_LATIN = "var(--font-futura), sans-serif";

/** 中文正则表达式：用于识别汉字及中文标点符号 */
const HAN_LIKE_REGEX = /[\p{Script=Han}\u3000-\u303F\uFF00-\uFFEF]/u;

/** 英文与中文相邻时的垂直对齐调整值（像素） */
const VERTICAL_ALIGN_ADJUST = "-1.3px";

/** 基础CSS类名 */
const CLASS_NAME_INHERIT = "text-inherit";
const CLASS_NAME_INLINE_BLOCK = "inline-block";

// ============================================
// 工具函数
// ============================================

/**
 * 获取字符类型
 * @param char 单个字符
 * @returns "han" | "latin" | "space"
 */
function getTokenType(char: string): "han" | "latin" | "space" {
  if (/\s/u.test(char)) {
    return "space";
  }

  if (HAN_LIKE_REGEX.test(char)) {
    return "han";
  }

  return "latin";
}

/**
 * 分割文本为中文和英文片段
 * @param text 输入文本
 * @returns 分段数组，包含类型、值、前后类型等信息
 */
function segmentText(text: string) {
  const segments: Array<{ type: "han" | "latin"; value: string; addSpaceBefore?: boolean; addSpaceAfter?: boolean; prevType?: "han" | "latin" | null; nextType?: "han" | "latin" | null }> = [];
  let buffer = "";
  let currentType: "han" | "latin" | null = null;
  let prevSegmentType: "han" | "latin" | null = null;

  for (const char of text) {
    if (char === "\n") {
      if (buffer && currentType) {
        segments.push({ type: currentType, value: buffer, prevType: prevSegmentType });
        prevSegmentType = currentType;
      }
      segments.push({ type: "latin", value: "\n", prevType: prevSegmentType });
      prevSegmentType = "latin";
      buffer = "";
      currentType = null;
      continue;
    }

    const tokenType = getTokenType(char);

    if (tokenType === "space") {
      buffer += char;
      continue;
    }

    if (currentType === tokenType || currentType === null) {
      currentType = tokenType;
      buffer += char;
      continue;
    }

    // 中英文切换时，标记需要添加空格
    segments.push({ type: currentType, value: buffer, addSpaceAfter: true, prevType: prevSegmentType });
    prevSegmentType = currentType;
    buffer = char;
    currentType = tokenType;
  }

  if (buffer && currentType) {
    segments.push({ type: currentType, value: buffer, prevType: prevSegmentType });
  }

  // 第二遍遍历，设置nextType
  for (let i = 0; i < segments.length; i++) {
    if (i < segments.length - 1) {
      segments[i].nextType = segments[i + 1].type;
    }
  }

  return segments;
}

/**
 * 检查节点是否为React元素
 */
function isReactElement(node: ReactNode): node is React.ReactElement {
  return React.isValidElement(node);
}

/**
 * 获取英文片段的CSS类名
 * @param needsVerticalAdjust 是否需要垂直对齐调整
 * @returns CSS类名字符串
 */
function getLatinClassName(needsVerticalAdjust: boolean): string {
  return needsVerticalAdjust
    ? `${CLASS_NAME_INLINE_BLOCK} ${CLASS_NAME_INHERIT}`
    : CLASS_NAME_INHERIT;
}

// ============================================
// 渲染函数
// ============================================

/**
 * 处理并渲染节点（用于children模式）
 */
function processNode(
  node: ReactNode,
  weight: Weight,
  key?: string | number
): ReactNode {
  if (node == null) {
    return node;
  }

  if (typeof node !== "string") {
    if (isReactElement(node)) {
      const element = node as React.ReactElement<{ children?: ReactNode }>;
      if (element.props.children) {
        return React.cloneElement(
          element,
          { key },
          processNode(element.props.children, weight)
        );
      }
    }
    return node;
  }

  const segments = segmentText(node);
  const config = WEIGHT_CONFIG[weight];

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.value === "\n") {
          return <br key={`br-${key}-${index}`} />;
        }

        const spaceAfter = segment.addSpaceAfter ? " " : null;

        if (segment.type === "han") {
          return (
            <React.Fragment key={`han-${key}-${index}`}>
              <span
                className={CLASS_NAME_INHERIT}
                style={{
                  fontFamily: FONT_FAMILY_HAN,
                  fontWeight: config.han,
                }}
              >
                {segment.value}
              </span>
              {spaceAfter}
            </React.Fragment>
          );
        }

        // 只在英文片段与中文相邻时才应用 vertical-align 调整
        const needsVerticalAdjust = segment.prevType === "han" || segment.nextType === "han";

        return (
          <React.Fragment key={`latin-${key}-${index}`}>
            <span
              className={getLatinClassName(needsVerticalAdjust)}
              style={{
                fontFamily: FONT_FAMILY_LATIN,
                fontWeight: config.latin,
                verticalAlign: needsVerticalAdjust ? VERTICAL_ALIGN_ADJUST : undefined,
                fontSize: config.latinSize,
              }}
            >
              {segment.value}
            </span>
            {spaceAfter}
          </React.Fragment>
        );
      })}
    </>
  );
}

// ============================================
// 主组件
// ============================================

export default function BilingualText({
  text,
  children,
  weight = "medium",
  className,
}: BilingualTextProps) {
  const content = children !== undefined ? children : text;

  if (content == null) {
    return null;
  }

  if (typeof content !== "string") {
    if (isReactElement(content)) {
      const element = content as React.ReactElement<{ children?: ReactNode }>;
      if (element.props.children) {
        return (
          <span className={className}>
            {processNode(element.props.children, weight)}
          </span>
        );
      }
    }
    return <span className={className}>{content}</span>;
  }

  const segments = segmentText(content);
  const config = WEIGHT_CONFIG[weight];

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.value === "\n") {
          return <br key={`br-${index}`} />;
        }

        const spaceAfter = segment.addSpaceAfter ? " " : null;

        if (segment.type === "han") {
          return (
            <React.Fragment key={`han-${index}`}>
              <span
                className={CLASS_NAME_INHERIT}
                style={{
                  fontFamily: FONT_FAMILY_HAN,
                  fontWeight: config.han,
                }}
              >
                {segment.value}
              </span>
              {spaceAfter}
            </React.Fragment>
          );
        }

        // 只在英文片段与中文相邻时才应用 vertical-align 调整
        const needsVerticalAdjust = segment.prevType === "han" || segment.nextType === "han";

        return (
          <React.Fragment key={`latin-${index}`}>
            <span
              className={getLatinClassName(needsVerticalAdjust)}
              style={{
                fontFamily: FONT_FAMILY_LATIN,
                fontWeight: config.latin,
                verticalAlign: needsVerticalAdjust ? VERTICAL_ALIGN_ADJUST : undefined,
                fontSize: config.latinSize,
              }}
            >
              {segment.value}
            </span>
            {spaceAfter}
          </React.Fragment>
        );
      })}
    </span>
  );
}
