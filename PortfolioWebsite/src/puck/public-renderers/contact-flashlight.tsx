import type { ComponentConfig } from "@puckeditor/core";

import ContactFlashlightBlock from "../../components/blocks/ContactFlashlightBlock";
import {
  ALLOW_METADATA_LIST_ITEM,
  pickEntryField,
  readSlot,
} from "./shared";

export const render: ComponentConfig["render"] = ({
  anchorId,
  clientsHeading,
  contactHeading,
  copyErrorMessage,
  copyLabel,
  copySuccessMessage,
  creativeDirection,
  darkTextColor,
  editMode,
  emailHeading,
  email,
  experienceHistory,
  employmentHeading,
  lightTextColor,
  maskRadius,
  maskSmoothness,
  name,
  taglineSub,
  taglineText,
  wechat,
}) => {
  const { items: experienceItems, SlotComponent: ExperienceSlot } = readSlot(
    experienceHistory,
    (entry) => ({
      company: pickEntryField(entry, "company", "label") ?? "",
      role: pickEntryField(entry, "role", "value") ?? "",
    }),
  );
  const { items: creativeItems, SlotComponent: CreativeSlot } = readSlot(
    creativeDirection,
    (entry) => ({
      subtitle: pickEntryField(entry, "subtitle", "value") ?? "",
      title: pickEntryField(entry, "title", "label") ?? "",
    }),
  );

  return (
    <ContactFlashlightBlock
      anchorId={anchorId}
      clientsHeading={clientsHeading}
      contactHeading={contactHeading}
      copyErrorMessage={copyErrorMessage}
      copyLabel={copyLabel}
      copySuccessMessage={copySuccessMessage}
      creativeContent={CreativeSlot ? (
        <CreativeSlot
          allow={ALLOW_METADATA_LIST_ITEM}
          className="space-y-6"
          minEmptyHeight={20}
        />
      ) : undefined}
      creativeDirection={creativeItems}
      darkTextColor={darkTextColor}
      editMode={editMode}
      emailHeading={emailHeading}
      email={email}
      experienceContent={ExperienceSlot ? (
        <ExperienceSlot
          allow={ALLOW_METADATA_LIST_ITEM}
          className="space-y-6"
          minEmptyHeight={20}
        />
      ) : undefined}
      experienceHistory={experienceItems}
      employmentHeading={employmentHeading}
      lightTextColor={lightTextColor}
      maskRadius={maskRadius}
      maskSmoothness={maskSmoothness}
      name={name}
      taglineSub={taglineSub}
      taglineText={taglineText}
      wechat={wechat}
    />
  );
};
