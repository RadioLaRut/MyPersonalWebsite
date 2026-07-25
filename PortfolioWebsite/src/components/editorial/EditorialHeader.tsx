import type { ReactNode } from "react";

import type { TypographyAlignment } from "@/components/common/Typography";
import LightingCollectionHeader from "@/components/works/LightingCollectionHeader";
import PortfolioHeroHeader from "@/components/works/PortfolioHeroHeader";
import type {
  LightingCollectionHeaderDesign,
  PortfolioHeroHeaderDesign,
} from "@/lib/component-design-schema";

export type EditorialHeaderProps = {
  backHref?: string;
  collectionDesign?: LightingCollectionHeaderDesign;
  ctaHref?: string;
  ctaLabel?: ReactNode;
  description?: ReactNode;
  descriptionAlign?: TypographyAlignment;
  descriptionLine1?: ReactNode;
  descriptionLine2?: ReactNode;
  editMode?: boolean;
  indexDesign?: PortfolioHeroHeaderDesign;
  number?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  variant?: "collection" | "index";
};

export default function EditorialHeader({
  backHref,
  collectionDesign,
  ctaHref,
  ctaLabel,
  description,
  descriptionAlign,
  descriptionLine1,
  descriptionLine2,
  editMode = false,
  indexDesign,
  number = "",
  subtitle,
  title,
  variant = "index",
}: EditorialHeaderProps) {
  if (variant === "collection") {
    return (
      <LightingCollectionHeader
        backHref={backHref}
        description={description}
        descriptionAlign={descriptionAlign ?? "right"}
        design={collectionDesign}
        editMode={editMode}
        number={number}
        title={title}
      />
    );
  }

  return (
    <PortfolioHeroHeader
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      descriptionAlign={descriptionAlign ?? "left"}
      descriptionLine1={descriptionLine1}
      descriptionLine2={descriptionLine2}
      design={indexDesign}
      editMode={editMode}
      subtitle={subtitle}
      title={title}
    />
  );
}
