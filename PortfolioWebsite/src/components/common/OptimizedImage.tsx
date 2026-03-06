import Image from "next/image";
import type { ComponentProps } from "react";

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
  ...props
}: OptimizedImageProps) {
  return <Image src={src} alt={alt} priority={priority} quality={quality} {...props} />;
}
