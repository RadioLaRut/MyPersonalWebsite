import type { ComponentConfig } from "@puckeditor/core";

import HomeEndcapSection from "../../components/home/HomeEndcapSection";
import { toSafePuckHref } from "../../lib/puck-href";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({
  buttonHref,
  buttonLabel,
  description,
  descriptionAlign,
  editMode,
  eyebrow,
  title,
}) => (
  <HomeEndcapSection
    buttonHref={toSafePuckHref(buttonHref) ?? "/works"}
    buttonLabel={buttonLabel}
    description={description}
    descriptionAlign={castTypographyAlignment(descriptionAlign, "center")}
    editMode={editMode}
    eyebrow={eyebrow}
    title={title}
  />
);
