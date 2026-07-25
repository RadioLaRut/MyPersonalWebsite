import type { ComponentConfig } from "@puckeditor/core";

import TextParagraphBlock from "../../components/common/TextParagraphBlock";
import { castTypographyAlignment } from "../../lib/typography-alignment";

export const render: ComponentConfig["render"] = ({ align, text }) => (
  <TextParagraphBlock
    align={castTypographyAlignment(align)}
    text={text}
  />
);
