import type { ReactNode } from "react";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

type SectionHeadlineProps = {
  indexLabel?: ReactNode;
  title: ReactNode;
  variant?: "chapter" | "section";
} & ComponentDesignOverride<"BreakdownHeadline">;

export default function BreakdownSectionHeadline({
  indexLabel,
  title,
  variant = "section",
  design,
}: SectionHeadlineProps) {
  const resolvedDesign = resolveComponentDesign("BreakdownHeadline", design);
  const isChapter = variant === "chapter";

  return (
    <div className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)} grid-container`}>
      <div className={getResponsiveGridColumnClassName(createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 1, rightCol: 12 },
        resolvedDesign.contentBounds,
      ))}>
        {indexLabel ? (
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
