import type { ComponentConfig } from "@puckeditor/core";

import ProjectCoverLink from "../../components/editorial/ProjectCoverLink";
import { toSafePuckHref } from "../../lib/puck-href";
import {
  castImageFitMode,
  castImagePreset,
  castSelectValue,
} from "./shared";

const ALIGN_VALUES = ["auto", "left", "right"] as const;
const VARIANT_VALUES = ["immersive", "card"] as const;

export const render: ComponentConfig["render"] = ({
  align,
  editMode,
  href,
  imageFitMode,
  imagePreset,
  index,
  mediaSrc,
  mobileImageFocalX,
  mobileImageFocalY,
  number,
  subtitle,
  title,
  variant,
}) => (
  <ProjectCoverLink
    align={castSelectValue(align, ALIGN_VALUES, "auto")}
    editMode={editMode}
    href={toSafePuckHref(href)}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    index={typeof index === "number" ? index : 0}
    mediaSrc={mediaSrc}
    mobileImageFocalX={mobileImageFocalX}
    mobileImageFocalY={mobileImageFocalY}
    number={number}
    subtitle={subtitle}
    title={title}
    variant={castSelectValue(variant, VARIANT_VALUES, "immersive")}
  />
);
