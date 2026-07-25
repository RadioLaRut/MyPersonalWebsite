import type { ComponentConfig } from "@puckeditor/core";

import RichParagraphBlock from "../../components/common/RichParagraphBlock";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({ align, content }) => (
  <RichParagraphBlock
    align={castTypographyAlignment(align, "justify")}
    content={content}
  />
);
