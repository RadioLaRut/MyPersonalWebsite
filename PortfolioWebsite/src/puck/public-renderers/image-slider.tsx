import type { ComponentConfig } from "@puckeditor/core";

import ImageSlider from "../../components/breakdowns/ImageSlider";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  alt,
  imageFitMode,
  imagePreset,
  initialPosition,
  leftLabel,
  litSrc,
  rightLabel,
  title,
  unlitSrc,
}) => (
  <ImageSlider
    alt={alt}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    initialPosition={typeof initialPosition === "number" ? initialPosition : 50}
    leftLabel={leftLabel}
    litSrc={litSrc}
    rightLabel={rightLabel}
    title={title}
    unlitSrc={unlitSrc}
  />
);
