import type { ComponentConfig } from "@puckeditor/core";

import PortfolioHeroHeader from "../../components/works/PortfolioHeroHeader";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({
  ctaHref,
  ctaLabel,
  descriptionLine1,
  descriptionLine2,
  editMode,
  subtitle,
  title,
}) => (
  <PortfolioHeroHeader
    ctaHref={toSafePuckHref(ctaHref)}
    ctaLabel={ctaLabel}
    descriptionLine1={descriptionLine1}
    descriptionLine2={descriptionLine2}
    editMode={editMode}
    subtitle={subtitle}
    title={title}
  />
);
