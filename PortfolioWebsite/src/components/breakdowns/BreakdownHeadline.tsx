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
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
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

  if (componentLayout) {
    const indexTypography = getComponentLayoutTypography(componentLayout, "index");
    const titleTypography = getComponentLayoutTypography(componentLayout, "title");
    return (
      <section
        className={`w-full ${getComponentSectionProfileClassName(componentLayout)}`}
        style={getComponentSectionStyle(componentLayout)}
      >
        <div className="grid-container">
          {hasEditableTextContent(indexLabel) ? (
            <ComponentLayoutNode layout={componentLayout} nodeId="index">
              <Typography
                as="p"
                preset={indexTypography?.preset ?? "sans-body"}
                size={indexTypography?.size ?? "label"}
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
              preset={titleTypography?.preset ?? (isChapter ? "luna-editorial" : "sans-body")}
              size={titleTypography?.size ?? (isChapter ? "display" : "title")}
              weight={isChapter ? "semantic" : "display"}
              wrapPolicy={titleTypography?.wrap ?? "heading"}
              align={getComponentLayoutAlignment(componentLayout, "title")}
              className="text-white"
            >
              {title}
            </Typography>
          </ComponentLayoutNode>
        </div>
      </section>
    );
  }

  return (
    <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)} grid-container`}>
      <div className={getResponsiveGridColumnClassName(createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 1, rightCol: 12 },
        resolvedDesign.contentBounds,
      ))}>
        {hasEditableTextContent(indexLabel) ? (
          <Typography
            as="p"
            preset="sans-body"
            size="caption"
            weight="semantic"
            wrapPolicy="label"
            className="mb-6 text-textMuted"
          >
            {indexLabel}
          </Typography>
        ) : null}
        <Typography
          as="h2"
          preset={isChapter ? "luna-editorial" : "sans-body"}
          size={isChapter ? "display" : resolvedDesign.titleSize}
          weight={isChapter ? "semantic" : "display"}
          wrapPolicy="heading"
          className="text-white"
        >
          {title}
        </Typography>
      </div>
    </div>
  );
}
