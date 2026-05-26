# Repository Guidelines

## 语言与执行原则
- 所有输出都必须使用中文，包括计划、说明、注释、评审意见与 PR 描述，任何情况不得使用 Emoji。
- 常规开发命令默认直接执行，无需逐条确认，如 `npm run dev`、`npm run dev:test`、`npm run build`、`npm run lint`、`npm run test:slug`、`npm run test:assets`。
- 任何必须向用户确认的问题，优先使用当前代理环境提供的提问工具；仅在该环境不提供相应工具时，才改用普通文本提问。
- 不得刻意迎合用户。所有回答都必须独立分析，任何结论都必须能自洽并经得起严格审查。
- 所有建议和代码都必须能经受严格 review，不允许用模糊表述、硬编码或掩盖根因的方式交付。

## 安全与变更边界
- 严禁执行不可逆操作：不得删除文件夹、磁盘分区、Git 仓库，或执行等价高风险命令，如 `rm -rf`、破坏性 `git reset`。
- 仅当命令具有高风险、不可逆性或明显越过安全边界时，才需要先征得确认。
- 任何可能越过安全边界的操作，必须先确认影响范围，并优先采用可回滚方案。

## 项目事实速查
- 主应用位于 `PortfolioWebsite/`，技术栈为 Next.js 14 + TypeScript + Tailwind CSS + Framer Motion + Puck。
- 页面内容以 `PortfolioWebsite/content/pages/**/*.json` 为单一来源；页面主体内容不要直接绕过这套内容链路硬编码。
- `FontLab` 与 `ComponentLab` 的预设内容同样属于配置数据；字体样本、组件样本、默认文案、默认图片与默认参数不得散落在 `src/**` 实现中长期硬编码。
- 当前联系信息并入 `/about` 页面；`PortfolioWebsite/src/app/contact/page.tsx` 只负责重定向到 `/about`。
- 网站运行依赖的 `PortfolioWebsite/public/**` 图片资源必须以普通 Git 文件提交，严禁通过 Git LFS 管理。
- `PortfolioData.md` 仅作历史资料参考，不是当前页面渲染的权威数据结构。

## 开发命令
- 所有命令都在 `PortfolioWebsite/` 目录执行。
- `npm run dev`：常规开发模式，设置 `NEXT_PUBLIC_SITE_MODE=normal`。
- `npm run dev:test`：测试模式，设置 `NEXT_PUBLIC_SITE_MODE=testing`，启用 `/admin`、`/playground` 与全页可选中复制。
- `npm run build`：生产构建；执行前会先跑 `npm run test:assets`。
- `npm run start`：启动生产构建后的站点。
- `npm run lint`：运行 Next.js ESLint 检查。
- `npm run test:slug`：执行 slug 安全与归一化测试。
- `npm run test:assets`：检查 `public/` 资源引用完整性。
- `npm run build:puck-preview-css`：构建 Puck 预览样式文件。
- `npm run convert:images`：将 `public/images/` 下的 png/jpg/jpeg 转为 webp，并同步更新 `src/` 与 `content/` 中的引用；依赖 `cwebp` 在 PATH 中可用，或通过 `CWEBP_BIN` 指定路径。

## 实现与协作约束
- 所有新增组件或明显扩展后的组件，都应同步更新到 `/playground` 或对应演示入口。
- 涉及页面排版、组件布局、视觉系统、Typography、FontLab 链路或图片呈现规范的修改，必须先遵循 `PortfolioWebsite/网页风格和规范.md`；不要在本文件重复维护展开版规则。
- 文本渲染优先走现有 `Typography` 体系；图片渲染优先走现有 `PresetImage` 与统一图片预设。
- 任何字体相关内容调整，不得直接在组件或页面里硬编码字符串、字号样本或默认展示；必须修改 `FontLab` 预设链路，优先落到 `PortfolioWebsite/content/font-lab/font-presets.json` 或其统一配置入口。
- 任何组件相关样本内容、默认文案、默认图片、默认参数的调整，不得直接在业务组件或页面 JSX 中硬编码；必须修改 `ComponentLab` 预设链路，优先落到 `PortfolioWebsite/src/components/playground/component-lab-registry.tsx`、`PortfolioWebsite/content/component-design/component-design.json` 或其统一配置入口。
- 如果现有 `FontLab` 或 `ComponentLab` 预设结构无法承载需求，先扩展预设结构与消费链路，再接入变更；不允许跳过预设层直接把内容写死在实现里。
- 页面和组件布局必须落在统一 12 列 `.grid-container` 或既有 grid helper 上，不允许脱离网格自由摆放。
- 样式优先复用现有 token、全局样式和已有组件，不要为单页局部需求发明新的视觉常量。

## 测试与交付要求
- 当前测试体系以 Node 内置测试运行器 `node --test` 为主。
- 新增测试文件建议命名为 `*.test.ts`，尽量与被测模块同目录。
- 涉及 slug、上传、API 路由、Puck 内容归一化、字体配置或图片路径处理的改动，必须补充正常与异常用例。
- 涉及页面排版或视觉系统调整时，除必要测试外，还应同步更新 Playground 与相关规范文档。
