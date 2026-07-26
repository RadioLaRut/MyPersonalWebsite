import assert from "node:assert/strict";
import test from "node:test";

import {
  PUCK_COMPONENT_CATEGORIES,
  PUCK_COMPONENT_DESCRIPTOR_BY_TYPE,
  PUCK_COMPONENT_DESCRIPTORS,
  PUCK_COMPONENT_TYPES,
  type PuckComponentDescriptor,
} from "./component-manifest.ts";
import { PUBLIC_RENDERER_MODULE_NAMES } from "./public-renderer-manifest.ts";

test("组件描述符唯一派生类型、分类和公开 renderer", () => {
  assert.equal(
    new Set(PUCK_COMPONENT_DESCRIPTORS.map((descriptor) => descriptor.type)).size,
    PUCK_COMPONENT_DESCRIPTORS.length,
  );
  assert.deepEqual(
    PUCK_COMPONENT_TYPES,
    PUCK_COMPONENT_DESCRIPTORS.map((descriptor) => descriptor.type),
  );
  assert.deepEqual(
    Object.keys(PUBLIC_RENDERER_MODULE_NAMES).sort(),
    [...PUCK_COMPONENT_TYPES].sort(),
  );
  assert.deepEqual(
    Object.values(PUCK_COMPONENT_CATEGORIES)
      .flatMap((category) => category.components)
      .sort(),
    [...PUCK_COMPONENT_TYPES].sort(),
  );

  const mediaDescriptors = PUCK_COMPONENT_DESCRIPTORS.filter(
    (descriptor) => "mediaProfile" in descriptor,
  );
  assert.ok(
    mediaDescriptors.every((descriptor) => "mediaPreload" in descriptor),
    "每个媒体组件都必须明确声明首屏预加载策略",
  );
  const worksListDescriptor: PuckComponentDescriptor =
    PUCK_COMPONENT_DESCRIPTOR_BY_TYPE.WorksList;
  assert.equal(worksListDescriptor.mediaPreload, "deferred");
});
