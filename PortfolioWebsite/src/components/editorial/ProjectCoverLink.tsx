import type { ReactNode } from "react";

import ProjectSection from "@/components/home/ProjectSection";
import LightingProjectCard from "@/components/works/LightingProjectCard";
import type {
  LightingProjectCardDesign,
  ProjectSectionDesign,
} from "@/lib/component-design-schema";
import type { ImageFitMode, ImagePreset } from "@/lib/image-presentation";

export type ProjectCoverLinkProps = {
  align?: "auto" | "left" | "right";
  cardDesign?: LightingProjectCardDesign;
  editMode?: boolean;
  href?: string;
  imageFitMode?: ImageFitMode;
  imagePreset?: ImagePreset;
  immersiveDesign?: ProjectSectionDesign;
  index?: number;
  mediaSrc?: string;
  mobileImageFocalX?: number;
  mobileImageFocalY?: number;
  number?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  variant?: "card" | "immersive";
};

export default function ProjectCoverLink({
  align = "auto",
  cardDesign,
  editMode = false,
  href,
  imageFitMode,
  imagePreset,
  immersiveDesign,
  index = 0,
  mediaSrc,
  mobileImageFocalX = 50,
  mobileImageFocalY = 50,
  number = "",
  subtitle,
  title,
  variant = "immersive",
}: ProjectCoverLinkProps) {
  if (variant === "card") {
    return (
      <LightingProjectCard
        coverImage={mediaSrc}
        design={cardDesign}
        editMode={editMode}
        href={href}
        imageFitMode={imageFitMode}
        imagePreset={imagePreset}
        number={number}
        title={title}
      />
    );
  }

  return (
    <ProjectSection
      align={align}
      design={immersiveDesign}
      editMode={editMode}
      imageFitMode={imageFitMode}
      imagePreset={imagePreset}
      imageSrc={mediaSrc}
      index={index}
      link={href}
      mobileImageFocalX={mobileImageFocalX}
      mobileImageFocalY={mobileImageFocalY}
      subtitle={subtitle}
      title={title}
    />
  );
}
