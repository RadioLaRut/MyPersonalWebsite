import type { ReactNode } from "react";

import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";

interface TextParagraphBlockProps {
  align?: TypographyAlignment;
  text: ReactNode;
}

export default function TextParagraphBlock({
  align = "left",
  text,
}: TextParagraphBlockProps) {
  return (
    <Typography
      as="p"
      preset="sans-body"
      size="body"
      weight="medium"
      wrapPolicy="prose"
      align={align}
      className="text-textPrimary"
    >
      {text}
    </Typography>
  );
}
