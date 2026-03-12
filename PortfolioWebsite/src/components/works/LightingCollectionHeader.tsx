"use client";

import Link from "next/link";
import Typography from "@/components/common/Typography";

export interface LightingCollectionHeaderProps {
  title: string;
  number: string;
  description?: string;
  backHref?: string;
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
      <div className="grid-container items-start gap-y-10 lg:items-end">
        <div className={`col-start-2 col-span-10 ${hasDescription ? "lg:col-span-6" : "lg:col-span-10"}`}>
          <div className="mb-12">
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
                style={{ lineHeight: 1 }}
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
            style={{ lineHeight: 1 }}
          >
            COLLECTION {number}
          </Typography>
          <Typography
            as="h1"
            preset="luna-editorial"
            size="hero"
            weight="display"
            wrapPolicy="nowrap"
            className="mt-6 text-white"
          >
            {title}
          </Typography>
        </div>

        {hasDescription ? (
          <div className="col-start-2 col-span-10 lg:col-start-9 lg:col-span-3 lg:self-end lg:translate-y-[0.18rem]">
            <Typography
              as="p"
              preset="sans-body"
              size="body"
              weight="semantic"
              wrapPolicy="prose"
              align="right"
              className="ml-auto max-w-[22rem] text-textPrimary/90"
              style={{ lineHeight: 1.2 }}
            >
              {description}
            </Typography>
          </div>
        ) : null}
      </div>
    </section>
  );
}
