import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  PROJECT_CATALOG,
  getNextProjectDestination,
  getProjectAliasTarget,
  resolveProjectDestination,
  synchronizeNextProjectBlocks,
} from "./project-catalog.ts";

test("project catalog follows the public 01 to 09 works order", () => {
  assert.deepEqual(
    PROJECT_CATALOG.map((project) => project.id),
    [
      "lighting-portfolio",
      "penguin",
      "insight",
      "slay-the-virus",
      "prometheus",
      "wow-otto",
      "im-explode",
      "houdini-pcg",
      "epic-stage",
    ],
  );
  assert.deepEqual(
    PROJECT_CATALOG.map((project) => project.number),
    ["01", "02", "03", "04", "05", "06", "07", "08", "09"],
  );
});

test("project catalog resolves the holy-tank alias and contains no public placeholder", () => {
  assert.equal(getProjectAliasTarget("holy-tank"), "wow-otto");
  assert.equal(resolveProjectDestination("holy-tank")?.href, "/works/wow-otto");
  assert.equal(
    PROJECT_CATALOG.some((project) => project.cover.includes("placeholder")),
    false,
  );
});

test("next project destination follows catalog order and returns to the works index", () => {
  assert.equal(getNextProjectDestination("lighting-portfolio")?.id, "penguin");
  assert.equal(getNextProjectDestination("penguin")?.id, "insight");
  assert.equal(getNextProjectDestination("houdini-pcg")?.id, "epic-stage");
  assert.deepEqual(getNextProjectDestination("epic-stage"), {
    id: "works",
    name: "返回作品索引",
    href: "/works",
    cover: PROJECT_CATALOG[0].cover,
  });
});

test("runtime next-project synchronization does not mutate stored project content", () => {
  const stored = {
    content: [{ type: "NextProjectBlock", props: { nextId: "lighting-portfolio" } }],
  };
  const synchronized = synchronizeNextProjectBlocks(stored, "penguin");

  assert.equal(stored.content[0].props.nextId, "lighting-portfolio");
  assert.equal(synchronized.content[0].props.nextId, "insight");
});

test("public next-project content stores only id and nextId outside the frozen penguin page", () => {
  const worksContentRoot = path.resolve(process.cwd(), "content/pages/works");
  const detailFiles = fs.readdirSync(worksContentRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && entry.name !== "penguin.json")
    .map((entry) => path.join(worksContentRoot, entry.name));

  for (const filePath of detailFiles) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      content?: Array<{ props?: Record<string, unknown>; type?: string }>;
    };
    const nextBlocks = (data.content ?? []).filter((node) => node.type === "NextProjectBlock");
    for (const block of nextBlocks) {
      assert.deepEqual(
        Object.keys(block.props ?? {}).sort(),
        ["id", "nextId"],
        path.basename(filePath),
      );
    }
  }
});
