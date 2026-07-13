import type { ComponentConfig } from "@puckeditor/core";

import HighDensityInfoBlock from "../../components/breakdowns/HighDensityInfoBlock";
import {
  ALLOW_METADATA_LIST_ITEM,
  castImageFitMode,
  castImagePreset,
  pickEntryField,
  readSlot,
} from "./shared";

function readPhaseText(props: Record<string, unknown>, phase: 1 | 2 | 3) {
  return {
    content: props[`phase${phase}Content`] as string,
    label: props[`phase${phase}Label`] as string,
    subtitle: props[`phase${phase}Subtitle`] as string,
    title: props[`phase${phase}Title`] as string,
  };
}

export const render: ComponentConfig["render"] = (props) => {
  const { items: phase1Items, SlotComponent: Phase1Slot } = readSlot(
    props.phase1Items,
    (item) => ({
      label: pickEntryField(item, "label") ?? "",
      value: pickEntryField(item, "value") ?? "",
    }),
  );
  const { items: phase2Items, SlotComponent: Phase2Slot } = readSlot(
    props.phase2Items,
    (item) => ({
      label: pickEntryField(item, "label") ?? "",
      value: pickEntryField(item, "value") ?? "",
    }),
  );

  return (
    <HighDensityInfoBlock
      phase1={{ ...readPhaseText(props, 1), items: phase1Items }}
      phase1ItemsContent={Phase1Slot ? (
        <Phase1Slot
          allow={ALLOW_METADATA_LIST_ITEM}
          className="space-y-3"
          minEmptyHeight={20}
        />
      ) : undefined}
      phase2={{ ...readPhaseText(props, 2), items: phase2Items }}
      phase2ItemsContent={Phase2Slot ? (
        <Phase2Slot
          allow={ALLOW_METADATA_LIST_ITEM}
          className="space-y-3"
          minEmptyHeight={20}
        />
      ) : undefined}
      phase3={{
        ...readPhaseText(props, 3),
        imageFitMode: castImageFitMode(props.phase3ImageFitMode),
        imagePreset: castImagePreset(props.phase3ImagePreset),
        imageSrc: props.phase3ImageSrc as string,
      }}
    />
  );
};
