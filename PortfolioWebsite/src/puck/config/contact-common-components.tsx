import type { Config } from "@puckeditor/core";
import ContactFlashlightBlock from "@/components/blocks/ContactFlashlightBlock";
import MetadataListItem from "@/components/common/MetadataListItem";
import TextParagraphBlock from "@/components/common/TextParagraphBlock";
import { createFieldGroup } from "@/puck/fields/field-groups";
import { castSelectValue } from "@/puck/fields/select-fields";
import { ALLOW_METADATA_LIST_ITEM, pickEntryField, readSlot } from "./shared";

const METADATA_LIST_ITEM_ALIGN_VALUES = ["start", "end"] as const;

// TODO(component-lab): defaultProps 中的字面量文案需迁移到 ComponentLab 预设链路，当前为兼容历史 JSON 暂留。
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
        name: { type: "text", contentEditable: true, label: "Name" },
        taglineText: { type: "text", contentEditable: true, label: "Tagline Text" },
        taglineSub: { type: "text", contentEditable: true, label: "Tagline Sub" },
        _g_contact: createFieldGroup("联系方式"),
        email: { type: "text", contentEditable: true, label: "Email" },
        wechat: { type: "text", contentEditable: true, label: "WeChat" },
        copyLabel: { type: "text", contentEditable: true, label: "复制按钮文案" },
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
      render: ({
        anchorId,
        maskRadius,
        maskSmoothness,
        darkTextColor,
        lightTextColor,
        name,
        taglineText,
        taglineSub,
        email,
        wechat,
        copyLabel,
        copySuccessMessage,
        copyErrorMessage,
        experienceHistory,
        creativeDirection,
        editMode,
      }) => {
        const { items: experienceItems, SlotComponent: ExperienceSlot } = readSlot(
          experienceHistory,
          (entry) => ({
            company: pickEntryField(entry, "company", "label") ?? "",
            role: pickEntryField(entry, "role", "value") ?? "",
          }),
        );
        const { items: creativeItems, SlotComponent: CreativeSlot } = readSlot(
          creativeDirection,
          (entry) => ({
            title: pickEntryField(entry, "title", "label") ?? "",
            subtitle: pickEntryField(entry, "subtitle", "value") ?? "",
          }),
        );

        return (
          <ContactFlashlightBlock
            anchorId={anchorId}
            maskRadius={maskRadius}
            maskSmoothness={maskSmoothness}
            darkTextColor={darkTextColor}
            lightTextColor={lightTextColor}
            name={name}
            taglineText={taglineText}
            taglineSub={taglineSub}
            email={email}
            wechat={wechat}
            copyLabel={copyLabel}
            copySuccessMessage={copySuccessMessage}
            copyErrorMessage={copyErrorMessage}
            editMode={editMode}
            experienceHistory={experienceItems}
            creativeDirection={creativeItems}
            experienceContent={ExperienceSlot ? <ExperienceSlot allow={ALLOW_METADATA_LIST_ITEM} className="space-y-6" minEmptyHeight={20} /> : undefined}
            creativeContent={CreativeSlot ? <CreativeSlot allow={ALLOW_METADATA_LIST_ITEM} className="space-y-6" minEmptyHeight={20} /> : undefined}
          />
        );
      }
    },

    MetadataListItem: {
      fields: {
        label: { type: "text", contentEditable: true, label: "Label" },
        value: { type: "text", contentEditable: true, label: "Value" },
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
      render: ({ label, value, align }) => (
        <MetadataListItem
          label={label}
          value={value}
          align={castSelectValue(align, METADATA_LIST_ITEM_ALIGN_VALUES, "start")}
        />
      ),
    },

    TextParagraphBlock: {
      fields: {
        text: { type: "textarea", contentEditable: true, label: "Text" },
      },
      defaultProps: {
        text: "Sample paragraph text.",
      },
      render: ({ text }) => <TextParagraphBlock text={text} />,
    },

} satisfies Config["components"];
