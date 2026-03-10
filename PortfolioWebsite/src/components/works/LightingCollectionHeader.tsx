"use client";

import Link from "next/link";

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
    <section className="pt-40 pb-20 border-b border-white/10">
      <div className="grid-container">
        <div className="col-span-4 lg:col-start-1 lg:col-span-12">
          <div className="grid grid-cols-4 lg:grid-cols-12 gap-8">
            <div className="col-span-4 lg:col-span-12 mb-12">
              <Link
                href={backHref}
                className="inline-flex items-center text-textMuted hover:text-white transition-colors uppercase tracking-[0.25em] text-sm font-mono px-4 py-2 border border-white/20 hover:border-white/40 rounded"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                BACK TO PORTFOLIO
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-12">
            <div className="col-span-4 lg:col-start-1 lg:col-span-12">
              <p className="font-mono text-textMuted tracking-[0.4em] text-sm mb-4">COLLECTION {number}</p>
              <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-8">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase font-luna text-white leading-none">
                  {title}
                </h1>
                {description ? (
                  <p className="font-futura tracking-widest text-textMuted text-sm max-w-sm lg:text-right lg:self-end">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
