import type { ReactNode } from "react";

import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

type RichParagraphBlockProps = {
  align?: TypographyAlignment;
  content: ReactNode;
} & ComponentDesignOverride<"RichParagraph">;

export default function RichParagraphBlock({
  align = "justify",
  content,
  design,
}: RichParagraphBlockProps) {
  const resolvedDesign = resolveComponentDesign("RichParagraph", design);

  return (
    <article
      className={`relative z-20 w-full bg-black ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}
    >
      <div className="grid-container w-full">
        <div className={getResponsiveGridColumnClassName(createResponsiveGridBounds(
          { leftCol: 1, rightCol: 12 },
          { leftCol: 2, rightCol: 11 },
          resolvedDesign.contentBounds,
        ))}>
          <Typography
            as="p"
            preset="sans-body"
            size={resolvedDesign.bodySize}
            weight="medium"
            wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"}
            align={align}
            className="text-textSecondary"
          >
            {content}
          </Typography>
        </div>
      </div>
    </article>
  );
}
