import type { ComponentConfig } from "@puckeditor/core";

import RichParagraphBlock from "../../components/common/RichParagraphBlock";

export const render: ComponentConfig["render"] = ({ content }) => (
  <RichParagraphBlock content={content} />
);
