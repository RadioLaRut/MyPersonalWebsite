import type { ComponentConfig } from "@puckeditor/core";

import MetadataListItem from "../../components/common/MetadataListItem";

export const render: ComponentConfig["render"] = ({ label, value }) => (
  <MetadataListItem label={label} value={value} />
);
