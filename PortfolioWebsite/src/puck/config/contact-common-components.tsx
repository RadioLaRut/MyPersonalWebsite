import type { ComponentDefinitionRegistry } from "./component-definition";
import { createFieldGroup } from "@/puck/fields/field-groups";

// defaultProps 仅服务 Admin 新建节点；ComponentLab 的演示内容统一来自页面实例与预设文件。
export const contactCommonComponents = {
    ContactFlashlight: {
      fields: {
        _g_fx: createFieldGroup("视觉效果"),
        anchorId: { type: "text", label: "锚点 ID" },
        maskRadius: { type: "number", label: "Mask Radius" },
        maskSmoothness: { type: "number", label: "Mask Smoothness" },
        darkTextColor: { type: "text", label: "Dark Text Color" },
        lightTextColor: { type: "text", label: "Light Text Color" },
        _g_identity: createFieldGroup("个人信息"),
        name: { type: "text", label: "Name" },
        taglineText: { type: "text", label: "Tagline Text" },
        taglineSub: { type: "text", label: "Tagline Sub" },
        _g_contact: createFieldGroup("联系方式"),
        email: { type: "text", label: "Email" },
        wechat: { type: "text", label: "WeChat" },
        copyLabel: { type: "text", label: "复制按钮文案" },
        copySuccessMessage: { type: "text", label: "复制成功反馈" },
        copyErrorMessage: { type: "text", label: "复制失败反馈" },
        _g_slots: createFieldGroup("内容槽"),
        experienceHistory: { type: "slot", label: "Experience History" },
        creativeDirection: { type: "slot", label: "Creative Direction" }
      },
      defaultProps: {
        anchorId: "contact",
        maskRadius: 500,
        maskSmoothness: 40,
        darkTextColor: "rgba(255,255,255,0.4)",
        lightTextColor: "rgba(255,255,255,1)",
        name: "JIANG CHENGYAN",
        taglineText: "艺术与科技 / 交互叙事设计 / 游戏设计",
        taglineSub: "CUC '2028",
        email: "hello@example.com",
        wechat: "wechat_id",
        copyLabel: "复制微信号",
        copySuccessMessage: "微信号已复制",
        copyErrorMessage: "复制失败，请手动选择微信号",
        experienceHistory: [],
        creativeDirection: []
      },
    },

    MetadataListItem: {
      fields: {
        label: { type: "text", label: "Label" },
        value: { type: "text", label: "Value" },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Start", value: "start" },
            { label: "End", value: "end" },
          ],
        },
      },
      defaultProps: {
        label: "Role",
        value: "Designer",
        align: "start",
      },
    },

    TextParagraphBlock: {
      fields: {
        text: { type: "textarea", label: "Text" },
      },
      defaultProps: {
        text: "Sample paragraph text.",
      },
    },

} satisfies ComponentDefinitionRegistry;
