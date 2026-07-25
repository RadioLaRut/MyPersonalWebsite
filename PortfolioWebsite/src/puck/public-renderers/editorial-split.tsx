import type { ComponentConfig } from "@puckeditor/core";

import TextParagraphBlock from "../../components/common/TextParagraphBlock";
import EditorialSplit from "../../components/editorial/EditorialSplit";
import { castTypographyAlignment } from "../../lib/typography-alignment";
import {
  ALLOW_TEXT_PARAGRAPH_BLOCK,
  castImageFitMode,
  castImagePreset,
  castSelectValue,
  pickEntryField,
  readSlot,
} from "./shared";

const BODY_MODE_VALUES = ["plain", "slot"] as const;
const LAYOUT_VALUES = ["media-left", "media-right", "stack"] as const;

export const render: ComponentConfig["render"] = ({
  body,
  bodyAlign,
  bodyMode,
  heading,
  imageFitMode,
  imagePreset,
  imageSrc,
  layout,
  paragraphs,
}) => {
  const { items: paragraphItems = [], SlotComponent: ParagraphsSlot } = readSlot(
    paragraphs,
    (item) => (
      <TextParagraphBlock
        align={castTypographyAlignment(pickEntryField(item, "align"))}
        text={pickEntryField(item, "text") ?? ""}
      />
    ),
  );

  return (
    <EditorialSplit
      body={body}
      bodyAlign={castTypographyAlignment(bodyAlign)}
      bodyMode={castSelectValue(bodyMode, BODY_MODE_VALUES, "plain")}
      heading={heading}
      imageFitMode={castImageFitMode(imageFitMode)}
      imagePreset={castImagePreset(imagePreset)}
      imageSrc={imageSrc}
      layout={castSelectValue(layout, LAYOUT_VALUES, "media-right")}
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
