import type { ComponentConfig } from "@puckeditor/core";

import BreakdownTriptych from "../../components/breakdowns/BreakdownTriptych";
import { castImageFitMode, castImagePreset } from "./shared";

function readColumn(props: Record<string, unknown>, column: 1 | 2 | 3) {
  return {
    fitMode: castImageFitMode(props[`col${column}FitMode`]),
    img: props[`col${column}Img`] as string,
    preset: castImagePreset(props[`col${column}Preset`]),
    text: props[`col${column}Text`] as string,
    title: props[`col${column}Title`] as string,
  };
}

export const render: ComponentConfig["render"] = (props) => {
  const col1 = readColumn(props, 1);
  const col2 = readColumn(props, 2);
  const col3 = readColumn(props, 3);

  return (
    <BreakdownTriptych
      col1FitMode={col1.fitMode}
      col1Img={col1.img}
      col1Preset={col1.preset}
      col1Text={col1.text}
      col1Title={col1.title}
      col2FitMode={col2.fitMode}
      col2Img={col2.img}
      col2Preset={col2.preset}
      col2Text={col2.text}
      col2Title={col2.title}
      col3FitMode={col3.fitMode}
      col3Img={col3.img}
      col3Preset={col3.preset}
      col3Text={col3.text}
      col3Title={col3.title}
    />
  );
};
