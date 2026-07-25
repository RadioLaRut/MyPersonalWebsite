import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const source = fs.readFileSync(
  path.resolve(process.cwd(), "component-inventory.html"),
  "utf8",
);

test("组件总览编号覆盖 17 个作者组件", () => {
  assert.equal(
    [...source.matchAll(/<article class="component-row">/g)].length,
    17,
  );
  for (const component of [
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
  ]) {
    assert.match(source, new RegExp(`<h3>${component}</h3>`), component);
  }
});

test("组件总览只使用纯色结构块且不请求 B 站", () => {
  assert.doesNotMatch(source, /<iframe\b/i);
  assert.doesNotMatch(source, /https?:\/\//i);
  assert.doesNotMatch(source, /(?:repeating-)?(?:linear|radial)-gradient/i);
  assert.match(source, /frame-src 'none'/);
  assert.match(source, /本总览不发起网络请求/);
});

test("组件总览提供合并枚举、可选媒体和四种文本对齐试选", () => {
  for (const controlId of [
    "header-variant",
    "split-layout",
    "split-body",
    "split-media",
    "columns-variant",
    "columns-rhythm",
    "columns-media",
    "cover-variant",
    "cover-media",
    "alignment-select",
  ]) {
    assert.match(source, new RegExp(`id="${controlId}"`), controlId);
  }
  assert.match(source, /两端对齐（含末行）/);
  assert.match(source, /textAlignLast/);
});
