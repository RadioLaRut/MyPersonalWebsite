# 个人作品集网站

这是作品集主应用，使用 Next.js 16、React 19、TypeScript、Tailwind CSS、Framer Motion 与 Puck 0.22。生产环境只发布公开站；Puck、FontLab、ComponentLab 和本地文件写入接口只用于本机测试模式。

## 环境要求

- Node.js `24.18.0`
- npm `11.16.0`
- 包管理器只使用 npm

版本同时记录在 `.node-version`、`package.json#engines` 与 `packageManager`。安装依赖使用：

```bash
npm ci
```

仓库只保留 `package-lock.json`，不要提交 Bun、pnpm 或 Yarn 锁文件。

## 运行模式

普通开发模式：

```bash
npm run dev
```

本地测试与编辑模式：

```bash
npm run dev:test
```

测试模式启用 `/admin`、`/playground`、FontLab、ComponentLab 与本地写接口。写操作还要求设置 `LOCAL_EDITOR_ACCESS_TOKEN`，客户端通过 `x-local-editor-token` 请求头发送同一值。Vercel 或其他生产环境变量存在时，本地编辑入口会被阻断。

## 检查与构建

```bash
npm run lint
npm run typecheck
npm test
npm run test:assets
npm run check
npm run build
npm run report:build
npm run start
```

`check` 会先验证按页面生成的公开 Puck 运行时和作品别名映射没有过期，再依次执行 ESLint、TypeScript、全部 Node 测试和资源完整性检查。`build` 会先重新生成这些派生产物并执行完整 `check`，再由 Next 16 的默认 Turbopack 构建生产产物；`report:build` 将公开路由类型、客户端组件与首载资源写入 `.next/build-report.json`，并阻止 Proxy 再次跟踪运行时内容文件。

## 内容架构

- 页面权威数据：`content/pages/**/*.json`
- 字体预设：`content/font-lab/font-presets.json`
- 组件设计预设：`content/component-design/component-design.json`
- `PortfolioData.md` 仅是历史资料，不参与运行时渲染

页面通过 `ContentRepository` 统一读取、列举、发布并投影作品目录。发布顺序固定为 slug 校验、草稿归一化、当前版本严格契约、图片与链接校验、原子写入和回读验证。未知组件、非法 props、危险链接、缺失图片与错误当前版本不会进入权威 JSON。

旧的无版本页面文档只允许通过 `npm run migrate:content` 显式迁移。该命令会先验证全部文档，再只写入旧版本；当前版本只严格校验，现有 SEO 和文件内容不会被重写。公开运行时和 Proxy 使用的纯作品别名映射由 `dev`、`dev:test` 和 `build` 的前置脚本自动生成；修改组件 manifest 或作品别名后也可执行 `npm run generate:public-runtime`，并用 `npm run check:public-runtime` 检查生成文件是否同步。`dev:test` 在页面加入当前裁剪清单之外的合法组件时会回退到完整公开 renderer，保存后无需重启。

页面 SEO 数据保存在同一页面 JSON 的 `root.props`：

```json
{
  "title": "Page title",
  "description": "Page description",
  "image": "/images/example.webp",
  "noIndex": false
}
```

不要另建 SEO 数据文件。`/contact` 固定重定向到 `/about`。

## 路由与渲染

- `(site)` 承载公开路由、导航和公开动效。
- `(tools)` 承载管理端与实验室的实时 Context。
- 文件写 Route Handler 显式使用 Node.js runtime，并保留测试模式与 token 双重限制。
- 普通作品和灯光集合通过 `generateStaticParams()` 静态生成，未知 slug 返回 404。
- JSON 损坏、版本不兼容或读取失败会进入错误边界，不会伪装成 404。

公开渲染使用 Puck RSC 入口，并按当前页面实际出现的组件 type 构造运行时注册表；编辑器继续使用包含 fields 和 defaultProps 的完整配置。

## 部署

生产部署必须使用普通模式，不设置 `NEXT_PUBLIC_SITE_MODE=testing`，也不得暴露本地编辑 token。部署前执行：

将 `NEXT_PUBLIC_SITE_URL` 设置为公开站完整源地址，用于解析 Open Graph 图片；本地默认值为 `http://localhost:3000`。

```bash
npm ci
npm run build
```

`public/**` 图片必须作为普通 Git 文件提交，严禁使用 Git LFS。当前字体文件、格式、字重和加载策略属于既有视觉基线，本轮架构升级没有修改这些内容。
