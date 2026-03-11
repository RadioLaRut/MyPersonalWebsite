import type { ReactNode } from "react";

import Typography from "@/components/common/Typography";

interface TextParagraphBlockProps {
  text: ReactNode;
}

export default function TextParagraphBlock({ text }: TextParagraphBlockProps) {
  return (
    <Typography
      as="p"
      preset="sans-body"
      size="body"
      weight="medium"
      wrapPolicy="prose"
      className="text-textPrimary"
    >
      {text}
    </Typography>
  );
}
