"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Typography from "@/components/common/Typography";

interface HomeEndcapSectionProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  buttonLabel: ReactNode;
  buttonHref: string;
  editMode?: boolean;
}

function isContentEmpty(content: ReactNode): boolean {
  if (content === null || content === undefined) return true;
  if (typeof content === "string") return content.trim() === "";
  if (typeof content === "number") return false;
  if (Array.isArray(content)) return content.length === 0 || content.every(isContentEmpty);
  return false;
}

export default function HomeEndcapSection({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonHref,
  editMode = false,
}: HomeEndcapSectionProps) {
  const hasDescription = !isContentEmpty(description);

  return (
    <section className="relative isolate grid min-h-[68vh] w-full items-center overflow-hidden border-t border-white/10 bg-black py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="grid-container relative z-10">
        <div className="col-start-3 col-span-8 text-center">
          {eyebrow ? (
            <Typography
              as="p"
              preset="sans-body"
              size="caption"
              weight="medium"
              wrapPolicy="label"
              className="text-white/35"
            >
              {eyebrow}
            </Typography>
          ) : null}

          <Typography
            as="h2"
            preset="luna-editorial"
            size="hero"
            weight="display"
            wrapPolicy="heading"
            className="mt-6 text-white uppercase"
          >
            {title}
          </Typography>

          {hasDescription ? (
            <Typography
              as="p"
              preset="sans-body"
              size="body-sm"
              weight="medium"
              wrapPolicy="prose"
              align="center"
              className="mx-auto mt-8 max-w-3xl text-white/55 uppercase"
            >
              {description}
            </Typography>
          ) : null}

          <div className={hasDescription ? "mt-12" : "mt-8"}>
            <Link
              href={buttonHref}
              onClick={(event) => {
                if (editMode) {
                  event.preventDefault();
                }
              }}
              className="interactive inline-grid grid-flow-col auto-cols-max items-center gap-4 border border-white/20 px-6 py-4 text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              <Typography
                preset="sans-body"
                size="label"
                weight="medium"
                wrapPolicy="label"
                className="text-inherit"
              >
                {buttonLabel}
              </Typography>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
