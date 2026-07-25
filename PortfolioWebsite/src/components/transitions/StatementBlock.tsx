import type { ReactNode } from "react";

import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { Reveal } from "@/components/motion/Reveal";
import { getGridColumnClassName } from "@/lib/component-design-style";

type StatementBlockProps = {
  content: ReactNode;
  align?: "left" | "center" | "right";
  backgroundColor?: "black" | "dark-gray";
  minHeight?: "small" | "medium" | "large";
  editMode?: boolean;
} & ComponentDesignOverride<"StatementBlock">;

export default function StatementBlock({
  content,
  align = "center",
  backgroundColor = "black",
  minHeight = "medium",
  editMode = false,
  design,
}: StatementBlockProps) {
  const resolvedDesign = resolveComponentDesign("StatementBlock", design);
  const alignClass = {
    left: "justify-items-start text-left",
    center: "justify-items-center text-center",
    right: "justify-items-end text-right",
  }[align];

  const bgClass = {
    black: "bg-black",
    "dark-gray": "bg-[#0a0a0a]",
  }[backgroundColor];

  const heightClass = {
    small: "min-h-[calc(var(--site-viewport-unit)*16)] md:min-h-[calc(var(--site-viewport-unit)*20)]",
    medium: "min-h-[calc(var(--site-viewport-unit)*24)] md:min-h-[calc(var(--site-viewport-unit)*35)]",
    large: "min-h-[calc(var(--site-viewport-unit)*36)] md:min-h-[calc(var(--site-viewport-unit)*50)]",
  }[minHeight];
  const rhythmClass = {
    small: "rhythm-section-compact",
    medium: "rhythm-section-normal",
    large: "rhythm-section-spacious",
  }[minHeight];

  return (
    <section className={`relative z-20 grid w-full ${heightClass} ${bgClass} ${rhythmClass} content-center`}>
      <div className="grid-container w-full">
        <Reveal
          className={`${getGridColumnClassName(resolvedDesign.contentBounds)} grid ${alignClass} ${editMode ? "pointer-events-auto" : ""}`}
          disabled={editMode}
        >
          <Typography
            as="p"
            preset="sans-body"
            size={resolvedDesign.bodySize}
            weight="light"
            wrapPolicy={resolvedDesign.bodyAutoWrap ? "prose" : "nowrap"}
            className="max-w-4xl text-textPrimary"
            align={align}
          >
            {content}
          </Typography>
        </Reveal>
      </div>
    </section>
  );
}
