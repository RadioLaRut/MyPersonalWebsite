"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface HomeEndcapSectionProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  buttonLabel: ReactNode;
  buttonHref: string;
  editMode?: boolean;
}

export default function HomeEndcapSection({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonHref,
  editMode = false,
}: HomeEndcapSectionProps) {
  return (
    <section className="relative isolate flex min-h-[68vh] w-full items-center overflow-hidden border-t border-white/10 bg-black py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="grid-container relative z-10">
        <div className="col-span-4 md:col-start-3 md:col-span-8 text-center">
          {eyebrow ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/35">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="mt-6 font-luna text-[clamp(4.8rem,13vw,10rem)] uppercase leading-[0.92] tracking-[0.015em] text-white md:text-[clamp(5.6rem,8vw,8.6rem)]">
            {title}
          </h2>

          {description ? (
            <p className="mx-auto mt-8 max-w-3xl font-futura text-sm uppercase leading-[1.8] tracking-[0.14em] text-white/55 md:text-base">
              {description}
            </p>
          ) : null}

          <div className="mt-12">
            <Link
              href={buttonHref}
              onClick={(event) => {
                if (editMode) {
                  event.preventDefault();
                }
              }}
              className="interactive inline-flex items-center gap-4 border border-white/20 px-6 py-4 font-mono text-xs uppercase tracking-[0.26em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              <span>{buttonLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
