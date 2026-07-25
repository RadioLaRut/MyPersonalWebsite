import type { ComponentConfig } from "@puckeditor/core";

import type { PuckComponentType } from "./component-manifest";
import { render as renderBilibiliEmbed } from "./public-renderers/bilibili-embed";
import { render as renderBreakdownHeadline } from "./public-renderers/breakdown-headline";
import { render as renderContactFlashlight } from "./public-renderers/contact-flashlight";
import { render as renderEditorialHeader } from "./public-renderers/editorial-header";
import { render as renderEditorialSplit } from "./public-renderers/editorial-split";
import { render as renderHeroHeadline } from "./public-renderers/hero-headline";
import { render as renderHeroSection } from "./public-renderers/hero-section";
import { render as renderHomeEndcapSection } from "./public-renderers/home-endcap-section";
import { render as renderImagePanel } from "./public-renderers/image-panel";
import { render as renderImageSlider } from "./public-renderers/image-slider";
import { render as renderMetadataListItem } from "./public-renderers/metadata-list-item";
import { render as renderNextProjectBlock } from "./public-renderers/next-project-block";
import { render as renderParameterGrid } from "./public-renderers/parameter-grid";
import { render as renderProjectCoverLink } from "./public-renderers/project-cover-link";
import { render as renderRichParagraph } from "./public-renderers/rich-paragraph";
import { render as renderStatementBlock } from "./public-renderers/statement-block";
import { render as renderTextParagraphBlock } from "./public-renderers/text-paragraph-block";
import { render as renderThreeColumnSection } from "./public-renderers/three-column-section";
import { render as renderWorksListEntry } from "./public-renderers/works-list-entry";
import { render as renderWorksList } from "./public-renderers/works-list";

export const CANONICAL_PUCK_RENDERERS = {
  BilibiliEmbed: renderBilibiliEmbed,
  BreakdownHeadline: renderBreakdownHeadline,
  ContactFlashlight: renderContactFlashlight,
  EditorialHeader: renderEditorialHeader,
  EditorialSplit: renderEditorialSplit,
  HeroHeadline: renderHeroHeadline,
  HeroSection: renderHeroSection,
  HomeEndcapSection: renderHomeEndcapSection,
  ImagePanel: renderImagePanel,
  ImageSlider: renderImageSlider,
  MetadataListItem: renderMetadataListItem,
  NextProjectBlock: renderNextProjectBlock,
  ParameterGrid: renderParameterGrid,
  ProjectCoverLink: renderProjectCoverLink,
  RichParagraph: renderRichParagraph,
  StatementBlock: renderStatementBlock,
  TextParagraphBlock: renderTextParagraphBlock,
  ThreeColumnSection: renderThreeColumnSection,
  WorksList: renderWorksList,
  WorksListEntry: renderWorksListEntry,
} satisfies Record<PuckComponentType, ComponentConfig["render"]>;
