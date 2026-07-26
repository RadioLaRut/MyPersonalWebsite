import type { ComponentConfig } from "@puckeditor/core";

import ImagePanel from "../../components/breakdowns/ImagePanel";
import { castImageFitMode, castImagePreset, castSelectValue } from "./shared";
import { castTypographyAlignment } from "../../lib/typography-alignment";

const VARIANT_VALUES = ["content", "large", "fullscreen"] as const;

export const render: ComponentConfig["render"] = ({
  alt,
  caption,
  captionAlign,
  fitMode,
  preset,
  publicMediaHint,
  src,
  variant,
}) => (
  <ImagePanel
    alt={alt}
    caption={caption}
    captionAlign={castTypographyAlignment(captionAlign)}
    fitMode={castImageFitMode(fitMode)}
    preset={castImagePreset(preset)}
    publicMediaHint={publicMediaHint}
    src={src}
    variant={castSelectValue(variant, VARIANT_VALUES, "content")}
  />
);
