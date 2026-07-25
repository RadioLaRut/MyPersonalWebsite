import assert from "node:assert/strict";
import test from "node:test";

import {
  parseBilibiliVideoSource,
  resolveBilibiliEmbedTitle,
} from "./bilibili-embed.ts";

test("B 站视频解析接受 BV 号与标准视频链接", () => {
  const direct = parseBilibiliVideoSource("BV1DNwUeDEos");
  assert.equal(direct?.bvid, "BV1DNwUeDEos");
  assert.equal(
    direct?.embedUrl,
    "https://player.bilibili.com/player.html?bvid=BV1DNwUeDEos&poster=1&autoplay=0&danmaku=0&refer=0",
  );
  assert.equal(
    direct?.watchUrl,
    "https://www.bilibili.com/video/BV1DNwUeDEos",
  );

  const linked = parseBilibiliVideoSource(
    "https://www.bilibili.com/video/BV1DNwUeDEos?p=2&t=135",
  );
  assert.deepEqual(linked, {
    bvid: "BV1DNwUeDEos",
    embedUrl:
      "https://player.bilibili.com/player.html?bvid=BV1DNwUeDEos&poster=1&autoplay=0&danmaku=0&refer=0&p=2&t=135",
    p: 2,
    t: 135,
    watchUrl: "https://www.bilibili.com/video/BV1DNwUeDEos?p=2&t=135",
  });
});

test("B 站视频解析拒绝短链、其他业务、任意 iframe 与注入输入", () => {
  const invalidSources = [
    "https://b23.tv/example",
    "https://live.bilibili.com/123",
    "https://www.bilibili.com/bangumi/play/ep123",
    "https://example.com/video/BV1DNwUeDEos",
    "https://player.bilibili.com/player.html?bvid=BV1DNwUeDEos",
    "javascript:alert(1)",
    "<iframe src=\"https://player.bilibili.com\"></iframe>",
    "https://www.bilibili.com/video/BV1DNwUeDEos?p=2<script>",
    "https://www.bilibili.com/video/BV1DNwUeDEos?autoplay=1",
    "BV1DNwUeDEos?autoplay=1",
  ];

  for (const source of invalidSources) {
    assert.equal(parseBilibiliVideoSource(source), null, source);
  }
});

test("B 站分 P 与起播时间只接受范围内的安全整数", () => {
  assert.equal(
    parseBilibiliVideoSource(
      "https://www.bilibili.com/video/BV1DNwUeDEos?p=0",
    ),
    null,
  );
  assert.equal(
    parseBilibiliVideoSource(
      "https://www.bilibili.com/video/BV1DNwUeDEos?t=-1",
    ),
    null,
  );
  assert.equal(
    parseBilibiliVideoSource(
      "https://www.bilibili.com/video/BV1DNwUeDEos?t=1.5",
    ),
    null,
  );
  assert.equal(
    parseBilibiliVideoSource(
      "https://www.bilibili.com/video/BV1DNwUeDEos?p=1&p=2",
    ),
    null,
  );
});

test("B 站无障碍标题兼容编辑器临时 React 节点", () => {
  assert.equal(resolveBilibiliEmbedTitle("  项目视频  "), "项目视频");
  assert.equal(resolveBilibiliEmbedTitle(" "), "哔哩哔哩视频");
  assert.equal(resolveBilibiliEmbedTitle({ type: "span" }), "哔哩哔哩视频");
});
