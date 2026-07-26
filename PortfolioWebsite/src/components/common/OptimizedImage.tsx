import Image from "next/image";
import type { ComponentProps } from "react";

import { normalizeImageSrc } from "@/lib/public-paths";

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, "src" | "alt" | "quality" | "preload"> {
  src: string;
  alt: string;
  preload?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  preload = false,
  quality = 95,
  unoptimized,
  className,
  ...props
}: OptimizedImageProps) {
  const normalizedSrc = normalizeImageSrc(src);
  const shouldSkipOptimization = unoptimized ?? normalizedSrc.toLowerCase().endsWith(".svg");

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      preload={preload}
      quality={quality}
      unoptimized={shouldSkipOptimization}
      className={className}
      {...props}
    />
  );
}
