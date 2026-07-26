import type { ComponentConfig } from "@puckeditor/core";
import type { ComponentProps } from "react";

import ParameterGrid from "../../components/breakdowns/ParameterGrid";
import {
  castImageFitMode,
  castImagePreset,
} from "./shared";

type Parameters = ComponentProps<typeof ParameterGrid>["parameters"];

export const render: ComponentConfig["render"] = ({
  imageFitMode,
  imagePreset,
  mediaSrc,
  parameters,
  publicMediaHint,
}) => (
  <ParameterGrid
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    mediaSrc={mediaSrc}
    parameters={parameters as Parameters}
    publicMediaHint={publicMediaHint}
  />
);
