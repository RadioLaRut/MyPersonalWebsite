import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ReactElement } from "react";

import { createDefaultComponentDesignDocument } from "../lib/component-design-v2.ts";
import {
  renderWithAdapter,
  resolveComponentDesignProps,
} from "./render-adapter.ts";

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

test("公开媒体提示只注入公开渲染表面", () => {
  const publicMediaHint = {
    height: 900,
    preload: true,
    profile: "full-bleed" as const,
    sizes: "100vw",
    src: "/images/insight/InsightCover.webp",
    width: 1600,
  };
  const element = renderWithAdapter({
    props: { id: "hero" },
    publicMediaHint,
    render: render as never,
    surface: "public",
    type: "HeroSection",
  }) as ReactElement<Record<string, unknown>>;

  assert.deepEqual(element.props.publicMediaHint, publicMediaHint);
});

test("统一适配器注入作者组件的 V2 变体布局", () => {
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

  assert.deepEqual(
    hero.props.componentLayout,
    designDocument.components.HeroSection.variants.poster,
  );
  assert.equal(hero.props.componentVariant, "poster");
  assert.deepEqual(
    worksList.props.componentLayout,
    designDocument.components.WorksList.variants.default,
  );
  assert.equal(worksList.props.componentVariant, "default");
});

test("合并组件只暴露作者组件变体，不创建内部顶层作用域", () => {
  const designDocument = createDefaultComponentDesignDocument();

  const header = resolveComponentDesignProps(
    "EditorialHeader",
    { variant: "collection" },
    designDocument,
  );
  const split = resolveComponentDesignProps(
    "EditorialSplit",
    { layout: "media-left" },
    designDocument,
  );
  const columns = resolveComponentDesignProps(
    "ThreeColumnSection",
    { variant: "triptych" },
    designDocument,
  );
  const project = resolveComponentDesignProps(
    "ProjectCoverLink",
    { variant: "immersive-right" },
    designDocument,
  );

  assert.equal(header?.componentVariant, "collection");
  assert.equal(split?.componentVariant, "media-left");
  assert.equal(columns?.componentVariant, "triptych");
  assert.equal(project?.componentVariant, "immersive-right");
  assert.deepEqual(
    header?.componentLayout,
    designDocument.components.EditorialHeader.variants.collection,
  );
});
