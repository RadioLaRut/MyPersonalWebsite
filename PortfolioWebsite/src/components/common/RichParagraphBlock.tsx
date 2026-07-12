"use client";

import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

export default function RichParagraphBlock({
  content,
}: {
  content: string;
}) {
  const design = useComponentDesign("RichParagraph");

  return (
    <article
      className={`relative z-20 w-full bg-black ${getSectionSpacingClassName(design.sectionSpacing)}`}
    >
      <div className="grid-container w-full">
        <div className={getResponsiveGridColumnClassName(createResponsiveGridBounds(
          { leftCol: 1, rightCol: 12 },
          { leftCol: 2, rightCol: 11 },
          design.contentBounds,
        ))}>
          <Typography
            as="p"
            preset="sans-body"
            size={design.bodySize}
            weight="medium"
            wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"}
            className="text-justify text-textSecondary"
          >
            {content}
          </Typography>
        </div>
      </div>
    </article>
  );
}
