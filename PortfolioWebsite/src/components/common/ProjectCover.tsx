import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

interface ProjectCoverProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
}

export function ProjectCover({
  src,
  alt,
  priority = false,
  className = "",
  preset = "ratio-21-9",
  fitMode = "x",
}: ProjectCoverProps) {
  return (
    <PresetImage
      src={src}
      alt={alt}
      priority={priority}
      preset={preset}
      fitMode={fitMode}
      frameClassName={className}
    />
  );
}
