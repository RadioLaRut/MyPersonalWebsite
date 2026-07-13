import type { ComponentConfig } from "@puckeditor/core";

import MetadataListItem from "../../components/common/MetadataListItem";
import { castSelectValue } from "./shared";

const ALIGN_VALUES = ["start", "end"] as const;

export const render: ComponentConfig["render"] = ({ align, label, value }) => (
  <MetadataListItem
    align={castSelectValue(align, ALIGN_VALUES, "start")}
    label={label}
    value={value}
  />
);
