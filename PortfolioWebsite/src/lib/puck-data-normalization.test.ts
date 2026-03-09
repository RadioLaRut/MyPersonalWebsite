import assert from "node:assert/strict";
import test from "node:test";

import { normalizePuckData } from "./puck-data-normalization.ts";

test("normalizePuckData canonicalizes Heroheadline and hydrates hero defaults", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "Heroheadline",
        props: {
          id: "hero-1",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const hero = normalized.content[0];
  assert.equal(hero.type, "HeroHeadline");
  assert.equal(hero.props.title, "PROJECT TITLE");
  assert.equal(hero.props.heroImage, "/images/train-station/2Day.webp");
});

test("normalizePuckData migrates LightingCollectionItem lit to src", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "LightingCollectionItem",
        props: {
          id: "collection-1",
          lit: "/images/city-2026/001.webp",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const item = normalized.content[0];
  assert.equal(item.props.src, "/images/city-2026/001.webp");
  assert.equal(item.props.caption, "IMAGE");
});

test("normalizePuckData hydrates blank HeroHeadline props", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "HeroHeadline",
        props: {
          id: "hero-1",
          eyebrow: "",
          title: "",
          subtitle: "",
          heroImage: "",
          navLink: "",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const header = normalized.content[0];
  assert.equal(header.props.title, "PROJECT TITLE");
  assert.equal(header.props.heroImage, "/images/train-station/2Day.webp");
});

test("normalizePuckData migrates ImageSlider left/right image aliases", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "ImageSlider",
        props: {
          id: "slider-1",
          leftImage: "/images/train-station/2NoLight.webp",
          rightImage: "/images/train-station/2Day.webp",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const slider = normalized.content[0];
  assert.equal(slider.props.unlitSrc, "/images/train-station/2NoLight.webp");
  assert.equal(slider.props.litSrc, "/images/train-station/2Day.webp");
});
