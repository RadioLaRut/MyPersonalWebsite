import assert from "node:assert/strict";
import test from "node:test";

import {
  motionDelays,
  motionDurations,
  motionEasings,
  motionScrollTokens,
  motionTransitions,
} from "./tokens.ts";

function assertMotionRange(
  label: string,
  input: number[],
  output: unknown[],
) {
  assert.equal(
    input.length,
    output.length,
    `${label} 的输入与输出关键帧数量必须一致`,
  );
  assert.ok(input.length >= 2, `${label} 至少需要两个关键帧`);

  for (let index = 1; index < input.length; index += 1) {
    assert.ok(
      input[index] > input[index - 1],
      `${label} 的输入进度必须严格递增`,
    );
  }
}

test("scroll motion token ranges stay aligned and ordered", () => {
  assertMotionRange(
    "heroMedia.y",
    motionScrollTokens.heroMedia.input,
    motionScrollTokens.heroMedia.y,
  );
  assertMotionRange(
    "heroMedia.scale",
    motionScrollTokens.heroMedia.input,
    motionScrollTokens.heroMedia.scale,
  );
  assertMotionRange(
    "projectMedia.y",
    motionScrollTokens.projectMedia.input,
    motionScrollTokens.projectMedia.y,
  );
  assertMotionRange(
    "projectMedia.scale",
    motionScrollTokens.projectMedia.input,
    motionScrollTokens.projectMedia.scale,
  );
  assertMotionRange(
    "projectContent.opacity",
    motionScrollTokens.projectContent.input,
    motionScrollTokens.projectContent.opacity,
  );
});

test("component transitions stay anchored to core motion tokens", () => {
  assert.deepEqual(motionTransitions.heroLead, {
    delay: motionDelays.heroLead,
    duration: motionDurations.deliberate,
    ease: motionEasings.standard,
  });
  assert.deepEqual(motionTransitions.navigationPanel, {
    duration: motionDurations.reveal,
    ease: motionEasings.standard,
  });
});
