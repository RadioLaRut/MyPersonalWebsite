import assert from "node:assert/strict";
import test from "node:test";

import { COMPONENT_DESIGN_COMPONENT_KEYS } from "./component-design-schema.ts";

test("component design scope covers all intended visual components and excludes atomic slot items", () => {
  assert.deepEqual(COMPONENT_DESIGN_COMPONENT_KEYS, [
    "HeroSection",
    "HeroHeadline",
    "PortfolioHeroHeader",
    "LightingCollectionHeader",
    "LightingProjectCard",
    "StatementBlock",
    "RichParagraph",
    "ContentCard",
    "TextSplitLayout",
    "HighDensityInfoBlock",
    "ImagePanel",
    "ImageSlider",
    "BreakdownHeadline",
    "BreakdownTriptych",
    "ParameterGrid",
    "ProjectSection",
    "WorksList",
    "WorksListEntry",
    "HomeEndcapSection",
    "NextProjectBlock",
    "ContactFlashlight",
  ]);

  assert.equal(COMPONENT_DESIGN_COMPONENT_KEYS.includes("MetadataListItem" as never), false);
  assert.equal(COMPONENT_DESIGN_COMPONENT_KEYS.includes("TextParagraphBlock" as never), false);
});
