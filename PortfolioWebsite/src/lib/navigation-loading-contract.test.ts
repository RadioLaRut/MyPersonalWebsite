import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("菜单触发器只在抽屉真正挂载后隐藏", () => {
  const trigger = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/components/layout/NavigationTrigger.tsx",
    ),
    "utf8",
  );
  const drawer = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/components/layout/NavigationDrawer.tsx",
    ),
    "utf8",
  );

  assert.match(trigger, /const shouldHideTrigger = isOpen && drawerReady/);
  assert.match(trigger, /aria-busy=\{isOpen && !drawerReady/);
  assert.match(trigger, /\.catch\(\(\) => \{[\s\S]*setOpenPathname\(null\)/);
  assert.doesNotMatch(trigger, /Suspense fallback=\{null\}/);
  assert.match(drawer, /onReady\(\);/);
});
