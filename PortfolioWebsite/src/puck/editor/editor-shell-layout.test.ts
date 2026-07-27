import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  AUTO_SAVE_INTERVAL_MS,
  getApiSaveErrorMessage,
  getSaveStateLabel,
  getUnexpectedSaveErrorMessage,
} from "./save-status.ts";
import {
  loadPuckPageSlugs,
  PAGE_LIST_ACCESS_DENIED_MESSAGE,
  PAGE_LIST_INVALID_RESPONSE_MESSAGE,
  PAGE_LIST_NETWORK_ERROR_MESSAGE,
} from "./page-list-loader.ts";
import {
  getPreviewCanvasHeight,
  getPreviewCanvasScale,
  parsePreviewContentHeight,
} from "./preview-canvas-layout.ts";

const editorShellCss = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-shell.module.css"),
  "utf8",
);
const editorClientSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor-client.tsx"),
  "utf8",
);
const editorWorkspaceSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/editor-workspace.tsx"),
  "utf8",
);
const componentPreviewSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/component-preview-frame.tsx"),
  "utf8",
);
const editorDialogsSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/editor-dialogs.tsx"),
  "utf8",
);
const designAwareConfigSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/design-aware-config.tsx"),
  "utf8",
);
const editorUiStateSource = fs.readFileSync(
  path.resolve(process.cwd(), "src/puck/editor/editor-ui-state.tsx"),
  "utf8",
);

test("编辑器使用固定工作区尺寸且不依赖 Puck 哈希类名", () => {
  assert.match(editorShellCss, /grid-template-rows:\s*56px minmax\(0, 1fr\)/);
  assert.match(editorShellCss, /\.leftSidebar\s*\{[\s\S]*?width:\s*256px/);
  assert.match(editorShellCss, /\.rightSidebar\s*\{[\s\S]*?width:\s*320px/);
  assert.match(editorShellCss, /\.sidebarCollapsed\s*\{[\s\S]*?width:\s*44px/);
  assert.match(editorWorkspaceSource, /collapsed \? styles\.sidebarCollapsed/);
  assert.doesNotMatch(editorShellCss, /class\*="_Puck/);
  assert.doesNotMatch(editorShellCss, /\._Puck[A-Za-z]+_[a-z0-9]+_/);
});

test("编辑器外壳使用可读字号层级，技术信息仍保持次级", () => {
  assert.match(editorShellCss, /--editor-type-code:\s*10px/);
  assert.match(editorShellCss, /--editor-type-meta:\s*11px/);
  assert.match(editorShellCss, /--editor-type-control:\s*12px/);
  assert.match(editorShellCss, /--editor-type-primary:\s*13px/);
  assert.match(
    editorShellCss,
    /\.outlineSelect strong\s*\{[\s\S]*?font-size:\s*var\(--editor-type-primary\)/,
  );
  assert.match(
    editorShellCss,
    /\.fieldLabel strong\s*\{[\s\S]*?font-size:\s*var\(--editor-type-control\)/,
  );
  assert.match(
    editorShellCss,
    /\.fieldLabel code\s*\{[\s\S]*?font-size:\s*var\(--editor-type-code\)/,
  );
});

test("同一字段组紧凑排列，页面描述使用简洁标签", () => {
  assert.match(
    editorShellCss,
    /\.fieldGroup > div > :global\(\*\)\s*\{[\s\S]*?margin-top:\s*0 !important[\s\S]*?padding:\s*10px 12px !important[\s\S]*?border:\s*0 !important/,
  );
  assert.match(
    editorShellCss,
    /\.fieldLabel\s*\{[\s\S]*?gap:\s*6px[\s\S]*?padding:\s*0[\s\S]*?border:\s*0/,
  );
  assert.match(
    fs.readFileSync(path.resolve(process.cwd(), "src/puck/config.tsx"), "utf8"),
    /description:\s*\{\s*type:\s*"textarea",\s*label:\s*"描述\|description"/,
  );
});

test("字段分组忽略旧视觉占位，技术名称使用拆词后的首字母大写", () => {
  assert.match(
    editorWorkspaceSource,
    /const fieldName = getChildFieldName\(child\);[\s\S]*?const group = getEditorFieldGroup\(fieldName\);[\s\S]*?if \(group\) result\[group\]\.push\(child\)/,
  );
  assert.match(
    editorWorkspaceSource,
    /<code title=\{technical\}>\{formatEditorTechnicalName\(technical\)\}<\/code>/,
  );
});

test("页面选择器按名称与路径单行左对齐，首页省略根路径", () => {
  assert.match(
    editorShellCss,
    /\.pageComboboxTrigger\s*\{[\s\S]*?justify-content:\s*flex-start[\s\S]*?padding:\s*0 34px 0 10px[\s\S]*?text-align:\s*left/,
  );
  assert.match(
    editorShellCss,
    /\.pageComboboxTrigger > span\s*\{[\s\S]*?display:\s*flex[\s\S]*?align-items:\s*baseline[\s\S]*?gap:\s*6px/,
  );
  assert.match(
    editorShellCss,
    /\.pageComboboxTrigger > svg\s*\{[\s\S]*?position:\s*absolute[\s\S]*?right:\s*10px/,
  );
  assert.match(
    editorWorkspaceSource,
    /\{selectedPath !== "\/" && <small>\{selectedPath\}<\/small>\}/,
  );
});

test("页面选择器使用可搜索的语义树而不是扁平列表", () => {
  assert.match(editorWorkspaceSource, /buildPageSummaryTree\(pages, query\)/);
  assert.match(editorWorkspaceSource, /role="tree"/);
  assert.match(editorWorkspaceSource, /role="treeitem"/);
  assert.match(editorWorkspaceSource, /role="group"/);
  assert.match(editorWorkspaceSource, /aria-level=\{depth\}/);
  assert.match(
    editorShellCss,
    /\.pageTreeGroup\s*\{[\s\S]*?border-left:\s*1px solid var\(--editor-border\)/,
  );
});

test("侧栏、页签和视口 UI 操作不写入内容历史", () => {
  assert.match(editorWorkspaceSource, /recordHistory:\s*false/g);
  assert.match(editorWorkspaceSource, /onLeftCollapsedChange/);
  assert.match(editorWorkspaceSource, /onRightCollapsedChange/);
  assert.match(editorWorkspaceSource, /onLeftTabChange/);
});

test("侧栏与左栏页签由 admin 持久布局持有，刷新时回到默认值", () => {
  assert.match(
    editorUiStateSource,
    /useState\(false\)/,
    "侧栏刷新后应默认展开",
  );
  assert.match(
    editorUiStateSource,
    /useState<EditorLeftTab>\("outline"\)/,
    "左栏刷新后应默认打开大纲",
  );
  assert.match(editorClientSource, /useEditorUiState\(\)/);
});

test("组件悬停与键盘聚焦共用一个不拦截操作的真实预览 iframe", () => {
  assert.equal(componentPreviewSource.match(/<iframe/g)?.length, 1);
  assert.match(componentPreviewSource, /src="\/component-lab-preview"/);
  assert.match(componentPreviewSource, /viewportHeight:\s*900/);
  assert.match(editorWorkspaceSource, /window\.setTimeout\(\(\) => \{[\s\S]*?\}, 300\)/);
  assert.match(editorWorkspaceSource, /onFocusCapture=/);
  assert.match(editorWorkspaceSource, /event\.key === "Escape"/);
  assert.match(editorShellCss, /\.componentPreviewPopover\s*\{[\s\S]*?width:\s*440px/);
  assert.match(editorShellCss, /\.componentPreviewPopover\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(editorShellCss, /\.componentPreviewIframe\s*\{[\s\S]*?width:\s*1440px/);
});

test("组件开始拖拽时立即取消并清空悬停预览", () => {
  assert.match(
    editorWorkspaceSource,
    /className=\{styles\.componentItem\}[\s\S]*?onPointerDownCapture=\{cancelPreview\}/,
  );
  assert.match(
    editorWorkspaceSource,
    /state\.appState\.ui\.isDragging/,
  );
  assert.match(
    editorWorkspaceSource,
    /preview=\{isDragging \? null : preview\}/,
  );
  assert.match(
    editorWorkspaceSource,
    /event\.key === " " \|\| event\.key === "Enter"[\s\S]*?closeFocusedPreview\(\)/,
  );
});

test("画布插入按钮先固定组件选区，并隔离 Puck 拖拽事件", () => {
  assert.match(
    editorWorkspaceSource,
    /registerOverlayPortal\(buttonRef\.current,\s*\{\s*disableDrag:\s*true\s*\}\)/,
  );
  assert.match(
    editorWorkspaceSource,
    /data-puck-insertion-control="true"/,
  );
  assert.match(
    editorWorkspaceSource,
    /onClick=\{\(event\) => \{[\s\S]*?event\.detail === 0[\s\S]*?onFocus=\{onIntent\}[\s\S]*?onPointerDownCapture=\{\(event\) => \{[\s\S]*?event\.button !== 0[\s\S]*?event\.preventDefault\(\)[\s\S]*?onIntent\(\)[\s\S]*?onInsert\(\)[\s\S]*?onPointerEnter=\{onIntent\}/,
  );
  assert.match(
    editorWorkspaceSource,
    /const keepInsertionControlsMounted = \(\) => \{[\s\S]*?ui:\s*\{\s*itemSelector:\s*selector\s*\}[\s\S]*?recordHistory:\s*false/,
  );
});

test("画布视口模式只控制宽度，预览高度跟随整页内容", () => {
  assert.equal(getPreviewCanvasScale(768, 1440), 0.5);
  assert.equal(getPreviewCanvasScale(768, 820), 720 / 820);
  assert.equal(getPreviewCanvasScale(768, 390), 1);
  assert.equal(
    getPreviewCanvasHeight({
      containerHeight: 800,
      contentHeight: 4_800,
      scale: 0.5,
    }),
    4_800,
  );
  assert.equal(
    getPreviewCanvasHeight({
      containerHeight: 800,
      contentHeight: 500,
      scale: 0.5,
    }),
    1_480,
  );
  assert.equal(parsePreviewContentHeight({ height: 4800.2 }), 4_801);
  assert.equal(parsePreviewContentHeight({ height: 0 }), null);
  assert.match(
    editorWorkspaceSource,
    /height:\s*previewHeight \* scale/,
  );
  assert.match(
    editorWorkspaceSource,
    /height:\s*previewHeight,\s*[\r\n]+\s*transform:/,
  );
  assert.doesNotMatch(
    editorWorkspaceSource,
    /height:\s*viewportHeight \* scale/,
  );
});

test("合并后的正文、三栏标题与说明字段继续支持画布直接编辑", () => {
  for (const fieldName of [
    "body",
    "col1Body",
    "col1Label",
    "col1Subtitle",
    "col1Title",
    "col2Body",
    "col3Body",
    "description",
    "subtitle",
    "title",
  ]) {
    assert.match(
      designAwareConfigSource,
      new RegExp(`"${fieldName}"`),
      `${fieldName} 应进入直接编辑字段清单`,
    );
  }
  assert.match(designAwareConfigSource, /nextField\.contentEditable = true/);
});

test("未保存切页提供保存、放弃和取消，保存失败不会继续", () => {
  assert.match(editorDialogsSource, /"保存并继续"/);
  assert.match(editorDialogsSource, /放弃修改/);
  assert.match(editorDialogsSource, /取消/);
  assert.match(editorClientSource, /pendingActionRef\.current = action/);
  assert.match(editorClientSource, /pendingActionRef\.current = null/);
  assert.match(editorClientSource, /const didSaveLatest = await savePage\("manual"\)/);
  assert.match(editorClientSource, /if \(didSaveLatest\) runPendingAction\(\)/);
});

test("页面清单加载器返回可搜索的页面摘要", async () => {
  const pages = [
    { publicPath: "/about", slug: "about", title: "关于" },
    { publicPath: "/", slug: "index", title: "首页" },
  ];
  assert.deepEqual(await loadPuckPageSlugs({
    fetcher: async () => Response.json({
      pages,
      slugs: ["about", "index"],
    }),
  }), {
    pages,
    status: "ready",
    slugs: ["about", "index"],
  });

  assert.deepEqual(await loadPuckPageSlugs({
    fetcher: async () => Response.json({
      error: {
        code: "UNAUTHORIZED",
        message: "Editor access denied",
      },
    }, { status: 403 }),
  }), {
    status: "error",
    message: PAGE_LIST_ACCESS_DENIED_MESSAGE,
  });

  assert.deepEqual(await loadPuckPageSlugs({
    fetcher: async () => Response.json({ pages: [], slugs: [null] }),
  }), {
    status: "error",
    message: PAGE_LIST_INVALID_RESPONSE_MESSAGE,
  });

  assert.deepEqual(await loadPuckPageSlugs({
    fetcher: async () => {
      throw new TypeError("Failed to fetch");
    },
  }), {
    status: "error",
    message: PAGE_LIST_NETWORK_ERROR_MESSAGE,
  });
});

test("保存状态采用 saved、dirty、saving、error 四态", () => {
  assert.equal(getSaveStateLabel("saved"), "已保存");
  assert.equal(getSaveStateLabel("dirty"), "有未保存修改");
  assert.equal(getSaveStateLabel("saving"), "保存中");
  assert.equal(getSaveStateLabel("error"), "保存失败");
});

test("保存错误区分 token、内容校验、存储和网络失败", () => {
  assert.equal(getApiSaveErrorMessage({
    error: {
      code: "EDITOR_TOKEN_REQUIRED",
      message: "technical token error",
    },
  }, 403), "浏览器中的本地编辑 Token 缺失，或不在 .env.local 允许的 Token 列表中。请为这台电脑重新设置 Token 后重试。");

  assert.equal(getApiSaveErrorMessage({
    error: {
      code: "INVALID_CONTENT",
      issues: [
        { message: "image does not exist", path: "$.content[0].props.heroImage" },
        { message: "image does not exist", path: "$.root.props.image" },
      ],
      message: "strict validation failed",
    },
  }, 422), "内容校验失败：$.content[0].props.heroImage：image does not exist（另有 1 项）");

  const storageError = new Error("localStorage denied");
  storageError.name = "SecurityError";
  assert.equal(
    getUnexpectedSaveErrorMessage(storageError),
    "浏览器禁止读写本地编辑 Token。请允许 localhost 使用本地存储后重试。",
  );
  assert.equal(
    getUnexpectedSaveErrorMessage(new TypeError("Failed to fetch")),
    "无法连接本地保存接口。请确认 npm run dev:test 仍在运行后重试。",
  );
});

test("自动保存从首次 dirty 起使用三分钟单次计时并串行写入", () => {
  assert.equal(AUTO_SAVE_INTERVAL_MS, 180_000);
  assert.match(editorClientSource, /window\.setTimeout\(\(\) => \{/);
  assert.doesNotMatch(editorClientSource, /window\.setInterval/);
  assert.match(editorClientSource, /void savePageRef\.current\("auto"\)/);
  assert.match(editorClientSource, /saveQueueRef\.current\.then\(runSave, runSave\)/);
});

test("保存完成不会清除保存期间产生的新修改", () => {
  assert.match(editorClientSource, /dataRevisionRef\.current === revision/);
  assert.match(editorClientSource, /savedLatestRevision/);
  assert.match(editorClientSource, /scheduleAutoSave\(\)/);
});
