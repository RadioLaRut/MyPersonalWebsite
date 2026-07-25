import type { ReactNode } from "react";

import type { TypographyAlignment } from "@/components/common/Typography";
import ContentCard from "@/components/breakdowns/ContentCard";
import TextSplitLayout from "@/components/breakdowns/TextSplitLayout";
import type {
  ContentCardDesign,
  TextSplitLayoutDesign,
} from "@/lib/component-design-schema";
import type { ImageFitMode, ImagePreset } from "@/lib/image-presentation";

export type EditorialSplitProps = {
  body?: ReactNode;
  bodyAlign?: TypographyAlignment;
  bodyMode?: "plain" | "slot";
  cardDesign?: ContentCardDesign;
  heading: ReactNode;
  imageFitMode?: ImageFitMode;
  imagePreset?: ImagePreset;
  imageSrc?: string;
  layout?: "media-left" | "media-right" | "stack";
  paragraphs?: ReactNode[];
  paragraphsContent?: ReactNode;
  splitDesign?: TextSplitLayoutDesign;
};

export default function EditorialSplit({
  body,
  bodyAlign = "left",
  bodyMode = "plain",
  cardDesign,
  heading,
  imageFitMode,
  imagePreset,
  imageSrc,
  layout = "media-right",
  paragraphs = [],
  paragraphsContent,
  splitDesign,
}: EditorialSplitProps) {
  if (bodyMode === "plain" && layout !== "stack") {
    return (
      <ContentCard
        bodyAlign={bodyAlign}
        description={body}
        design={cardDesign}
        imageFitMode={imageFitMode}
        imagePosition={layout === "media-left" ? "left" : "right"}
        imagePreset={imagePreset}
        imageSrc={imageSrc}
        title={heading}
      />
    );
  }

  const layoutVariant = layout === "media-left"
    ? "split-left"
    : layout === "media-right"
      ? "split-right"
      : "stack";

  return (
    <TextSplitLayout
      bodyAlign={bodyAlign}
      design={splitDesign}
      heading={heading}
      imageFitMode={imageFitMode}
      imagePreset={imagePreset}
      imageSrc={imageSrc}
      layoutVariant={layoutVariant}
      paragraphs={bodyMode === "plain" ? [body] : paragraphs}
      paragraphsContent={bodyMode === "slot" ? paragraphsContent : undefined}
    />
  );
}
