import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("系统光标只由已挂载的 CustomCursor 激活属性控制", () => {
  const root = process.cwd();
  const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const cursor = fs.readFileSync(
    path.join(root, "src/components/layout/CustomCursor.tsx"),
    "utf8",
  );
  const toolsLayout = fs.readFileSync(path.join(root, "src/app/(tools)/layout.tsx"), "utf8");

  assert.match(css, /html\[data-custom-cursor-active="true"\] \*/);
  assert.doesNotMatch(css, /data-font-lab-mode/);
  assert.match(cursor, /setAttribute\(CUSTOM_CURSOR_ACTIVE_ATTRIBUTE, "true"\)/);
  assert.match(cursor, /removeAttribute\(CUSTOM_CURSOR_ACTIVE_ATTRIBUTE\)/);
  assert.match(cursor, /new win\.MutationObserver\(markMagnetElementsDirty\)/);
  assert.match(cursor, /attributeFilter: \["data-cursor-magnet"\]/);
  assert.match(cursor, /subscribeViewportRaf\(win, markMagnetRectsDirty\)/);
  assert.match(cursor, /new win\.ResizeObserver\(markMagnetRectsDirty\)/);
  assert.match(cursor, /magnetResizeObserver\?\.observe\(element\)/);
  assert.match(cursor, /magnetResizeObserver\?\.disconnect\(\)/);
  assert.match(cursor, /magnetRectsDirty/);
  assert.doesNotMatch(cursor, /const onPointerMove[\s\S]*getBoundingClientRect\(\)/);
  assert.doesNotMatch(cursor, /usePathname|startsWith\("\/admin"\)/);
  assert.doesNotMatch(toolsLayout, /CustomCursor/);
});
