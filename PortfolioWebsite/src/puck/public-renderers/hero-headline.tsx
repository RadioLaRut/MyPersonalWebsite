import type { ComponentConfig } from "@puckeditor/core";

import HeroHeadlineBlock from "../../components/common/HeroHeadlineBlock";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";

export const render: ComponentConfig["render"] = ({
  eyebrow,
  editMode,
  heroImage,
  heroImageFitMode,
  heroImagePreset,
  navLink,
  navLinkLabel,
  publicMediaHint,
  subtitle,
  title,
}) => (
  <HeroHeadlineBlock
    eyebrow={eyebrow}
    editMode={editMode}
    heroImage={heroImage}
    heroImageFitMode={castImageFitMode(heroImageFitMode)}
    heroImagePreset={castImagePreset(heroImagePreset)}
    navLink={toSafePuckHref(navLink)}
    navLinkLabel={navLinkLabel}
    publicMediaHint={publicMediaHint}
    subtitle={subtitle}
    title={title}
  />
);
