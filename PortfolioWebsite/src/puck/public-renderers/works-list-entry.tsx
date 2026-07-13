import type { ComponentConfig } from "@puckeditor/core";

import WorksListEntry from "../../components/works/WorksListEntry";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  aliases,
  category,
  desc,
  href,
  id,
  imageFitMode,
  imagePreset,
  imageSrc,
  number,
  title,
}) => (
  <WorksListEntry
    aliases={aliases}
    category={category}
    desc={desc}
    href={toSafePuckHref(href)}
    id={id}
    imageFitMode={castImageFitMode(imageFitMode)}
    imagePreset={castImagePreset(imagePreset)}
    imageSrc={imageSrc}
    number={number}
    title={title}
  />
);
