import assert from "node:assert/strict";
import test from "node:test";

import { PUCK_COMPONENT_TYPES } from "../puck/component-manifest.ts";
import {
  ComponentLabPresetError,
  createComponentLabInstanceCatalog,
  readComponentLabPresetDocument,
  type ComponentLabPresetDocument,
} from "./component-lab-presets.ts";
import { contentRepository } from "./content-repository.ts";

function clonePresets(document: ComponentLabPresetDocument) {
  return structuredClone(document);
}

test("ComponentLab 目录覆盖设计组件、真实实例与合法压力样本", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);

  assert.deepEqual(Object.keys(catalog.components), [...PUCK_COMPONENT_TYPES]);
  for (const componentKey of PUCK_COMPONENT_TYPES) {
    const entry = catalog.components[componentKey];
    assert.equal(entry.stressSample.node.type, componentKey);
    assert.equal(entry.stressSample.source, "stress");
    if (entry.preferredInstanceId) {
      assert.ok(entry.instances.some((instance) => instance.id === entry.preferredInstanceId));
    }
  }
  assert.equal(catalog.components.StatementBlock.instances.length, 0);
  assert.equal(catalog.components.StatementBlock.preferredInstanceId, null);
});

test("真实实例保留可达 Slot 子树", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);
  const catalog = createComponentLabInstanceCatalog(pages, presets);
  const contact = catalog.components.ContactFlashlight.instances.find(
    (instance) => instance.id === "about#about-contact-1",
  );
  const worksList = catalog.components.WorksList.instances.find(
    (instance) => instance.id === "works#workslist-1",
  );

  assert.ok(contact);
  assert.ok(worksList);
  assert.equal(Array.isArray(contact.node.props.experienceHistory), true);
  assert.equal(
    (contact.node.props.experienceHistory as Array<{ type: string }>)[0]?.type,
    "MetadataListItem",
  );
  assert.equal(Array.isArray(worksList.node.props.entries), true);
  assert.equal(
    (worksList.node.props.entries as Array<{ type: string }>)[0]?.type,
    "WorksListEntry",
  );
});

test("ComponentLab 对缺失引用、类型错配和非法压力样本明确报错", async () => {
  const [pages, sourcePresets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);

  const missing = clonePresets(sourcePresets);
  missing.components.HeroSection.defaultInstance = {
    componentId: "missing",
    pageSlug: "index",
  };
  assert.throws(
    () => createComponentLabInstanceCatalog(pages, missing),
    (error) => error instanceof ComponentLabPresetError && error.message.includes("引用不存在"),
  );

  const mismatch = clonePresets(sourcePresets);
  mismatch.components.HeroSection.defaultInstance = {
    componentId: "proj-1",
    pageSlug: "index",
  };
  assert.throws(
    () => createComponentLabInstanceCatalog(pages, mismatch),
    (error) => error instanceof ComponentLabPresetError && error.message.includes("预期 HeroSection"),
  );

  const invalid = clonePresets(sourcePresets);
  invalid.components.StatementBlock.stressSample = {
    kind: "standalone",
    node: {
      props: {
        align: "center",
        backgroundColor: "black",
        content: "invalid",
        id: "invalid-statement",
        minHeight: "unsupported",
      },
      type: "StatementBlock",
    },
  };
  assert.throws(
    () => createComponentLabInstanceCatalog(pages, invalid),
    (error) => error instanceof ComponentLabPresetError && error.message.includes("压力样本非法"),
  );
});

test("每个 ComponentLab 预设只能声明自己的组件类型", async () => {
  const presets = await readComponentLabPresetDocument();
  for (const key of PUCK_COMPONENT_TYPES) {
    const stress = presets.components[key].stressSample;
    if (stress.kind === "standalone") {
      assert.equal(stress.node.type, key);
    }
  }
});

test("ComponentLab 超过页面实例预算时明确失败而不是静默截断", async () => {
  const [pages, presets] = await Promise.all([
    contentRepository.listPages(),
    readComponentLabPresetDocument(),
  ]);

  assert.throws(
    () => createComponentLabInstanceCatalog(pages, presets, { maxInstances: 1 }),
    (error) => (
      error instanceof ComponentLabPresetError &&
      error.message.includes("页面实例超过维护上限 1")
    ),
  );
});
