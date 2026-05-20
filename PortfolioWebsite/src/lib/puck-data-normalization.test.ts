import assert from "node:assert/strict";
import test from "node:test";

import { PUCK_COMPONENT_TYPES } from "../puck/component-manifest.ts";
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

  const hero = normalized.content[0] as { props: Record<string, unknown>; type: string };
  assert.equal(hero.type, "HeroHeadline");
  assert.equal(hero.props.title, "PROJECT TITLE");
  assert.equal(hero.props.heroImage, "/images/train-station/2Day.webp");
});

test("normalizePuckData migrates LightingCollectionItem to ImagePanel.large", () => {
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

  const item = normalized.content[0] as { props: Record<string, unknown>; type: string };
  assert.equal(item.type, "ImagePanel");
  assert.equal(item.props.src, "/images/city-2026/001.webp");
  assert.equal(item.props.caption, "IMAGE");
  assert.equal(item.props.variant, "large");
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

  const header = normalized.content[0] as { props: Record<string, unknown> };
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

  const slider = normalized.content[0] as { props: Record<string, unknown> };
  assert.equal(slider.props.unlitSrc, "/images/train-station/2NoLight.webp");
  assert.equal(slider.props.litSrc, "/images/train-station/2Day.webp");
});

test("normalizePuckData creates stable component ids for legacy nodes", () => {
  const legacyData = {
    content: [
      {
        type: "ImagePanel",
        props: {
          src: "/images/train-station/2Day.webp",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  };

  const first = normalizePuckData(legacyData);
  const second = normalizePuckData(legacyData);
  const firstItem = first.content[0] as { props: Record<string, unknown> };
  const secondItem = second.content[0] as { props: Record<string, unknown> };

  assert.equal(typeof firstItem.props.id, "string");
  assert.equal(firstItem.props.id, "ImagePanel-e8yjd");
  assert.equal(firstItem.props.id, secondItem.props.id);
});

test("normalizePuckData creates props and stable ids for known component nodes without legacy props", () => {
  const legacyData = {
    content: PUCK_COMPONENT_TYPES.map((type) => ({ type })),
    root: {
      props: {
        title: "Demo",
      },
    },
  };

  const first = normalizePuckData(legacyData);
  const second = normalizePuckData(legacyData);

  const firstIds = first.content.map((node, index) => {
    const item = node as { props?: Record<string, unknown>; type: string };
    assert.equal(item.type, PUCK_COMPONENT_TYPES[index]);
    assert.equal(typeof item.props?.id, "string");
    assert.notEqual((item.props?.id as string).trim(), "");
    return item.props?.id;
  });
  const secondIds = second.content.map((node) => {
    const item = node as { props?: Record<string, unknown> };
    return item.props?.id;
  });

  assert.deepEqual(firstIds, secondIds);
});
