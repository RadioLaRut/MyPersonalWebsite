import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "./component-manifest";
import { render as renderBreakdownHeadline } from "./public-renderers/breakdown-headline";
import { render as renderBreakdownTriptych } from "./public-renderers/breakdown-triptych";
import { render as renderContactFlashlight } from "./public-renderers/contact-flashlight";
import { render as renderContentCard } from "./public-renderers/content-card";
import { render as renderHeroHeadline } from "./public-renderers/hero-headline";
import { render as renderHeroSection } from "./public-renderers/hero-section";
import { render as renderHighDensityInfoBlock } from "./public-renderers/high-density-info-block";
import { render as renderHomeEndcapSection } from "./public-renderers/home-endcap-section";
import { render as renderImagePanel } from "./public-renderers/image-panel";
import { render as renderImageSlider } from "./public-renderers/image-slider";
import { render as renderLightingCollectionHeader } from "./public-renderers/lighting-collection-header";
import { render as renderLightingProjectCard } from "./public-renderers/lighting-project-card";
import { render as renderMetadataListItem } from "./public-renderers/metadata-list-item";
import { render as renderNextProjectBlock } from "./public-renderers/next-project-block";
import { render as renderParameterGrid } from "./public-renderers/parameter-grid";
import { render as renderPortfolioHeroHeader } from "./public-renderers/portfolio-hero-header";
import { render as renderProjectSection } from "./public-renderers/project-section";
import { render as renderRichParagraph } from "./public-renderers/rich-paragraph";
import { render as renderStatementBlock } from "./public-renderers/statement-block";
import { render as renderTextParagraphBlock } from "./public-renderers/text-paragraph-block";
import { render as renderTextSplitLayout } from "./public-renderers/text-split-layout";
import { render as renderWorksListEntry } from "./public-renderers/works-list-entry";
import { render as renderWorksList } from "./public-renderers/works-list";

export const CANONICAL_PUCK_RENDERERS = {
  BreakdownHeadline: renderBreakdownHeadline,
  BreakdownTriptych: renderBreakdownTriptych,
  ContactFlashlight: renderContactFlashlight,
  ContentCard: renderContentCard,
  HeroHeadline: renderHeroHeadline,
  HeroSection: renderHeroSection,
  HighDensityInfoBlock: renderHighDensityInfoBlock,
  HomeEndcapSection: renderHomeEndcapSection,
  ImagePanel: renderImagePanel,
  ImageSlider: renderImageSlider,
  LightingCollectionHeader: renderLightingCollectionHeader,
  LightingProjectCard: renderLightingProjectCard,
  MetadataListItem: renderMetadataListItem,
  NextProjectBlock: renderNextProjectBlock,
  ParameterGrid: renderParameterGrid,
  PortfolioHeroHeader: renderPortfolioHeroHeader,
  ProjectSection: renderProjectSection,
  RichParagraph: renderRichParagraph,
  StatementBlock: renderStatementBlock,
  TextParagraphBlock: renderTextParagraphBlock,
  TextSplitLayout: renderTextSplitLayout,
  WorksList: renderWorksList,
  WorksListEntry: renderWorksListEntry,
} satisfies Record<PuckComponentType, ComponentConfig["render"]>;
