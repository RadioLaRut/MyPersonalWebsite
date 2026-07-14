import type { ComponentConfig } from "@puckeditor/core";

import ProjectSection from "../../components/home/ProjectSection";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset, castSelectValue } from "./shared";

const ALIGN_VALUES = ["auto", "left", "right"] as const;

export const render: ComponentConfig["render"] = ({
  align,
  editMode,
  imageFitMode,
  imagePreset,
  imageSrc,
  index,
  link,
  mobileImageFocalX,
  mobileImageFocalY,
  subtitle,
  title,
}) => (
  <ProjectSection
    align={castSelectValue(align, ALIGN_VALUES, "auto")}
    editMode={editMode}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    imageSrc={imageSrc}
    index={typeof index === "number" ? index : 0}
    link={toSafePuckHref(link)}
    mobileImageFocalX={mobileImageFocalX}
    mobileImageFocalY={mobileImageFocalY}
    subtitle={subtitle}
    title={title}
  />
);
