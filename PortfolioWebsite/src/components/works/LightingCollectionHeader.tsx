"use client";

import { ChevronLeft } from "lucide-react/dist/cjs/lucide-react.js";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { MotionLink } from "@/components/motion";
import {
  getResponsiveGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";

export interface LightingCollectionHeaderProps {
  title: string;
  number: string;
  description?: string;
  backHref?: string;
  editMode?: boolean;
}

export default function LightingCollectionHeader({
  title,
  number,
  description,
  backHref = "/works/lighting-portfolio",
  editMode = false,
}: LightingCollectionHeaderProps) {
  const design = useComponentDesign("LightingCollectionHeader");
  const hasDescription = typeof description === "string" && description.trim().length > 0;

  return (
    <section className="border-b border-white/10 rhythm-section-hero">
      <div className="grid-container">
        <div className="grid-subgrid col-span-12 lg:[align-items:last_baseline]">
          <div className={getResponsiveGridColumnClassName(design.titleBounds)}>
            <div className="mb-10">
              <MotionLink
                href={backHref}
                disabled={editMode}
                className="group interactive inline-grid grid-cols-[0.32rem_auto] items-center gap-1.5 text-textMuted transition-colors duration-300 hover:text-white"
              >
                <ChevronLeft
                  className="h-2.5 w-2.5 shrink-0 translate-y-[1px] transition-transform duration-300 group-hover:translate-x-[1px]"
                  strokeWidth={1.35}
                  aria-hidden="true"
                />
                <Typography
                  preset="sans-body"
                  size="caption"
                  weight="semantic"
                  wrapPolicy="label"
                  className="text-inherit"
                >
                  BACK TO LIGHTING
                </Typography>
              </MotionLink>
            </div>

            <Typography
              as="p"
              preset="sans-body"
              size="caption"
              weight="semantic"
              wrapPolicy="label"
              className="text-white/38"
            >
              COLLECTION {number}
            </Typography>
            <Typography
              as="h1"
              preset="luna-editorial"
              size="title"
              weight="display"
              wrapPolicy="heading"
              className="text-white"
              style={{ marginTop: getSpacingRem(design.titleTopSpacing) }}
            >
              {title}
            </Typography>
          </div>

          {hasDescription ? (
            <div className={`${getResponsiveGridColumnClassName(design.descriptionBounds)} lg:pb-[0.12rem]`}>
              <Typography
                as="p"
                preset="sans-body"
                size="body"
                weight="semantic"
                wrapPolicy="prose"
                align="right"
                className="ml-auto max-w-[22rem] text-textPrimary/90"
              >
                {description}
              </Typography>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
