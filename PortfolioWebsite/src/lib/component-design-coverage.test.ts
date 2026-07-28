import assert from "node:assert/strict";
import test from "node:test";

import {
  COMPONENT_DESIGN_AUTHOR_COMPONENTS,
  COMPONENT_DESIGN_MANIFEST,
  getComponentDesignNodePolicy,
} from "./component-design-manifest.ts";
import {
  createDefaultComponentDesignDocument,
  parseCurrentComponentDesignDocument,
} from "./component-design-v4.ts";

test("V4 设计文档恰好覆盖 17 个页面级组件和全部合法版式", () => {
  const document = createDefaultComponentDesignDocument();

  assert.deepEqual(
    Object.keys(document.components),
    [...COMPONENT_DESIGN_AUTHOR_COMPONENTS],
  );
  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    assert.deepEqual(
      Object.keys(document.components[entry.component].variants),
      entry.variants.map((variant) => variant.id),
      entry.component,
    );
  }
  assert.ok(parseCurrentComponentDesignDocument(document));
});

test("内部 Slot 组件不出现在 V4 顶层作用域", () => {
  const keys = Object.keys(createDefaultComponentDesignDocument().components);
  assert.equal(keys.includes("WorksListEntry"), false);
  assert.equal(keys.includes("MetadataListItem"), false);
  assert.equal(keys.includes("TextParagraphBlock"), false);
});

test("composition 契约只引用合法宿主与成员", () => {
  for (const entry of COMPONENT_DESIGN_MANIFEST) {
    for (const variant of entry.variants) {
      const nodeIds = new Set(variant.nodes.map((node) => node.id));
      const compositionIds = new Set<string>();
      for (const composition of variant.composition ?? []) {
        assert.equal(
          compositionIds.has(composition.id),
          false,
          `${entry.component}.${variant.id}.${composition.id}`,
        );
        compositionIds.add(composition.id);
        assert.ok(
          composition.members.length > 0,
          `${entry.component}.${variant.id}.${composition.id}`,
        );
        for (const member of composition.members) {
          assert.ok(
            nodeIds.has(member),
            `${entry.component}.${variant.id}.${composition.id}.${member}`,
          );
        }
        if (composition.host) {
          assert.ok(
            nodeIds.has(composition.host),
            `${entry.component}.${variant.id}.${composition.id}.${composition.host}`,
          );
        }
        if (composition.kind === "nested-grid") {
          assert.ok(composition.host);
          assert.equal(
            variant.nodes.find((node) => node.id === composition.host)?.kind,
            "container",
          );
        }
        if (
          composition.kind === "overlay-host" ||
          composition.kind === "interactive-overlay"
        ) {
          assert.ok(composition.host);
          for (const member of composition.members) {
            assert.equal(
              variant.nodes.find((node) => node.id === member)?.positioning,
              "overlay",
            );
          }
        }
      }
    }
  }
});

test("关键组件策略锁定语义分组并保留合法横向编辑", () => {
  assert.deepEqual(
    getComponentDesignNodePolicy("WorksList", "default", "item.media"),
    {
      compositionKinds: ["interactive-overlay"],
      lockPlacement: true,
      lockPositioning: true,
      lockResize: true,
    },
  );
  assert.deepEqual(
    getComponentDesignNodePolicy(
      "ImageSlider",
      "default",
      "leftLabel",
    ),
    {
      compositionKinds: ["edge-pair"],
      lockPlacement: true,
      lockPositioning: true,
      lockResize: true,
    },
  );
  assert.deepEqual(
    getComponentDesignNodePolicy(
      "ParameterGrid",
      "default",
      "item.name",
    ),
    {
      compositionKinds: ["nested-grid"],
      constrainToHost: "items",
      lockPlacement: false,
      lockPositioning: false,
      lockResize: false,
    },
  );
  assert.deepEqual(
    getComponentDesignNodePolicy(
      "ProjectCoverLink",
      "card",
      "number",
    ),
    {
      compositionKinds: ["overlay-host"],
      lockPlacement: false,
      lockPositioning: true,
      lockResize: false,
    },
  );
  assert.equal(
    getComponentDesignNodePolicy(
      "HomeEndcapSection",
      "default",
      "cta",
    ).lockPositioning,
    true,
  );
});
