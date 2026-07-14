import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ReactElement } from "react";

import { createDefaultComponentDesignDocument } from "../lib/component-design-schema.ts";
import { renderWithAdapter } from "./render-adapter.ts";

const render = (props: Record<string, unknown>) => createElement("div", props);

test("渲染表面只改变 editMode，不改变原始内容 props", () => {
  const sourceProps = { editMode: true, title: "JIANG\nCHENGYAN" };
  const publicElement = renderWithAdapter({
    props: sourceProps,
    render: render as never,
    surface: "public",
    type: "HeroSection",
  }) as ReactElement<Record<string, unknown>>;
  const editorElement = renderWithAdapter({
    props: sourceProps,
    render: render as never,
    surface: "editor",
    type: "HeroSection",
  }) as ReactElement<Record<string, unknown>>;

  assert.equal(publicElement.props.title, sourceProps.title);
  assert.equal(publicElement.props.editMode, false);
  assert.equal(editorElement.props.title, sourceProps.title);
  assert.equal(editorElement.props.editMode, true);
});

test("统一适配器注入组件设计与 WorksList 子项设计", () => {
  const designDocument = createDefaultComponentDesignDocument();
  const hero = renderWithAdapter({
    designDocument,
    props: {},
    render: render as never,
    surface: "lab",
    type: "HeroSection",
  }) as ReactElement<Record<string, unknown>>;
  const worksList = renderWithAdapter({
    designDocument,
    props: {},
    render: render as never,
    surface: "lab",
    type: "WorksList",
  }) as ReactElement<Record<string, unknown>>;

  assert.deepEqual(hero.props.design, designDocument.components.HeroSection);
  assert.deepEqual(worksList.props.design, designDocument.components.WorksList);
  assert.deepEqual(worksList.props.entryDesign, designDocument.components.WorksListEntry);
});
