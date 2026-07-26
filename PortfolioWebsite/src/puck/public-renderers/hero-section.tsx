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
  publicMediaHint,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  subtitle,
  title,
  variant,
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
    publicMediaHint={publicMediaHint}
    primaryCtaHref={toSafePuckHref(primaryCtaHref)}
    primaryCtaLabel={primaryCtaLabel}
    secondaryCtaHref={toSafePuckHref(secondaryCtaHref)}
    secondaryCtaLabel={secondaryCtaLabel}
    subtitle={subtitle}
    title={title}
    variant={variant === "full" ? "full" : "poster"}
  />
);
