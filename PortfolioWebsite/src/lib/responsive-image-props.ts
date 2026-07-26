import type { CSSProperties, ImgHTMLAttributes } from "react";

const DEVICE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;
const AUXILIARY_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384] as const;
const ALL_IMAGE_WIDTHS = [...AUXILIARY_WIDTHS, ...DEVICE_WIDTHS]
  .sort((left, right) => left - right);

export type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> & {
  src: string;
  srcSet?: string;
};

function resolveCandidateWidths(sizes: string) {
  const viewportPercentages = [...sizes.matchAll(/(\d+(?:\.\d+)?)vw/gu)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);
  if (viewportPercentages.length === 0) return [...DEVICE_WIDTHS];

  const smallestRatio = Math.min(...viewportPercentages) / 100;
  const minimumWidth = DEVICE_WIDTHS[0] * smallestRatio;
  return ALL_IMAGE_WIDTHS.filter((width) => width >= minimumWidth);
}

function createOptimizerUrl(src: string, width: number, quality: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export function createResponsiveImageProps({
  alt,
  className,
  draggable,
  fetchPriority,
  height,
  loading,
  quality = 75,
  sizes,
  src,
  style,
  unoptimized = false,
  width,
}: {
  alt: string;
  className?: string;
  draggable?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  height: number;
  loading?: "eager" | "lazy";
  quality?: number;
  sizes: string;
  src: string;
  style?: CSSProperties;
  unoptimized?: boolean;
  width: number;
}): ResponsiveImageProps {
  const commonProps: Omit<ResponsiveImageProps, "src" | "srcSet"> = {
    alt,
    className,
    decoding: "async",
    draggable,
    fetchPriority,
    height,
    loading,
    sizes,
    style: {
      color: "transparent",
      ...style,
    },
    width,
  };
  if (unoptimized) {
    return { ...commonProps, src };
  }

  const candidateWidths = resolveCandidateWidths(sizes);
  const srcSet = candidateWidths
    .map((candidateWidth) =>
      `${createOptimizerUrl(src, candidateWidth, quality)} ${candidateWidth}w`)
    .join(", ");

  return {
    ...commonProps,
    src: createOptimizerUrl(
      src,
      candidateWidths[candidateWidths.length - 1],
      quality,
    ),
    srcSet,
  };
}
