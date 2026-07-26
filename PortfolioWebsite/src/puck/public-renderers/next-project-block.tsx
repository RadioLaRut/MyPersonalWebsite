import type { ComponentConfig } from "@puckeditor/core";

import NextProjectBlock from "../../components/blocks/NextProjectBlock";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({
  editMode,
  href,
  nextBg,
  nextId,
  nextName,
  publicMediaHint,
}) => (
  <NextProjectBlock
    editMode={editMode}
    href={toSafePuckHref(href)}
    nextBg={nextBg}
    nextId={nextId}
    nextName={nextName}
    publicMediaHint={publicMediaHint}
  />
);
