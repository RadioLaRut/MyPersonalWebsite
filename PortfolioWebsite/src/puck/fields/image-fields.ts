/**
 * 图片字段配置抽象模块
 * 提供可复用的图片字段配置工厂函数
 */

import { IMAGE_FIT_MODE_OPTIONS, IMAGE_PRESET_OPTIONS } from "@/lib/image-presentation";

/**
 * 图片预设字段配置
 */
export const imagePresetField = {
  type: "select" as const,
  options: IMAGE_PRESET_OPTIONS.map((option) => ({ ...option })),
};

/**
 * 图片适配模式字段配置
 */
export const imageFitModeField = {
  type: "select" as const,
  options: IMAGE_FIT_MODE_OPTIONS.map((option) => ({ ...option })),
};

/**
 * 图片字段配置选项
 */
export interface ImageFieldOptions {
  /** 字段名前缀 */
  prefix?: string;
  /** 是否包含alt字段 */
  includeAlt?: boolean;
  /** 是否包含caption字段 */
  includeCaption?: boolean;
  /** 默认图片预设 */
  defaultPreset?: string;
  /** 默认适配模式 */
  defaultFitMode?: string;
}

/**
 * 创建图片字段配置
 * @param options 配置选项
 * @returns 图片字段配置对象
 */
export function createImageFields(options: ImageFieldOptions = {}) {
  const {
    prefix = "",
    includeAlt = false,
    includeCaption = false,
    defaultPreset = "ratio-16-9",
    defaultFitMode = "x",
  } = options;

  const p = prefix ? `${prefix}_` : "";

  const fields: Record<string, { type: string; label: string; options?: Array<{ label: string; value: string }> }> = {
    [`${p}src`]: { type: "text", label: "图片路径" },
    [`${p}preset`]: { ...imagePresetField, label: "图片预设" },
    [`${p}fitMode`]: { ...imageFitModeField, label: "适配模式" },
  };

  if (includeAlt) {
    fields[`${p}alt`] = { type: "text", label: "替代文本" };
  }

  if (includeCaption) {
    fields[`${p}caption`] = { type: "text", label: "图片说明" };
  }

  return fields;
}

/**
 * 创建图片字段默认值
 * @param options 配置选项
 * @returns 默认值对象
 */
export function createImageDefaults(options: ImageFieldOptions = {}) {
  const {
    prefix = "",
    includeAlt = false,
    includeCaption = false,
    defaultPreset = "ratio-16-9",
    defaultFitMode = "x",
  } = options;

  const p = prefix ? `${prefix}_` : "";

  const defaults: Record<string, string> = {
    [`${p}src`]: "",
    [`${p}preset`]: defaultPreset,
    [`${p}fitMode`]: defaultFitMode,
  };

  if (includeAlt) {
    defaults[`${p}alt`] = "";
  }

  if (includeCaption) {
    defaults[`${p}caption`] = "";
  }

  // 使用参数避免未使用变量警告
  void defaultPreset;
  void defaultFitMode;

  return defaults;
}

/**
 * 对比图片字段配置（用于ImageSlider等组件）
 */
export function createComparisonImageFields(leftPrefix = "left", rightPrefix = "right") {
  return {
    ...createImageFields({ prefix: leftPrefix }),
    ...createImageFields({ prefix: rightPrefix }),
  };
}

/**
 * 三联图图片字段配置
 */
export function createTriptychImageFields() {
  return {
    ...createImageFields({ prefix: "col1" }),
    ...createImageFields({ prefix: "col2" }),
    ...createImageFields({ prefix: "col3" }),
  };
}
