import type { ComponentConfig } from "@puckeditor/core";

import StatementBlock from "../../components/transitions/StatementBlock";
import { castSelectValue } from "./shared";

const BACKGROUND_VALUES = ["black", "dark-gray"] as const;
const MIN_HEIGHT_VALUES = ["small", "medium", "large"] as const;

export const render: ComponentConfig["render"] = ({
  backgroundColor,
  content,
  editMode,
  minHeight,
}) => (
  <StatementBlock
    backgroundColor={castSelectValue(backgroundColor, BACKGROUND_VALUES, "black")}
    content={content}
    editMode={editMode}
    minHeight={castSelectValue(minHeight, MIN_HEIGHT_VALUES, "medium")}
  />
);
