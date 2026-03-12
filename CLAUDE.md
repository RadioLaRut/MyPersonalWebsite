# CLAUDE.md

本文档为 Claude Code 在本仓库工作时提供项目级说明。除非用户明确要求，否则应优先遵循当前源码、`content/pages/**/*.json` 和 `网页风格和规范.md` 所定义的现状，而不是沿用历史实现假设。

## 项目概述

这是一个基于 Next.js 14 App Router 的个人作品集网站，使用 TypeScript、Tailwind CSS、Framer Motion、Lenis 和 Puck 组织页面内容。当前站点的页面主体以 JSON 内容驱动渲染为主，而不是以手写页面模板为主。

核心特点：

- 页面内容来自 `content/pages/**/*.json`
- 路由通过 `src/lib/render-puck-page.tsx` 读取 JSON、归一化后交给 Puck 渲染
- 排版使用统一的 `Typography` 组件和字体 token
- 图片使用 `PresetImage` 和统一的图片比例预设
- 页面滚动、导航、自定义光标和特定区块交互由 Framer Motion 与 Lenis 驱动

## 安全规范

- 所有输出都必须使用中文，包括说明、注释、评审意见与 PR 描述，不得使用任何 Emoji。
- 任何提问必须使用 `AskUserQuestion` 提问工具。
- 常规开发命令默认直接执行，无需逐条确认，如 `npm run dev`、`npm run dev:test`、`npm run build`、`npm run lint`、`npm run test:slug`、`npm run test:assets`。
- 严禁执行不可逆操作：不得删除文件夹、磁盘分区、Git 仓库，或执行等价高风险命令，如 `rm -rf`、破坏性 `git reset`。任何此类操作都需要用户二次确认。
- 仅当命令具有高风险或不可逆性时，才需要先征得确认。
- 任何可能越过安全边界的操作，必须先确认影响范围，并优先采用可回滚方案。
- CodeX 会 review 你的任何内容。

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（常规模式，NEXT_PUBLIC_SITE_MODE=normal）
npm run dev

# 启动测试模式（NEXT_PUBLIC_SITE_MODE=testing，可访问 /admin 和 /playground）
npm run dev:test

# 生产构建（会先执行资源检查）
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# slug 安全与归一化测试
npm run test:slug

# public 资源引用完整性检查
npm run test:assets

# 构建 Puck 预览样式
npm run build:puck-preview-css

# 将 public/images/ 下的 png/jpg/jpeg 转换为 webp，并同步更新代码与内容引用
# 需要 cwebp 可执行文件在 PATH 中可用，或通过 CWEBP_BIN 指定路径
npm run convert:images
```

## 核心架构

### 内容与运行模式

项目通过 `scripts/run-next-with-mode.mjs` 设置 `NEXT_PUBLIC_SITE_MODE`：

- 常规模式：`npm run dev`
  - `NEXT_PUBLIC_SITE_MODE=normal`
  - 正式展示模式
  - 全局默认禁止文字选择，增强画廊式沉浸感
- 测试模式：`npm run dev:test`
  - `NEXT_PUBLIC_SITE_MODE=testing`
  - 允许访问 `/admin` 与 `/playground`
  - 允许全页文本选择，便于校对与复制

注意：

- 当前项目始终使用 JSON 内容渲染，不存在“测试模式切回另一套硬编码页面”的机制。
- 联系信息在正式页面结构中已经并入 `/about`，`/contact` 只是跳转入口。

### 路由结构

- `/`：首页，当前由 `HeroSection`、多个 `ProjectSection` 和 `HomeEndcapSection` 组成
- `/about`：关于页，包含页头、自述、高密度信息块和 `ContactFlashlight`
- `/contact`：重定向到 `/about`
- `/works`：作品归档列表页，当前核心区块为 `WorksList`
- `/works/[id]`：作品详情页，按项目内容组合多个 breakdown 区块
- `/works/lighting-portfolio`：灯光作品集索引页
- `/works/lighting-portfolio/[id]`：灯光集合详情页
- `/playground`：测试模式下使用的组件演示页
- `/playground/font-lab`：字体与排版实验页
- `/admin`：Puck 编辑器入口
- `/p/[[...slug]]`：旧链接兼容入口，用于重定向到正式路径
- `/api/puck`、`/api/upload`、`/api/font-lab`：内部 API 路由

### 内容来源与渲染

- 正式页面内容以 `content/pages/**/*.json` 为单一内容源。
- `src/lib/render-puck-page.tsx` 会：
  - 根据 slug 读取对应 JSON
  - 对数据执行 `normalizePuckData`
  - 用 `@measured/puck` 的 `Render` 输出页面
- `src/puck/config.tsx` 是内容块注册中心，定义了所有可视化编辑器中可用的组件。
- 历史内容类型 `LightingCollectionItem` 会在归一化阶段转换为 `ImagePanel`，不要再把它当成新的标准组件。

### 中间件与安全

`src/middleware.ts` 负责：

- 将旧 `/p/*` 路径重定向到正式无前缀路径
- 将旧作品 slug 规范化为当前 canonical slug
- 阻止路径遍历与非法 slug，例如 `..`、反斜杠、空字节等

## 设计系统

### 全局视觉基础

当前站点采用深黑背景与低透明度白色层级，不是纯平黑白模板。真实视觉基础以 `src/app/globals.css`、`tailwind.config.ts` 和 `网页风格和规范.md` 为准：

- 背景核心变量：
  - `--background: #050505`
  - `--foreground: rgba(255, 255, 255, 0.9)`
  - `--surface-elevated: rgba(255, 255, 255, 0.05)`
  - `--surface-muted: rgba(255, 255, 255, 0.03)`
  - `--border-subtle: rgba(255, 255, 255, 0.1)`
- Tailwind 语义文本色：
  - `textPrimary`
  - `textMuted`
- 轻量玻璃面板使用 `glass-panel`
- 正式模式和测试模式通过 `data-site-mode` 控制交互差异

### 栅格系统

- 全站统一使用 12 列 `.grid-container`
- 当前实现不是旧版“移动端 4 列，桌面端 12 列”，而是所有设备统一 12 列
- 核心约束：
  - 左右安全边距 `4vw`
  - 默认 gap `1rem`
  - `1024px+` 时 gap `1.5rem`
  - 最大宽度 `1680px`
- 新区块必须落在这套网格或既有 grid helper 上，禁止自由摆放

### 排版系统

不要再用“Display / Serif / Mono”这种粗略分法理解当前站点。当前排版系统以 `src/lib/typography-tokens.ts` 和 `Typography` 组件为准，主要预设为：

- `sans-body`
- `luna-editorial`
- `gothic-editorial`
- `classical-display`

当前常用字号 token 包括：

- `caption`
- `label`
- `body-sm`
- `body`
- `body-lg`
- `title-sm`
- `title`
- `display`
- `hero`
- `menu`

要求：

- 新增文本组件优先复用 `Typography`
- 不要直接用裸 `h1`、`p` 加一串 Tailwind 类模拟排版系统
- 中西文混排依赖 `Typography` 内部 script 分段与字体映射，不要绕过这层机制

### 图片系统

图片统一通过 `PresetImage` 和 `src/lib/image-presentation.ts` 管理。

可用图片预设：

- `ratio-16-9`
- `ratio-21-9`
- `native`

可用适配模式：

- `x`
- `y`
- `cover`

新增图片区块时必须明确预设比例与适配模式，不要把图片当作无约束内容直接塞进布局。

### 交互特性

- 自定义光标：桌面端启用，使用 `mix-blend-mode: difference`
- Lenis 平滑滚动：全站默认滚动体验的一部分
- 导航：右上角 `MENU` 按钮打开右侧抽屉，不是传统顶部导航栏
- `WorksListEntry`：桌面端 hover 展开，移动端通过视口中心感应区自动展开
- `ContactFlashlight`：当前位于 `/about` 页面，不在独立 `/contact` 页面
- `copyable-contact`：在正式模式下允许邮箱、微信等文本继续可复制

## 关键组件与内容块

### 首页与归档类组件

- `HeroSection`
- `ProjectSection`
- `HomeEndcapSection`
- `PortfolioHeroHeader`
- `LightingProjectCard`
- `WorksList`
- `WorksListEntry`

### 作品详情类组件

位于 `src/components/breakdowns/` 的当前主要组件包括：

- `BreakdownHeadline`
- `BreakdownTriptych`
- `ContentCard`
- `HighDensityInfoBlock`
- `ImagePanel`
- `ImageSlider`
- `MetaDataBlock`
- `ParameterGrid`
- `TextSplitLayout`

其他常用区块与通用组件：

- `ContactFlashlightBlock`
- `NextProjectBlock`
- `StatementBlock`
- `MetadataListItem`
- `TextParagraphBlock`

注意：

- 不要再把 `MosaicGallery` 或旧版固定作品对象结构当作当前主路径能力。
- 如果新增组件或显著调整组件职责，必须同步更新 Playground 和相关规范文档。

## 内容建模注意事项

- 当前页面不是围绕固定 `Project` 对象结构渲染。
- 不要依据旧的 `idNum`、`heroImage`、`gallery`、`nextBg` 之类字段设计新内容流程。
- 当前标准做法是使用 Puck block 组合页面，例如：
  - 首页：`HeroSection -> ProjectSection -> HomeEndcapSection`
  - 关于页：`PortfolioHeroHeader -> RichParagraph -> HighDensityInfoBlock -> ContactFlashlight`
  - 作品页：`WorksList`
  - 详情页：多个 breakdown 组件组合
- `PortfolioData.md` 可以作为历史资料参考，但不是当前运行时内容结构的权威说明。

## 重要文档

- `网页风格和规范.md`：当前站点风格快照与页面编排规范
- `配置指南.md`：内容配置、Puck 使用和页面搭建说明
- `PortfolioData.md`：历史资料，阅读时需要与当前 JSON/Puck 架构交叉验证

## 开发注意事项

1. 修改设计或排版前，先对照 `网页风格和规范.md`。
2. 新增区块优先复用现有 Puck 组件，而不是再造一套平行组件系统。
3. 所有文本优先接入 `Typography`，所有图片优先接入 `PresetImage`。
4. 所有页面与组件排版都必须服从统一 12 列网格。
5. 新增或明显变更组件时，必须同步更新 `/playground`。
6. `/contact` 当前不是独立联系页；若要改回独立页面，需要同时调整路由、内容与规范文档。
7. 运行 `npm run build` 前应意识到它会自动执行 `npm run test:assets`。
8. 处理图片转换时，不要假设 `cwebp` 位于固定系统路径，优先使用 PATH 或 `CWEBP_BIN`。
9. 不得输出任何 Emoji。
10. 不得进行破坏性操作；删除文件前必须明确征得用户同意。
