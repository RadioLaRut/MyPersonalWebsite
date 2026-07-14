import type { ComponentConfig } from "@puckeditor/core";

import LightingProjectCard from "../../components/works/LightingProjectCard";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  coverImage,
  editMode,
  href,
  imageFitMode,
  imagePreset,
  number,
  title,
}) => (
  <LightingProjectCard
    coverImage={coverImage}
    editMode={editMode}
    href={toSafePuckHref(href)}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    number={number}
    title={title}
  />
);
