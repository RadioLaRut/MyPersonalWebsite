import type { ComponentConfig } from "@puckeditor/core";

import NextProjectBlock from "../../components/blocks/NextProjectBlock";
import { toSafePuckHref } from "../../lib/puck-href";

export const render: ComponentConfig["render"] = ({
  editMode,
  eyebrow,
  footerLeft,
  footerRight,
  href,
  nextBg,
  nextId,
  nextName,
  publicMediaHint,
}) => (
  <NextProjectBlock
    editMode={editMode}
    eyebrow={eyebrow}
    footerLeft={footerLeft}
    footerRight={footerRight}
    href={toSafePuckHref(href)}
    nextBg={nextBg}
    nextId={nextId}
    nextName={nextName}
    publicMediaHint={publicMediaHint}
  />
);
