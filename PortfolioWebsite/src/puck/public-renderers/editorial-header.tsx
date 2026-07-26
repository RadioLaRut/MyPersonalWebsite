import type { ComponentConfig } from "@puckeditor/core";

import EditorialHeader from "../../components/editorial/EditorialHeader";
import { toSafePuckHref } from "../../lib/puck-href";
import { castSelectValue } from "./shared";

const VARIANT_VALUES = ["index", "collection"] as const;

export const render: ComponentConfig["render"] = ({
  backHref,
  ctaHref,
  ctaLabel,
  description,
  descriptionLine1,
  descriptionLine2,
  editMode,
  number,
  subtitle,
  title,
  variant,
}) => (
  <EditorialHeader
    backHref={toSafePuckHref(backHref)}
    ctaHref={toSafePuckHref(ctaHref)}
    ctaLabel={ctaLabel}
    description={description}
    descriptionLine1={descriptionLine1}
    descriptionLine2={descriptionLine2}
    editMode={editMode}
    number={number}
    subtitle={subtitle}
    title={title}
    variant={castSelectValue(variant, VARIANT_VALUES, "index")}
  />
);
