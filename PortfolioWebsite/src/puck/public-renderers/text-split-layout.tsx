import type { ComponentConfig } from "@puckeditor/core";

import TextSplitLayout from "../../components/breakdowns/TextSplitLayout";
import {
  ALLOW_TEXT_PARAGRAPH_BLOCK,
  castImageFitMode,
  castImagePreset,
  castSelectValue,
  pickEntryField,
  readSlot,
} from "./shared";

const LAYOUT_VALUES = ["split-left", "split-right", "stack"] as const;

export const render: ComponentConfig["render"] = ({
  heading,
  imageFitMode,
  imagePreset,
  imageSrc,
  layoutVariant,
  paragraphs,
}) => {
  const { items: paragraphItems = [], SlotComponent: ParagraphsSlot } = readSlot(
    paragraphs,
    (item) => pickEntryField(item, "text") ?? "",
  );

  return (
    <TextSplitLayout
      heading={heading}
      imageFitMode={castImageFitMode(imageFitMode)}
      imagePreset={castImagePreset(imagePreset)}
      imageSrc={imageSrc}
      layoutVariant={castSelectValue(layoutVariant, LAYOUT_VALUES, "split-left")}
      paragraphs={paragraphItems}
      paragraphsContent={ParagraphsSlot ? (
        <ParagraphsSlot
          allow={ALLOW_TEXT_PARAGRAPH_BLOCK}
          className="space-y-6"
          minEmptyHeight={24}
        />
      ) : undefined}
    />
  );
};
