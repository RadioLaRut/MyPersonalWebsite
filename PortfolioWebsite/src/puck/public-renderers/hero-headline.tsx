import type { ComponentConfig } from "@puckeditor/core";

import HeroHeadlineBlock from "../../components/common/HeroHeadlineBlock";
import { toSafePuckHref } from "../../lib/puck-href";
import { castImageFitMode, castImagePreset } from "./shared";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({
  eyebrow,
  editMode,
  heroImage,
  heroImageFitMode,
  heroImagePreset,
  navLink,
  navLinkLabel,
  subtitle,
  subtitleAlign,
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
    subtitle={subtitle}
    subtitleAlign={castTypographyAlignment(subtitleAlign)}
    title={title}
  />
);
