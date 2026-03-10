# Repository Guidelines

## 全局语言与安全规则
- 所有输出都必须使用中文（包括**计划**、说明、注释、评审意见与 PR 描述），**任何情况不得使用任何Emoji。**
- 常规开发命令默认直接执行，无需逐条确认（如 `npm run dev`、`npm run build`、`npm run lint`、`npm test`）。
- 严禁执行不可逆操作：不得删除文件夹、磁盘分区、Git 仓库或执行等价高风险命令（如 `rm -rf`、破坏性 `git reset`）。
- 仅当命令具有高风险或不可逆性时，才需要先征得确认。
- 任何可能越过安全边界的操作，必须先确认影响范围，并优先采用可回滚方案。
- **Claude Opus 4.6会严格的Review你的代码和建议。不允许偷懒**
- 任何提问必须使用**提问工具**
- 所有的新增组件应该更新到Playground当中
- 任何的针对组件和网页排版的调整都应该严格遵循网格对齐规范

## 项目结构与模块组织
- 主应用位于 `PortfolioWebsite/`（Next.js 14 + TypeScript）。
- 页面与路由：`PortfolioWebsite/src/app/`（含 `api/`、`works/`、`admin/`、`playground/`，以及用于兼容跳转的 `p/[[...slug]]/`）。
- 组件：`PortfolioWebsite/src/components/`，按 `home`、`works`、`breakdowns`、`layout`、`blocks` 分层。
- 内容数据：`PortfolioWebsite/content/pages/**/*.json`。
- 静态资源：`PortfolioWebsite/public/`；历史素材目录：仓库根 `作品集/`（通常不改动）。

## 构建、测试与开发命令
- 在 `PortfolioWebsite/` 目录执行：
- `npm run dev`：本地开发，默认使用 JSON 正常模式。
- `npm run dev:test`：本地测试模式，启用 `/admin`、`/playground` 与全页可选中复制。
- `npm run build && npm run start`：生产构建与启动。
- `npm run lint`：运行 Next.js ESLint 检查。
- `npm run test:slug`：执行 slug 安全与归一化测试。

## 编码风格与命名规范
- 使用 TypeScript，2 空格缩进，遵循 ESLint（`eslint-config-next`）。
- React 组件文件采用 `PascalCase.tsx`，工具函数采用 `kebab-case.ts`。
- 路由与内容 slug 使用小写短横线命名，如 `lighting-portfolio`。
- 样式优先复用 `globals.css` 与 Tailwind 配置，避免重复样式常量。

## 测试规范
- 当前使用 Node 内置测试运行器（`node --test`），示例：`src/lib/puck-slug.test.ts`。
- 新增测试文件建议命名 `*.test.ts`，与被测模块同目录。
- 涉及 slug、上传、API 路由的改动必须补充正常与异常用例。
