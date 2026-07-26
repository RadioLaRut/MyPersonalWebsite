import type { ComponentConfig } from "@puckeditor/core";

import ProjectCoverLink from "../../components/editorial/ProjectCoverLink";
import { toSafePuckHref } from "../../lib/puck-href";
import {
  castImageFitMode,
  castImagePreset,
  castSelectValue,
} from "./shared";

const VARIANT_VALUES = ["immersive-left", "immersive-right", "card"] as const;

export const render: ComponentConfig["render"] = ({
  editMode,
  href,
  imageFitMode,
  imagePreset,
  mediaSrc,
  mobileImageFocalX,
  mobileImageFocalY,
  number,
  prompt,
  publicMediaHint,
  subtitle,
  title,
  variant,
}) => (
  <ProjectCoverLink
    editMode={editMode}
    href={toSafePuckHref(href)}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    mediaSrc={mediaSrc}
    mobileImageFocalX={mobileImageFocalX}
    mobileImageFocalY={mobileImageFocalY}
    number={number}
    prompt={prompt}
    publicMediaHint={publicMediaHint}
    subtitle={subtitle}
    title={title}
    variant={castSelectValue(variant, VARIANT_VALUES, "immersive-left")}
  />
);
