import type { ReactNode } from "react";

import Typography, {
  type TypographyAlignmentValue,
} from "@/components/common/Typography";
import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentSectionProfileClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

type RichParagraphBlockProps = {
  align?: TypographyAlignmentValue;
  content: ReactNode;
} & ComponentDesignOverride<"RichParagraph"> & ComponentLayoutProps;

export default function RichParagraphBlock({
  align = "justify",
  componentLayout,
  content,
  design,
}: RichParagraphBlockProps) {
  const resolvedDesign = resolveComponentDesign("RichParagraph", design);
  const typography = getComponentLayoutTypography(componentLayout, "body");

  return (
    <article
      className={`relative z-20 w-full bg-black ${
        componentLayout
          ? getComponentSectionProfileClassName(componentLayout)
          : getSectionSpacingClassName(resolvedDesign.sectionSpacing)
      }`}
    >
      <div className="grid-container w-full">
        <ComponentLayoutNode
          layout={componentLayout}
          nodeId="body"
          className={!componentLayout ? "col-span-12 md:col-start-2 md:col-span-10 lg:col-start-3 lg:col-span-8" : undefined}
        >
          <Typography
            as="p"
            preset={typography?.preset ?? "sans-body"}
            size={typography?.size ?? resolvedDesign.bodySize}
            weight="medium"
            wrapPolicy={typography?.wrap ?? (resolvedDesign.bodyAutoWrap ? "prose" : "nowrap")}
            align={getComponentLayoutAlignment(componentLayout, "body", align)}
            className="text-textSecondary"
          >
            {content}
          </Typography>
        </ComponentLayoutNode>
      </div>
    </article>
  );
}
