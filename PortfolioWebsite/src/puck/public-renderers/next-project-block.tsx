import type { ComponentConfig } from "@puckeditor/core";

import NextProjectBlock from "../../components/blocks/NextProjectBlock";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({ href, nextBg, nextId, nextName }) => (
  <NextProjectBlock
    href={toSafePuckHref(href)}
    nextBg={nextBg}
    nextId={nextId}
    nextName={nextName}
  />
);
