# Repository Guidelines

## 全局语言与安全规则
- 所有输出都必须使用中文（包括说明、注释、评审意见与 PR 描述）。
- 常规开发命令默认直接执行，无需逐条确认（如 `npm run dev`、`npm run build`、`npm run lint`、`npm test`）。
- 严禁执行不可逆操作：不得删除文件夹、磁盘分区、Git 仓库或执行等价高风险命令（如 `rm -rf`、破坏性 `git reset`）。
- 仅当命令具有高风险或不可逆性时，才需要先征得确认。
- 任何可能越过安全边界的操作，必须先确认影响范围，并优先采用可回滚方案。

## 项目结构与模块组织
- 主应用位于 `PortfolioWebsite/`（Next.js 14 + TypeScript）。
- 页面与路由：`PortfolioWebsite/src/app/`（含 `api/`、`works/`、`p/[[...slug]]/`）。
- 组件：`PortfolioWebsite/src/components/`，按 `home`、`works`、`breakdowns`、`layout`、`blocks` 分层。
- 内容数据：`PortfolioWebsite/content/pages/**/*.json`。
- 静态资源：`PortfolioWebsite/public/`；历史素材目录：仓库根 `作品集/`（通常不改动）。

## 构建、测试与开发命令
- 在 `PortfolioWebsite/` 目录执行：
- `npm run dev`：本地开发（默认数据源）。
- `npm run dev:json`：启用 JSON + Puck 编辑能力。
- `npm run dev:hardcode`：使用硬编码数据路径。
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

## 提交与 PR 规范
- 提交信息优先使用 Conventional Commits：`feat:`、`fix:`、`chore:`（可附中文说明）。
- 单次提交聚焦单一主题，避免混入无关格式化。
- PR 需包含：变更摘要、影响范围、验证命令与结果；UI 变更附截图（页面路径 + 前后对比）。
- 合并前至少执行：`npm run lint`、`npm run test:slug`、`npm run build`。
