import type { ComponentConfig } from "@puckeditor/core";

import ImageSlider from "../../components/breakdowns/ImageSlider";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  alt,
  editMode,
  imageFitMode,
  imagePreset,
  initialPosition,
  leftLabel,
  litSrc,
  publicMediaHint,
  rightLabel,
  title,
  unlitSrc,
}) => (
  <ImageSlider
    alt={alt}
    editMode={editMode}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    initialPosition={typeof initialPosition === "number" ? initialPosition : 50}
    leftLabel={leftLabel}
    litSrc={litSrc}
    publicMediaHint={publicMediaHint}
    rightLabel={rightLabel}
    title={title}
    unlitSrc={unlitSrc}
  />
);
