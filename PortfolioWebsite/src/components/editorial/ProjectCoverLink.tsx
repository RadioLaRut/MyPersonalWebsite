import type { ReactNode } from "react";

import type { ComponentLayoutProps } from "@/components/common/ComponentLayoutNode";
import ProjectSection from "@/components/home/ProjectSection";
import LightingProjectCard from "@/components/works/LightingProjectCard";
import type {
  LightingProjectCardDesign,
  ProjectSectionDesign,
} from "@/lib/component-design-schema";
import type { ImageFitMode, ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

export type ProjectCoverLinkProps = {
  cardDesign?: LightingProjectCardDesign;
  editMode?: boolean;
  href?: string;
  imageFitMode?: ImageFitMode;
  imagePreset?: ImagePreset;
  immersiveDesign?: ProjectSectionDesign;
  mediaSrc?: string;
  mobileImageFocalX?: number;
  mobileImageFocalY?: number;
  number?: ReactNode;
  prompt?: ReactNode;
  publicMediaHint?: PublicMediaHint;
  subtitle?: ReactNode;
  title: ReactNode;
  variant?: "card" | "immersive-left" | "immersive-right";
} & ComponentLayoutProps;

export default function ProjectCoverLink({
  cardDesign,
  componentLayout,
  editMode = false,
  href,
  imageFitMode,
  imagePreset,
  immersiveDesign,
  mediaSrc,
  mobileImageFocalX = 50,
  mobileImageFocalY = 50,
  number = "",
  prompt,
  publicMediaHint,
  subtitle,
  title,
  variant = "immersive-left",
}: ProjectCoverLinkProps) {
  if (variant === "card") {
    return (
      <LightingProjectCard
        coverImage={mediaSrc}
        componentLayout={componentLayout}
        design={cardDesign}
        editMode={editMode}
        href={href}
        imageFitMode={imageFitMode}
        imagePreset={imagePreset}
        number={number}
        prompt={prompt}
        publicMediaHint={publicMediaHint}
        title={title}
      />
    );
  }

  return (
    <ProjectSection
      align={variant === "immersive-right" ? "right" : "left"}
      componentLayout={componentLayout}
      design={immersiveDesign}
      editMode={editMode}
      imageFitMode={imageFitMode}
      imagePreset={imagePreset}
      imageSrc={mediaSrc}
      link={href}
      mobileImageFocalX={mobileImageFocalX}
      mobileImageFocalY={mobileImageFocalY}
      publicMediaHint={publicMediaHint}
      subtitle={subtitle}
      title={title}
    />
  );
}
