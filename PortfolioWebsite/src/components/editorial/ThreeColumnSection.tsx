import type { ReactNode } from "react";

import BreakdownTriptych from "@/components/breakdowns/BreakdownTriptych";
import HighDensityInfoBlock from "@/components/breakdowns/HighDensityInfoBlock";
import type { ComponentLayoutProps } from "@/components/common/ComponentLayoutNode";
import type { TypographyAlignment } from "@/components/common/Typography";
import type {
  BreakdownTriptychDesign,
  HighDensityInfoBlockDesign,
} from "@/lib/component-design-schema";
import type { ImageFitMode, ImagePreset } from "@/lib/image-presentation";
import type { PublicMediaHint } from "@/lib/media-layout";

type ColumnContent = {
  body: ReactNode;
  bodyAlign: TypographyAlignment;
  fitMode?: ImageFitMode;
  items?: { label: ReactNode; value: ReactNode }[];
  itemsContent?: ReactNode;
  label?: ReactNode;
  mediaSrc?: string;
  preset?: ImagePreset;
  subtitle?: ReactNode;
  title: ReactNode;
};

export type ThreeColumnSectionProps = {
  col1: ColumnContent;
  col2: ColumnContent;
  col3: ColumnContent;
  phaseDesign?: HighDensityInfoBlockDesign;
  rhythm?: "aligned" | "staggered";
  triptychDesign?: BreakdownTriptychDesign;
  publicMediaHint?: PublicMediaHint;
  variant?: "evidence" | "phase" | "triptych";
} & ComponentLayoutProps;

export default function ThreeColumnSection({
  col1,
  col2,
  col3,
  componentLayout,
  phaseDesign,
  rhythm = "aligned",
  triptychDesign,
  publicMediaHint,
  variant = "triptych",
}: ThreeColumnSectionProps) {
  if (variant === "triptych") {
    return (
      <BreakdownTriptych
        col1BodyAlign={col1.bodyAlign}
        componentLayout={componentLayout}
        col1FitMode={col1.fitMode}
        col1Img={col1.mediaSrc ?? ""}
        col1Preset={col1.preset}
        col1Text={col1.body}
        col1Title={col1.title}
        col2BodyAlign={col2.bodyAlign}
        col2FitMode={col2.fitMode}
        col2Img={col2.mediaSrc ?? ""}
        col2Preset={col2.preset}
        col2Text={col2.body}
        col2Title={col2.title}
        col3BodyAlign={col3.bodyAlign}
        col3FitMode={col3.fitMode}
        col3Img={col3.mediaSrc ?? ""}
        col3Preset={col3.preset}
        col3Text={col3.body}
        col3Title={col3.title}
        design={triptychDesign}
        rhythm={rhythm}
        publicMediaHint={publicMediaHint}
      />
    );
  }

  return (
    <HighDensityInfoBlock
      design={phaseDesign}
      componentLayout={componentLayout}
      phase1={{
        bodyAlign: col1.bodyAlign,
        content: col1.body,
        items: col1.items,
        label: col1.label,
        subtitle: col1.subtitle,
        title: col1.title,
      }}
      phase1ItemsContent={col1.itemsContent}
      phase2={{
        bodyAlign: col2.bodyAlign,
        content: col2.body,
        items: col2.items,
        label: col2.label,
        subtitle: col2.subtitle,
        title: col2.title,
      }}
      phase2ItemsContent={col2.itemsContent}
      phase3={{
        bodyAlign: col3.bodyAlign,
        content: col3.body,
        imageFitMode: col3.fitMode,
        imagePreset: col3.preset,
        imageSrc: col3.mediaSrc,
        label: col3.label,
        subtitle: col3.subtitle,
        title: col3.title,
      }}
      rhythm={rhythm}
      publicMediaHint={publicMediaHint}
    />
  );
}
