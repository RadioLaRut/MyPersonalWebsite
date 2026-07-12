"use client";

import type { ReactNode } from "react";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

interface SectionHeadlineProps {
  indexLabel?: ReactNode;
  title: ReactNode;
  variant?: "chapter" | "section";
}

export default function BreakdownSectionHeadline({
  indexLabel,
  title,
  variant = "section",
}: SectionHeadlineProps) {
  const design = useComponentDesign("BreakdownHeadline");
  const isChapter = variant === "chapter";

  return (
    <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)} grid-container`}>
      <div className={getResponsiveGridColumnClassName(createResponsiveGridBounds(
        { leftCol: 1, rightCol: 12 },
        { leftCol: 1, rightCol: 12 },
        design.contentBounds,
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
          size={isChapter ? "display" : design.titleSize}
          weight="display"
          wrapPolicy="heading"
          className="text-white"
        >
          {title}
        </Typography>
      </div>
    </div>
  );
}
