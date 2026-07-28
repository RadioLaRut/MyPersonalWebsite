import type { ReactNode } from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";
import { hasEditableTextContent } from "@/lib/editable-text";

type SectionHeadlineProps = {
  indexLabel?: ReactNode;
  title: ReactNode;
  variant?: "chapter" | "section";
} & ComponentDesignOverride<"BreakdownHeadline"> & ComponentLayoutProps;

export default function BreakdownSectionHeadline({
  indexLabel,
  componentLayout,
  title,
  variant = "section",
  design,
}: SectionHeadlineProps) {
  const resolvedDesign = resolveComponentDesign("BreakdownHeadline", design);
  const isChapter = variant === "chapter";
  const indexTypography = getComponentLayoutTypography(
    componentLayout,
    "index",
  );
  const titleTypography = getComponentLayoutTypography(
    componentLayout,
    "title",
  );
  const sectionClassName = componentLayout
    ? getComponentSectionProfileClassName(componentLayout)
    : getSectionSpacingClassName(resolvedDesign.sectionSpacing);

  return (
    <section
      className={`w-full ${sectionClassName}`}
      style={getComponentSectionStyle(componentLayout)}
    >
      <div className="grid-container">
        <div
          className={componentLayout
            ? "contents"
            : getResponsiveGridColumnClassName(
              createResponsiveGridBounds(
                { leftCol: 1, rightCol: 12 },
                { leftCol: 1, rightCol: 12 },
                resolvedDesign.contentBounds,
              ),
            )}
        >
          {hasEditableTextContent(indexLabel) ? (
            <ComponentLayoutNode
              layout={componentLayout}
              nodeId="index"
              style={!componentLayout ? { marginBottom: "1.5rem" } : undefined}
            >
              <Typography
                as="p"
                preset={indexTypography?.preset ?? "sans-body"}
                size={indexTypography?.size ?? "caption"}
                weight="semantic"
                wrapPolicy={indexTypography?.wrap ?? "label"}
                align={getComponentLayoutAlignment(componentLayout, "index")}
                className="text-textMuted"
              >
                {indexLabel}
              </Typography>
            </ComponentLayoutNode>
          ) : null}
          <ComponentLayoutNode
            gapFrom={hasEditableTextContent(indexLabel) ? "index" : undefined}
            layout={componentLayout}
            nodeId="title"
          >
            <Typography
              as="h2"
              preset={titleTypography?.preset ??
                (isChapter ? "luna-editorial" : "sans-body")}
              size={titleTypography?.size ??
                (isChapter ? "display" : resolvedDesign.titleSize)}
              weight={isChapter ? "semantic" : "display"}
              wrapPolicy={titleTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "title")}
              className="text-white"
            >
              {title}
            </Typography>
          </ComponentLayoutNode>
        </div>
      </div>
    </section>
  );
}
