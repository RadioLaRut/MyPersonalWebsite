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
    <section className="pt-40 pb-20 px-8 md:px-16 border-b border-white/10">
      <Link
        href={backHref}
        className="inline-flex items-center text-white/60 hover:text-white transition-colors uppercase tracking-[0.25em] text-sm font-mono mb-12 px-4 py-2 border border-white/20 hover:border-white/40 rounded"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        BACK TO PORTFOLIO
      </Link>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="font-mono text-white/40 tracking-[0.4em] text-sm mb-4">COLLECTION {number}</p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase font-luna text-white">
            {title}
          </h1>
        </div>
        <p className="font-futura tracking-widest text-white/60 text-sm max-w-sm">
          {description || `A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for ${title.toLowerCase()}.`}
        </p>
      </div>
    </section>
  );
}
