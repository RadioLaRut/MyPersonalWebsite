/**
 * FieldGroup — 在 Puck 右侧编辑栏中渲染一个视觉分组标题。
 *
 * 使用方式：在组件 fields 对象中插入，作为视觉分隔符。
 * 该字段不存储任何数据，onChange 永远不会被调用。
 *
 * 示例：
 *   fields: {
 *     _group_text: createFieldGroup("📝 文本内容"),
 *     title: { type: "text", label: "Title" },
 *     subtitle: { type: "text", label: "Subtitle" },
 *     _group_image: createFieldGroup("🖼 图片配置"),
 *     imageSrc: { type: "text", label: "Image Source" },
 *   }
 */

import React from "react";
import type { CustomField } from "@measured/puck";

export function createFieldGroup(label: string): CustomField<undefined> {
    return {
        type: "custom",
        label: "",
        render: () => (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "12px",
                    marginBottom: "2px",
                    paddingBottom: "6px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                }}
            >
                <span
                    style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#64748b",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </span>
            </div>
        ),
    };
}
