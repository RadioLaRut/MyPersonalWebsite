import type { ComponentConfig } from "@puckeditor/core";

import BilibiliEmbed from "../../components/media/BilibiliEmbed";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({
  caption,
  captionAlign,
  editMode,
  source,
  title,
}) => (
  <BilibiliEmbed
    caption={caption}
    captionAlign={castTypographyAlignment(captionAlign)}
    editMode={editMode}
    source={source}
    title={title}
  />
);
