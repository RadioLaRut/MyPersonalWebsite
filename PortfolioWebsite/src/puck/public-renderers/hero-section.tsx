import type { ComponentConfig } from "@puckeditor/core";

import HeroSection from "../../components/home/HeroSection";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  description,
  editMode,
  eyebrow,
  imageAlt,
  imageFitMode,
  imagePreset,
  imageSrc,
  mobileImageFocalX,
  mobileImageFocalY,
  positioning,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  subtitle,
  title,
}) => (
  <HeroSection
    description={description}
    editMode={editMode}
    eyebrow={eyebrow}
    imageAlt={imageAlt}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    imageSrc={imageSrc}
    mobileImageFocalX={mobileImageFocalX}
    mobileImageFocalY={mobileImageFocalY}
    positioning={positioning}
    primaryCtaHref={toSafePuckHref(primaryCtaHref)}
    primaryCtaLabel={primaryCtaLabel}
    secondaryCtaHref={toSafePuckHref(secondaryCtaHref)}
    secondaryCtaLabel={secondaryCtaLabel}
    subtitle={subtitle}
    title={title}
  />
);
