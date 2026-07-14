import type { ComponentConfig } from "@puckeditor/core";

import LightingCollectionHeader from "../../components/works/LightingCollectionHeader";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({ backHref, description, editMode, number, title }) => (
  <LightingCollectionHeader
    backHref={toSafePuckHref(backHref)}
    description={description}
    editMode={editMode}
    number={number}
    title={title}
  />
);
