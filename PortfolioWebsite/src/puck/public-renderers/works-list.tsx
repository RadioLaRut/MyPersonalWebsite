import type { ComponentConfig } from "@puckeditor/core";

import WorksList from "../../components/works/WorksList";
import { normalizeImageSrc } from "../../lib/public-paths";
import { toSafePuckHref } from "../../lib/puck-href";
import {
  ALLOW_WORKS_LIST_ENTRY,
  castImageFitMode,
  castImagePreset,
  pickEntryField,
  readSlot,
} from "./shared";

export const render: ComponentConfig["render"] = ({ editMode, entries, heading, indexSummary }) => {
  const { items: works = [], SlotComponent: EntriesSlot } = readSlot(
    entries,
    (entry) => ({
      aliases: pickEntryField<{ slug: string }[]>(entry, "aliases") ?? [],
      category: pickEntryField<string>(entry, "category") ?? "",
      desc: pickEntryField<string>(entry, "desc") ?? "",
      href: toSafePuckHref(pickEntryField(entry, "href")),
      id: pickEntryField<string>(entry, "id") ?? "",
      imageFitMode: castImageFitMode(pickEntryField(entry, "imageFitMode") ?? "x"),
      imagePreset: castImagePreset(pickEntryField(entry, "imagePreset") ?? "ratio-21-9"),
      imageSrc: normalizeImageSrc(pickEntryField(entry, "imageSrc")),
      number: pickEntryField<string>(entry, "number"),
      title: pickEntryField<string>(entry, "title") ?? "",
    }),
  );

  return (
    <WorksList
      entriesContent={EntriesSlot ? (
        <EntriesSlot
          allow={ALLOW_WORKS_LIST_ENTRY}
          className="flex flex-col w-full"
          minEmptyHeight={48}
        />
      ) : undefined}
      heading={heading}
      indexSummary={indexSummary}
      editMode={editMode}
      works={works}
    />
  );
};
