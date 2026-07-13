import type { ComponentConfig } from "@puckeditor/core";

import BreakdownHeadline from "../../components/breakdowns/BreakdownHeadline";
import { castSelectValue } from "./shared";

const VARIANT_VALUES = ["chapter", "section"] as const;

export const render: ComponentConfig["render"] = ({ indexLabel, title, variant }) => (
  <BreakdownHeadline
    indexLabel={indexLabel}
    title={title}
    variant={castSelectValue(variant, VARIANT_VALUES, "section")}
  />
);
