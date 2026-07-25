import type { CSSProperties } from "react";

export type TypographyAlignment =
  | "left"
  | "center"
  | "right"
  | "justify";

export const TYPOGRAPHY_ALIGNMENT_VALUES = [
  "left",
  "center",
  "right",
  "justify",
] as const satisfies readonly TypographyAlignment[];

export function isTypographyAlignment(
  value: unknown,
): value is TypographyAlignment {
  return typeof value === "string" &&
    TYPOGRAPHY_ALIGNMENT_VALUES.includes(value as TypographyAlignment);
}

export function castTypographyAlignment(
  value: unknown,
  fallback: TypographyAlignment = "left",
): TypographyAlignment {
  return isTypographyAlignment(value) ? value : fallback;
}

export function getTypographyAlignmentStyle(
  align: TypographyAlignment,
): Pick<CSSProperties, "textAlign" | "textAlignLast"> {
  if (align === "justify") {
    return {
      textAlign: "justify",
      textAlignLast: "justify",
    };
  }

  return {
    textAlign: align,
    textAlignLast: undefined,
  };
}
