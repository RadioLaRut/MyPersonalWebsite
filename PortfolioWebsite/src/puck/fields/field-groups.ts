/**
 * 字段分组配置模块
 * 提供标准化的字段分组和字段类型工厂函数
 */

import type { CustomField } from "@measured/puck";
import React from "react";

/**
 * 字段分组配置
 */
export interface FieldGroupConfig {
  /** 分组标题 */
  title: string;
  /** 是否默认折叠 */
  collapsed?: boolean;
}

/**
 * 创建字段分组字段
 * 用于在Puck配置中创建视觉分组标题
 * @param title 分组标题
 * @returns CustomField配置
 */
export function createFieldGroup(title: string): CustomField<undefined> {
  return {
    type: "custom",
    label: "",
    render: () =>
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            marginBottom: "2px",
            paddingBottom: "6px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          },
        },
        React.createElement(
          "span",
          {
            style: {
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#64748b",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              whiteSpace: "nowrap",
            },
          },
          title
        )
      ),
  };
}

/**
 * 标准字段分组标题
 * 统一的分组命名规范，移除emoji符号
 */
export const FieldGroups = {
  /** 文本内容分组 */
  TEXT: "文本内容",
  /** 图片配置分组 */
  IMAGE: "图片配置",
  /** 布局设置分组 */
  LAYOUT: "布局设置",
  /** 样式设置分组 */
  STYLE: "样式设置",
  /** 链接设置分组 */
  LINK: "链接设置",
  /** 导航设置分组 */
  NAVIGATION: "导航设置",
  /** 标签设置分组 */
  TAGS: "标签设置",
  /** 参数设置分组 */
  PARAMETERS: "参数设置",
  /** 阶段设置分组（用于多阶段展示组件） */
  PHASE: (num: number) => `阶段 ${num}`,
  /** 列设置分组（用于多列组件） */
  COLUMN: (num: number) => `第 ${num} 列`,
} as const;

/**
 * 标准字段类型工厂
 */
export const FieldTypes = {
  /**
   * 文本字段
   */
  text: (label: string, options: { contentEditable?: boolean } = {}) => ({
    type: "text" as const,
    label,
    contentEditable: options.contentEditable ?? false,
  }),

  /**
   * 多行文本字段
   */
  textarea: (label: string, options: { contentEditable?: boolean } = {}) => ({
    type: "textarea" as const,
    label,
    contentEditable: options.contentEditable ?? false,
  }),

  /**
   * 数字字段
   */
  number: (label: string) => ({
    type: "number" as const,
    label,
  }),

  /**
   * 选择字段
   */
  select: (label: string, options: Array<{ label: string; value: string }>) => ({
    type: "select" as const,
    label,
    options,
  }),

  /**
   * 数组字段
   */
  array: <T extends Record<string, { type: string; label: string }>>(
    label: string,
    arrayFields: T,
    getItemSummary: (item: Record<string, string>) => string
  ) => ({
    type: "array" as const,
    label,
    arrayFields,
    getItemSummary,
  }),

  /**
   * 插槽字段
   */
  slot: (label: string) => ({
    type: "slot" as const,
    label,
  }),
} as const;

/**
 * 创建分组的字段配置
 * @param groups 字段分组数组
 * @returns 合并后的字段配置对象
 */
export function createGroupedFields(
  groups: Array<{
    group: string;
    fields: Record<string, ReturnType<typeof FieldTypes[keyof typeof FieldTypes]>>;
  }>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const { group, fields } of groups) {
    // 添加分组标记 - 使用字符串键
    const groupKey = `__group_${group}`;
    result[groupKey] = createFieldGroup(group);
    // 添加字段
    Object.assign(result, fields);
  }

  return result;
}
