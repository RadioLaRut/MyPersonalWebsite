import { OptimizedImage } from "@/components/common/OptimizedImage";

interface ProjectCoverProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function ProjectCover({ src, alt, priority = false, className = "" }: ProjectCoverProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      priority={priority}
      className={`w-full h-auto object-cover ${className}`.trim()}
    />
  );
}
