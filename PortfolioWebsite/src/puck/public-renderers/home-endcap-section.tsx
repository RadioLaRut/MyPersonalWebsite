import type { ComponentConfig } from "@puckeditor/core";

import HomeEndcapSection from "../../components/home/HomeEndcapSection";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({
  buttonHref,
  buttonLabel,
  description,
  editMode,
  eyebrow,
  title,
}) => (
  <HomeEndcapSection
    buttonHref={toSafePuckHref(buttonHref) ?? "/works"}
    buttonLabel={buttonLabel}
    description={description}
    editMode={editMode}
    eyebrow={eyebrow}
    title={title}
  />
);
