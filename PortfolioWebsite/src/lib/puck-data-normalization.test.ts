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
  assert.equal(hero.props.navLinkLabel, "观看视频");
});

test("normalizePuckData preserves an explicit HeroHeadline navigation label", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "HeroHeadline",
        props: {
          id: "hero-penguin",
          title: "企鹅贸易公司",
          navLinkLabel: "下载可玩版本",
        },
      },
    ],
    root: {
      props: {
        title: "企鹅贸易公司",
      },
    },
  });

  const hero = normalized.content[0] as { props: Record<string, unknown> };
  assert.equal(hero.props.navLinkLabel, "下载可玩版本");
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

test("normalizePuckData deterministically merges all legacy top-level component pairs", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "PortfolioHeroHeader",
        props: {
          id: "header-index",
          title: "WORKS",
          descriptionLine2: "Index description",
        },
      },
      {
        type: "LightingCollectionHeader",
        props: {
          id: "header-collection",
          title: "COLLECTION",
          description: "Collection description",
          number: "02",
        },
      },
      {
        type: "ContentCard",
        props: {
          id: "split-plain",
          title: "Plain",
          description: "Plain body",
          imagePosition: "left",
        },
      },
      {
        type: "TextSplitLayout",
        props: {
          id: "split-slot",
          heading: "Slot",
          layoutVariant: "stack",
          paragraphs: ["First paragraph"],
        },
      },
      {
        type: "BreakdownTriptych",
        props: {
          id: "columns-triptych",
          col1Title: "One",
          col1Text: "Body one",
        },
      },
      {
        type: "HighDensityInfoBlock",
        props: {
          id: "columns-phase",
          phase1Title: "Context",
          phase1Content: "Context body",
          phase3ImageSrc: "/images/train-station/2Day.webp",
        },
      },
      {
        type: "ProjectSection",
        props: {
          id: "cover-immersive",
          title: "Immersive",
          link: "/works/immersive",
          imageSrc: "/images/train-station/2Day.webp",
        },
      },
      {
        type: "LightingProjectCard",
        props: {
          id: "cover-card",
          title: "Card",
          href: "/works/card",
          coverImage: "/images/train-station/2Night.webp",
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const nodes = normalized.content as Array<{
    props: Record<string, unknown>;
    type: string;
  }>;
  assert.deepEqual(nodes.map((node) => node.type), [
    "EditorialHeader",
    "EditorialHeader",
    "EditorialSplit",
    "EditorialSplit",
    "ThreeColumnSection",
    "ThreeColumnSection",
    "ProjectCoverLink",
    "ProjectCoverLink",
  ]);

  assert.equal(nodes[0].props.variant, "index");
  assert.equal(nodes[0].props.descriptionAlign, "left");
  assert.equal(nodes[1].props.variant, "collection");
  assert.equal(nodes[1].props.descriptionAlign, "right");

  assert.equal(nodes[2].props.bodyMode, "plain");
  assert.equal(nodes[2].props.layout, "media-left");
  assert.equal(nodes[3].props.bodyMode, "slot");
  assert.equal(nodes[3].props.layout, "stack");
  assert.deepEqual(nodes[3].props.paragraphs, [
    {
      props: {
        align: "center",
        id: "split-slot-paragraph-1",
        text: "First paragraph",
      },
      type: "TextParagraphBlock",
    },
  ]);

  assert.equal(nodes[4].props.variant, "triptych");
  assert.equal(nodes[4].props.rhythm, "staggered");
  assert.equal(nodes[5].props.variant, "phase");
  assert.equal(nodes[5].props.rhythm, "aligned");
  assert.equal(
    nodes[5].props.col3MediaSrc,
    "/images/train-station/2Day.webp",
  );

  assert.equal(nodes[6].props.variant, "immersive");
  assert.equal(nodes[6].props.href, "/works/immersive");
  assert.equal(nodes[7].props.variant, "card");
  assert.equal(nodes[7].props.href, "/works/card");
});

test("normalizePuckData removes ParameterGrid local video state and hydrates description alignment", () => {
  const normalized = normalizePuckData({
    content: [
      {
        type: "ParameterGrid",
        props: {
          id: "parameters",
          isVideo: true,
          mediaSrc: "/images/train-station/2Day.webp",
          parameters: [
            {
              description: "Description",
              name: "Name",
            },
          ],
        },
      },
    ],
    root: {
      props: {
        title: "Demo",
      },
    },
  });

  const parameterGrid = normalized.content[0] as {
    props: Record<string, unknown>;
  };
  assert.equal("isVideo" in parameterGrid.props, false);
  assert.deepEqual(parameterGrid.props.parameters, [
    {
      description: "Description",
      descriptionAlign: "left",
      name: "Name",
    },
  ]);
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
  assert.equal(header.props.navLinkLabel, "观看视频");
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
