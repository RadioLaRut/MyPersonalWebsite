import type { ComponentConfig } from "@puckeditor/core";

import StatementBlock from "../../components/transitions/StatementBlock";
import { castSelectValue } from "./shared";

const ALIGN_VALUES = ["left", "center", "right"] as const;
const BACKGROUND_VALUES = ["black", "dark-gray"] as const;
const MIN_HEIGHT_VALUES = ["small", "medium", "large"] as const;

export const render: ComponentConfig["render"] = ({
  align,
  backgroundColor,
  content,
  editMode,
  minHeight,
}) => (
  <StatementBlock
    align={castSelectValue(align, ALIGN_VALUES, "center")}
    backgroundColor={castSelectValue(backgroundColor, BACKGROUND_VALUES, "black")}
    content={content}
    editMode={editMode}
    minHeight={castSelectValue(minHeight, MIN_HEIGHT_VALUES, "medium")}
  />
);
