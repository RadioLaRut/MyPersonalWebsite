import type { ComponentConfig } from "@puckeditor/core";

import HeroSection from "../../components/home/HeroSection";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({
  description,
  descriptionAlign,
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
}) => (
  <HeroSection
    description={description}
    descriptionAlign={castTypographyAlignment(descriptionAlign)}
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
  />
);
