import type { ComponentConfig } from "@puckeditor/core";

import ThreeColumnSection from "../../components/editorial/ThreeColumnSection";
import { castTypographyAlignment } from "../../lib/typography-alignment";
import {
  ALLOW_METADATA_LIST_ITEM,
  castImageFitMode,
  castImagePreset,
  castSelectValue,
  pickEntryField,
  readSlot,
} from "./shared";

const RHYTHM_VALUES = ["aligned", "staggered"] as const;
const VARIANT_VALUES = ["triptych", "phase", "evidence"] as const;

function readColumn(props: Record<string, unknown>, column: 1 | 2 | 3) {
  return {
    body: props[`col${column}Body`] as string,
    bodyAlign: castTypographyAlignment(props[`col${column}BodyAlign`]),
    fitMode: castImageFitMode(props[`col${column}MediaFitMode`]),
    label: props[`col${column}Label`] as string,
    mediaSrc: props[`col${column}MediaSrc`] as string,
    preset: castImagePreset(props[`col${column}MediaPreset`]),
    subtitle: props[`col${column}Subtitle`] as string,
    title: props[`col${column}Title`] as string,
  };
}

export const render: ComponentConfig["render"] = (props) => {
  const { items: col1Items, SlotComponent: Col1Slot } = readSlot(
    props.col1Items,
    (item) => ({
      label: pickEntryField(item, "label") ?? "",
      value: pickEntryField(item, "value") ?? "",
    }),
  );
  const { items: col2Items, SlotComponent: Col2Slot } = readSlot(
    props.col2Items,
    (item) => ({
      label: pickEntryField(item, "label") ?? "",
      value: pickEntryField(item, "value") ?? "",
    }),
  );

  return (
    <ThreeColumnSection
      col1={{
        ...readColumn(props, 1),
        items: col1Items,
        itemsContent: Col1Slot ? (
          <Col1Slot
            allow={ALLOW_METADATA_LIST_ITEM}
            className="space-y-3"
            minEmptyHeight={20}
          />
        ) : undefined,
      }}
      col2={{
        ...readColumn(props, 2),
        items: col2Items,
        itemsContent: Col2Slot ? (
          <Col2Slot
            allow={ALLOW_METADATA_LIST_ITEM}
            className="space-y-3"
            minEmptyHeight={20}
          />
        ) : undefined,
      }}
      col3={readColumn(props, 3)}
      rhythm={castSelectValue(props.rhythm, RHYTHM_VALUES, "aligned")}
      publicMediaHint={props.publicMediaHint}
      variant={castSelectValue(props.variant, VARIANT_VALUES, "triptych")}
    />
  );
};
