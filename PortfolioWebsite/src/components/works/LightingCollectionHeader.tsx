"use client";

import Link from "next/link";
import Typography from "@/components/common/Typography";

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
}: LightingCollectionHeaderProps) {
  const hasDescription = typeof description === "string" && description.trim().length > 0;

  return (
    <section className="border-b border-white/10 rhythm-section-hero">
      <div className="grid-container">
        <div className="col-span-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:[align-items:last_baseline]">
          <div className="lg:col-span-8 lg:col-start-2">
            <div className="mb-10">
              <Link
                href={backHref}
                className="group interactive inline-grid grid-cols-[0.32rem_auto] items-center gap-1.5 text-textMuted transition-colors duration-300 hover:text-white"
              >
                <svg
                  className="h-2.5 w-[0.32rem] shrink-0 overflow-visible translate-y-[1px] transition-transform duration-300 group-hover:translate-x-[1px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 7 12"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.35} d="M6.25 0.75 0.9 6l5.35 5.25" />
                </svg>
                <Typography
                  preset="sans-body"
                  size="caption"
                  weight="semantic"
                  wrapPolicy="label"
                  className="text-inherit"
                >
                  BACK TO LIGHTING
                </Typography>
              </Link>
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
              className="mt-5 text-white"
            >
              {title}
            </Typography>
          </div>

          {hasDescription ? (
            <div className="lg:col-span-3 lg:col-start-10 lg:pb-[0.12rem]">
              <Typography
                as="p"
                preset="sans-body"
                size="body"
                weight="regular"
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
