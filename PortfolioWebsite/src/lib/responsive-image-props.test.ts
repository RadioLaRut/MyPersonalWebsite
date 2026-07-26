import assert from "node:assert/strict";
import test from "node:test";

import { createResponsiveImageProps } from "./responsive-image-props.ts";

test("全宽图片生成与 Next 配置一致的设备宽度 srcset", () => {
  const props = createResponsiveImageProps({
    alt: "Cover",
    height: 900,
    sizes: "100vw",
    src: "/images/insight/InsightCover.webp",
    width: 1600,
  });

  assert.match(props.srcSet ?? "", /w=640&q=75 640w/);
  assert.match(props.srcSet ?? "", /w=3840&q=75 3840w/);
  assert.equal(
    props.src,
    "/_next/image?url=%2Fimages%2Finsight%2FInsightCover.webp&w=3840&q=75",
  );
});

test("网格图片根据最小 vw 比例省略不必要的大候选之前的小档", () => {
  const props = createResponsiveImageProps({
    alt: "Panel",
    height: 900,
    sizes: "(min-width: 1024px) 33vw, 100vw",
    src: "/images/city-2026/001.webp",
    width: 1600,
  });

  assert.doesNotMatch(props.srcSet ?? "", /w=128&q=75/);
  assert.match(props.srcSet ?? "", /w=256&q=75 256w/);
});

test("无需优化的资源保留原始地址且不生成 srcset", () => {
  const props = createResponsiveImageProps({
    alt: "Vector",
    height: 900,
    sizes: "100vw",
    src: "/assets/images/placeholder.svg",
    unoptimized: true,
    width: 1600,
  });

  assert.equal(props.src, "/assets/images/placeholder.svg");
  assert.equal(props.srcSet, undefined);
});
