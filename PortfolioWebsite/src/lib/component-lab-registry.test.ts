import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST,
  COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
} from "./component-design-manifest.ts";
import { PUCK_COMPONENT_DESCRIPTORS } from "../puck/component-manifest.ts";

const EXPECTED_AUTHOR_COMPONENTS = [
  "HeroSection",
  "HeroHeadline",
  "EditorialHeader",
  "EditorialSplit",
  "ThreeColumnSection",
  "StatementBlock",
  "RichParagraph",
  "ImagePanel",
  "BilibiliEmbed",
  "ProjectCoverLink",
  "WorksList",
  "ParameterGrid",
  "ImageSlider",
  "BreakdownHeadline",
  "NextProjectBlock",
  "HomeEndcapSection",
  "ContactFlashlight",
] as const;

test("ComponentLab manifest 只向作者展示精简后的 17 个组件", () => {
  assert.deepEqual(
    COMPONENT_DESIGN_AUTHOR_COMPONENTS,
    EXPECTED_AUTHOR_COMPONENTS,
  );
  assert.equal(COMPONENT_DESIGN_MANIFEST.length, 17);

  const publicAuthorComponents = PUCK_COMPONENT_DESCRIPTORS
    .filter((descriptor) => descriptor.labVisibility === "author")
    .map((descriptor) => descriptor.type);
  assert.deepEqual(publicAuthorComponents, EXPECTED_AUTHOR_COMPONENTS);
});

test("三个内部 Slot 只作为父组件模板节点，不拥有顶层设计作用域", () => {
  for (const hiddenType of [
    "WorksListEntry",
    "MetadataListItem",
    "TextParagraphBlock",
  ]) {
    assert.equal(
      hiddenType in COMPONENT_DESIGN_MANIFEST_BY_COMPONENT,
      false,
      hiddenType,
    );
    const descriptor = PUCK_COMPONENT_DESCRIPTORS.find(
      (candidate) => candidate.type === hiddenType,
    );
    assert.equal(descriptor?.labVisibility, "internal");
  }

  assert.ok(
    COMPONENT_DESIGN_MANIFEST_BY_COMPONENT.WorksList.variants[0].nodes.some(
      (node) => node.id === "item.title" && node.repeated,
    ),
  );
  assert.ok(
    COMPONENT_DESIGN_MANIFEST_BY_COMPONENT.EditorialSplit.variants.some(
      (variant) =>
        variant.nodes.some((node) => node.id === "body.item" && node.repeated),
    ),
  );
});

test("结构变体与 V2 计划保持固定集合", () => {
  const variants = Object.fromEntries(
    COMPONENT_DESIGN_MANIFEST.map((entry) => [
      entry.component,
      entry.variants.map((variant) => variant.id),
    ]),
  );

  assert.deepEqual(variants.HeroSection, ["poster", "full"]);
  assert.deepEqual(variants.EditorialHeader, ["index", "collection"]);
  assert.deepEqual(variants.EditorialSplit, [
    "media-left",
    "media-right",
    "stack",
  ]);
  assert.deepEqual(variants.ThreeColumnSection, ["phase", "triptych"]);
  assert.deepEqual(variants.StatementBlock, ["small", "medium", "large"]);
  assert.deepEqual(variants.ImagePanel, ["content", "large", "fullscreen"]);
  assert.deepEqual(variants.ProjectCoverLink, [
    "card",
    "immersive-left",
    "immersive-right",
  ]);
  assert.deepEqual(variants.BreakdownHeadline, ["chapter", "section"]);
});
