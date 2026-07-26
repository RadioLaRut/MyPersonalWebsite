import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("公开站在运行时和导航之前挂载开场，并提供无脚本降级", () => {
  const layout = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/(site)/layout.tsx"),
    "utf8",
  );

  assert.match(layout, /data-site-opening-state="loading"/);
  assert.ok(
    layout.indexOf("<SiteOpening") < layout.indexOf("<DeferredPublicRuntime"),
  );
  assert.match(layout, /<noscript>/);
  assert.match(layout, /data-site-opening-overlay/);
});

test("开场遵循图片真实状态、后台预热和减少动态效果", () => {
  const component = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/components/layout/SiteOpening.tsx",
    ),
    "utf8",
  );
  const styles = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/components/layout/SiteOpening.module.css",
    ),
    "utf8",
  );

  assert.match(component, /waitForPageImage\(/);
  assert.match(component, /warmPageImages\(/);
  assert.match(component, /role="status"/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(component, /\b(?:percent|percentage|progressValue)\b/u);
});

test("交互后显现的作品预览仍在初始页面声明图片资源", () => {
  const activation = fs.readFileSync(
    path.resolve(
      process.cwd(),
      "src/components/works/WorksListEntryActivation.tsx",
    ),
    "utf8",
  );

  assert.match(activation, /\{imageSrc \? \(/);
  assert.doesNotMatch(activation, /hasActivated/);
  assert.match(activation, /loading="lazy"/);
});
