export { castTypographyAlignment } from "../../lib/typography-alignment.ts";

export const TEXT_ALIGNMENT_OPTIONS = [
  { label: "左对齐", value: "left" },
  { label: "居中对齐", value: "center" },
  { label: "右对齐", value: "right" },
  { label: "两端对齐（含末行）", value: "justify" },
] as const;

export function createTextAlignmentField(label: string) {
  return {
    label,
    options: [...TEXT_ALIGNMENT_OPTIONS],
    type: "select" as const,
  };
}
