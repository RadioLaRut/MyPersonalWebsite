import type { ComponentConfig } from "@puckeditor/core";

import BilibiliEmbed from "../../components/media/BilibiliEmbed";

export const render: ComponentConfig["render"] = ({
  caption,
  editMode,
  externalLinkLabel,
  source,
  title,
}) => (
  <BilibiliEmbed
    caption={caption}
    editMode={editMode}
    externalLinkLabel={externalLinkLabel}
    source={source}
    title={title}
  />
);
