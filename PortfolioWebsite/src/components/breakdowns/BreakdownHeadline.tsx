"use client";

import type { ReactNode } from "react";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import {
  getGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";

interface SectionHeadlineProps {
  title: ReactNode;
}

export default function BreakdownSectionHeadline({ title }: SectionHeadlineProps) {
  const design = useComponentDesign("BreakdownHeadline");

  return (
    <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)} grid-container`}>
      <div className={getGridColumnClassName(design.contentBounds)}>
        <Typography
          as="h2"
          preset="sans-body"
          size={design.titleSize}
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
