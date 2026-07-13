import type { ReactNode } from "react";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { MotionLink } from "@/components/motion/MotionLink";
import {
  getGridColumnClassName,
  getSpacingRem,
} from "@/lib/component-design-style";
import { isExternalWebHref } from "@/lib/puck-href";

type HomeEndcapSectionProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  buttonLabel: ReactNode;
  buttonHref: string;
  editMode?: boolean;
} & ComponentDesignOverride<"HomeEndcapSection">;

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
  design,
}: HomeEndcapSectionProps) {
  const resolvedDesign = resolveComponentDesign("HomeEndcapSection", design);
  const hasDescription = !isContentEmpty(description);
  const buttonTopSpacing = getSpacingRem(
    hasDescription ? resolvedDesign.buttonTopSpacing : "32",
  );
  const opensInNewTab = !editMode && isExternalWebHref(buttonHref);

  return (
    <section className="relative isolate grid min-h-[54svh] w-full items-center overflow-hidden border-t border-white/10 bg-black rhythm-section-spacious md:min-h-[60vh] lg:min-h-[68vh]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="grid-container relative z-10">
        <div className={`${getGridColumnClassName(resolvedDesign.contentBounds)} text-center`}>
          {eyebrow ? (
            <Typography
              as="p"
              preset="sans-body"
              size="caption"
              weight="semantic"
              wrapPolicy="label"
              align="center"
              className="text-white/35"
            >
              {eyebrow}
            </Typography>
          ) : null}

          <Typography
            as="h2"
            preset="luna-editorial"
            size={resolvedDesign.titleSize}
            weight="semantic"
            wrapPolicy="heading"
            align="center"
            className="mt-6 text-white uppercase"
          >
            {title}
          </Typography>

          {hasDescription ? (
            <Typography
              as="p"
              preset="sans-body"
              size="body"
              weight="medium"
              wrapPolicy="prose"
              align="center"
              className="mx-auto w-full max-w-3xl text-white/55 uppercase"
              style={{ marginTop: getSpacingRem(resolvedDesign.descriptionTopSpacing) }}
            >
              {description}
            </Typography>
          ) : null}

          <div style={{ marginTop: buttonTopSpacing }}>
            <MotionLink
              href={buttonHref}
              scroll
              disabled={editMode}
              target={opensInNewTab ? "_blank" : undefined}
              rel={opensInNewTab ? "noopener noreferrer" : undefined}
              className="interactive inline-grid grid-flow-col auto-cols-max items-center gap-4 border border-white/20 px-6 py-4 text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              <Typography
                preset="sans-body"
                size="label"
                weight="semantic"
                wrapPolicy="label"
                className="text-inherit"
              >
                {buttonLabel}
              </Typography>
            </MotionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
