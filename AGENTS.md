# Repository Guidelines

## 全局语言与安全规则
- 所有输出都必须使用中文，包括计划、说明、注释、评审意见与 PR 描述，任何情况不得使用 Emoji。
- 常规开发命令默认直接执行，无需逐条确认，如 `npm run dev`、`npm run dev:test`、`npm run build`、`npm run lint`、`npm run test:slug`、`npm run test:assets`。
- 任何提问必须优先使用当前代理环境提供的提问工具；在 Claude Code 中对应 `AskUserQuestion`。
- 严禁执行不可逆操作：不得删除文件夹、磁盘分区、Git 仓库，或执行等价高风险命令，如 `rm -rf`、破坏性 `git reset`。
- 仅当命令具有高风险或不可逆性时，才需要先征得确认。
- 任何可能越过安全边界的操作，必须先确认影响范围，并优先采用可回滚方案。
- Claude Opus 4.6 会严格 review 你的代码和建议，不允许偷懒。
- 所有新增组件或明显扩展后的组件，都应同步更新到 `/playground` 或对应演示入口。
- 任何针对组件和网页排版的调整，都必须严格遵循统一网格对齐规范与当前 `网页风格和规范.md`。
- 不得刻意迎合用户。所有回答都必须独立分析，任何迎合式结论均被禁止。

## 项目结构与模块组织
- 主应用位于 `PortfolioWebsite/`，技术栈为 Next.js 14 + TypeScript + Tailwind CSS + Framer Motion + Puck。
- 页面与路由位于 `PortfolioWebsite/src/app/`，包含 `api/`、`works/`、`about/`、`admin/`、`playground/`、`p/[[...slug]]/` 等。
- 当前联系信息并入 `/about` 页面；`PortfolioWebsite/src/app/contact/page.tsx` 只负责重定向到 `/about`。
- Puck 配置与编辑器相关逻辑位于 `PortfolioWebsite/src/puck/`，页面内容通过 `PortfolioWebsite/src/lib/render-puck-page.tsx` 从 JSON 渲染。
- 组件位于 `PortfolioWebsite/src/components/`，当前主要分层为 `home`、`works`、`breakdowns`、`layout`、`blocks`、`common`、`playground`、`transitions`。
- 内容数据位于 `PortfolioWebsite/content/pages/**/*.json`，这是当前页面主体内容的单一来源。
- 全局样式与设计 token 主要位于 `PortfolioWebsite/src/app/globals.css`、`PortfolioWebsite/tailwind.config.ts`、`PortfolioWebsite/src/lib/typography-tokens.ts`、`PortfolioWebsite/src/lib/image-presentation.ts`。
- 字体资源位于 `PortfolioWebsite/src/app/fonts/`。
- 静态资源位于 `PortfolioWebsite/public/`；图片通常位于 `PortfolioWebsite/public/images/`。
- 网站运行依赖的 `PortfolioWebsite/public/**` 图片资源必须以普通 Git 文件提交，严禁通过 Git LFS 管理；否则仓库中只会留下 LFS pointer，页面将无法正确读取图片。
- `PortfolioData.md` 可作为历史资料参考，但不是当前页面渲染的权威数据结构。

## 构建、测试与开发命令
- 在 `PortfolioWebsite/` 目录执行命令。
- `npm run dev`：常规开发模式，设置 `NEXT_PUBLIC_SITE_MODE=normal`。
- `npm run dev:test`：测试模式，设置 `NEXT_PUBLIC_SITE_MODE=testing`，启用 `/admin`、`/playground` 与全页可选中复制。
- `npm run build`：生产构建；执行前会先跑 `npm run test:assets`。
- `npm run start`：启动生产构建后的站点。
- `npm run lint`：运行 Next.js ESLint 检查。
- `npm run test:slug`：执行 slug 安全与归一化测试。
- `npm run test:assets`：检查 `public/` 资源引用完整性。
- `npm run build:puck-preview-css`：构建 Puck 预览样式文件。
- `npm run convert:images`：将 `public/images/` 下的 png/jpg/jpeg 转为 webp，并同步更新 `src/` 与 `content/` 中的引用；依赖 `cwebp` 在 PATH 中可用，或通过 `CWEBP_BIN` 指定路径。

## 编码风格与命名规范
- 使用 TypeScript，2 空格缩进，遵循 `eslint-config-next`。
- React 组件文件采用 `PascalCase.tsx`，工具函数采用 `kebab-case.ts`。
- 路由与内容 slug 使用小写短横线命名，如 `lighting-portfolio`、`houdini-pcg`。
- 文本渲染优先走 `Typography` 体系，不要在新组件中回退到无约束的裸文本样式。
- 图片渲染优先走 `PresetImage` 与 `image-presentation.ts` 中的预设，不要绕过统一比例和 fit mode。
- 样式优先复用 `globals.css`、`tailwind.config.ts`、Typography token、网格辅助类和现有组件，不要重复造新的视觉常量。
- 页面和组件布局必须落在统一 12 列 `.grid-container` 或既有 grid helper 上，不允许脱离网格自由摆放。

## 测试规范
- 当前测试体系以 Node 内置测试运行器 `node --test` 为主。
- 现有测试覆盖 slug 校验、Puck 数据归一化、内容 JSON 完整性、字体配置和排版 token 等模块。
- 新增测试文件建议命名为 `*.test.ts`，尽量与被测模块同目录。
- 涉及 slug、上传、API 路由、Puck 内容归一化、字体配置或图片路径处理的改动，必须补充正常与异常用例。
- 涉及页面排版或视觉系统调整时，除必要测试外，还应同步更新 Playground 与相关规范文档。
