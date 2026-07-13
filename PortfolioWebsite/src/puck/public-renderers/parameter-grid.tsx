import type { ComponentConfig } from "@puckeditor/core";
import type { ComponentProps } from "react";

import ParameterGrid from "../../components/breakdowns/ParameterGrid";
import {
  castImageFitMode,
  castImagePreset,
  castSelectValue,
  coerceLegacyBooleanSelectValue,
} from "./shared";

const BOOLEAN_VALUES = [false, true] as const;
type Parameters = ComponentProps<typeof ParameterGrid>["parameters"];

export const render: ComponentConfig["render"] = ({
  imageFitMode,
  imagePreset,
  isVideo,
  mediaSrc,
  parameters,
}) => (
  <ParameterGrid
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    isVideo={castSelectValue(coerceLegacyBooleanSelectValue(isVideo), BOOLEAN_VALUES, false)}
    mediaSrc={mediaSrc}
    parameters={parameters as Parameters}
  />
);
