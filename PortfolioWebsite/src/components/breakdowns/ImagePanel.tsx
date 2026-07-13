import { PresetImage } from "@/components/common/PresetImage";
import Typography from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
  getSectionSpacingClassName,
} from "@/lib/component-design-style";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export type ImagePanelProps = {
  src: string;
  alt?: string;
  caption?: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  variant?: "content" | "large" | "fullscreen";
} & ComponentDesignOverride<"ImagePanel">;

export default function ImagePanel({
  src,
  alt,
  caption,
  preset,
  fitMode,
  variant = "content",
  design,
}: ImagePanelProps) {
  const resolvedDesign = resolveComponentDesign("ImagePanel", design);
  if (!src) return null;

  const imageAlt = alt || caption || "Image";

  if (variant === "fullscreen") {
    return (
      <div className="relative h-full min-h-[100svh] w-full bg-black">
        <div className="absolute inset-0">
          <PresetImage
            src={src}
            alt={imageAlt}
            preset={preset}
            fitMode={fitMode}
            fitModeByBreakpoint={{
              base: preset === "native" ? "x" : "cover",
              lg: fitMode ?? "x",
            }}
            priority
            sizes="100vw"
            lockFrame={false}
            frameClassName="h-full w-full pointer-events-none"
          />
        </div>
        {caption ? (
          <div className="absolute bottom-5 right-5 bg-black/65 border border-white/15 px-4 py-2 md:bottom-8 md:right-8">
            <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="label" className="text-textPrimary">
              {caption}
            </Typography>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <section className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
        <div className="grid-container">
          <figure className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
            { leftCol: 1, rightCol: 12 },
            { leftCol: 2, rightCol: 11 },
            resolvedDesign.largeBounds,
          ))} overflow-hidden rounded-none border border-white/10 bg-white/[0.02]`}>
            <PresetImage
              alt={imageAlt}
              src={src}
              preset={preset}
              fitMode={fitMode}
              priority
              sizes="(min-width: 1024px) 84vw, 92vw"
              frameClassName="w-full"
              imageClassName="select-none"
            />
            {caption ? (
              <figcaption className="border-t border-white/10 px-5 py-4 md:px-6">
                <Typography preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textPrimary">
                  {caption}
                </Typography>
              </figcaption>
            ) : null}
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
      <div className="grid-container">
        <figure className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
          { leftCol: 1, rightCol: 12 },
          { leftCol: 2, rightCol: 11 },
          resolvedDesign.contentBounds,
        ))} mx-auto w-full max-w-5xl overflow-hidden border border-white/15 bg-white/[0.03]`}>
          <PresetImage alt={imageAlt} src={src} preset={preset} fitMode={fitMode} />
          {caption ? (
            <figcaption className="border-t border-white/15 px-4 py-3">
              <Typography preset="sans-body" size="label" weight="semantic" wrapPolicy="label" className="text-textPrimary">
                {caption}
              </Typography>
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
