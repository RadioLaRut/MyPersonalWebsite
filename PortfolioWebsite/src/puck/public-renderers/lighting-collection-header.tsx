import type { ComponentConfig } from "@puckeditor/core";

import LightingCollectionHeader from "../../components/works/LightingCollectionHeader";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({ backHref, description, number, title }) => (
  <LightingCollectionHeader
    backHref={toSafePuckHref(backHref)}
    description={description}
    number={number}
    title={title}
  />
);
