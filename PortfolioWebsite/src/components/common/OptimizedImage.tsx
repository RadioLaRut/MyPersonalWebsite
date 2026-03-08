import Image from "next/image";
import type { ComponentProps } from "react";

import { normalizeImageSrc } from "@/lib/public-paths";

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, "src" | "alt" | "quality" | "priority"> {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
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
      priority={priority}
      quality={quality}
      unoptimized={shouldSkipOptimization}
      className={className}
      {...props}
    />
  );
}
