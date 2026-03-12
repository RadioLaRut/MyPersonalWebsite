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
  return (
    <section className="border-b border-white/10 pt-36 pb-20 md:pt-40 md:pb-24">
      <div className="grid-container">
        <div className="col-span-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:[align-items:last_baseline]">
          <div className="lg:col-span-8 lg:col-start-2">
            <div className="mb-10">
              <Link
                href={backHref}
                className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-2 text-textMuted transition-colors duration-300 hover:text-white"
              >
                <span className="h-px w-4 bg-white/30 transition-all duration-300 group-hover:w-6 group-hover:bg-white/60"></span>
                <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                <Typography
                  preset="sans-body"
                  size="label"
                  weight="medium"
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
              weight="medium"
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

          <div className="lg:col-span-3 lg:col-start-10">
            {description ? (
              <div className="grid content-start justify-items-start lg:pl-4">
                <Typography
                  as="p"
                  preset="sans-body"
                  size="body"
                  weight="regular"
                  wrapPolicy="prose"
                  className="text-textPrimary/90"
                  style={{ lineHeight: 1.2 }}
                >
                  {description}
                </Typography>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
