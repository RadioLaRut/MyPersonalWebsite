import type { ComponentConfig } from "@puckeditor/core";

import TextParagraphBlock from "../../components/common/TextParagraphBlock";

export const render: ComponentConfig["render"] = ({ text }) => (
  <TextParagraphBlock text={text} />
);
