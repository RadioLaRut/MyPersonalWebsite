import type { ComponentConfig } from "@puckeditor/core";

import ContentCard from "../../components/breakdowns/ContentCard";
import { castImageFitMode, castImagePreset, castSelectValue } from "./shared";

const IMAGE_POSITION_VALUES = ["left", "right"] as const;

export const render: ComponentConfig["render"] = ({
  description,
  imageFitMode,
  imagePosition,
  imagePreset,
  imageSrc,
  title,
}) => (
  <ContentCard
    description={description}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePosition={castSelectValue(imagePosition, IMAGE_POSITION_VALUES, "right")}
    imagePreset={castImagePreset(imagePreset)}
    imageSrc={imageSrc}
    title={title}
  />
);
