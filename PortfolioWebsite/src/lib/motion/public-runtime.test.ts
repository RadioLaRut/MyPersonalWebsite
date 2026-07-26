import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("Hero 入场样式从首帧生效且不由延迟运行时重播", () => {
  const globals = fs.readFileSync(
    path.join(process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  const runtime = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/components/motion/PublicMotionRuntime.tsx",
    ),
    "utf8",
  );

  assert.match(globals, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(globals, /\[data-hero-lead\][\s\S]*public-hero-lead-enter/);
  assert.match(
    globals,
    /\[data-hero-supporting\][\s\S]*public-hero-supporting-enter/,
  );
  assert.match(globals, /@keyframes public-hero-lead-enter/);
  assert.match(globals, /@keyframes public-hero-supporting-enter/);
  assert.doesNotMatch(runtime, /\.animate\(/);
});
