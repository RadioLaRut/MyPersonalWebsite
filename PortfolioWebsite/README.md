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

测试模式启用 `/admin`、`/playground`、FontLab、ComponentLab 与本地写接口。写操作推荐在 `.env.local` 设置逗号或换行分隔的 `LOCAL_EDITOR_ACCESS_TOKENS`，每台电脑的浏览器通过 `x-local-editor-token` 请求头发送各自的一个 Token；原有单值 `LOCAL_EDITOR_ACCESS_TOKEN` 继续兼容。具体配置与浏览器启用方式见《配置指南》。Vercel 或其他生产环境变量存在时，本地编辑入口会被阻断。

## 检查与构建

```bash
npm run lint
npm run typecheck
npm test
npm run test:assets
npm run fonts:sync
npm run check
npm run build
npm run report:build
npm run start
```

`check` 会先验证按页面生成的公开 Puck 运行时、作品别名映射和公开字体子集没有过期，再依次执行 ESLint、TypeScript、全部 Node 测试和资源完整性检查。`build` 会先同步派生产物并执行完整 `check`，再由 Next 16 的 Webpack 路径构建生产产物；Turbopack 兼容性恢复作为独立维护任务处理。

`report:build` 只读取当前 Next 16 Webpack 产物中的固定 JSON 清单、逐路由 HTML、RSC 和 Client Reference Manifest，将每条公开路由真实执行或预加载的 JS、CSS、图片、字体与客户端组件交集写入 schema v3 的 `.next/build-report.json`。报告同时执行“字体预加载不超过 4 个且不超过 2.5 MB、图片预加载不超过 1 张”的预算，不再把全部共享资源重复计算给每个页面。

## 字体交付

- 字体选择、Typography 语义、字号、字重、行高和字距保持由 FontLab 控制；子集系统只改变公开网站传输的字体文件。
- `dev` 与 `dev:test` 会启动防抖监听器。保存 `content/pages`、FontLab、ComponentLab 预设、字体许可证清单或 `src/lib/public-copy.ts` 后，会自动重建一个全站公开字符集；页面组件类型变化还会自动重建按路由裁剪的 renderer 清单。
- `fonts:sync` 使用 `fonttools[woff]==4.63.0` 在 `.cache/font-tools` 建立项目级环境，生成确定性的 WOFF2、`PublicCharacterSetV1` 与 `PublicFontSubsetManifestV1`。原始字体不删除、不覆盖。
- 公开布局只声明已授权的子集字体和许可证受阻字体的按需完整文件；工具布局继续声明完整字体，确保 Admin、Puck、FontLab 和 ComponentLab 可显示尚未进入公开内容的字符。
- 字体授权清单位于 `content/fonts/font-licenses.json`。只有标记为 `verified + subset` 的字体才能生成衍生文件；证据不足的字体会记录为受阻项，不能通过替换字体规避。
- CI 与远程构建不会联网安装 FontTools。若提交的字符集、字体文件或 manifest 过期，构建会明确失败，要求先在本地执行 `npm run fonts:sync` 并提交生成文件。

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

不要另建 SEO 数据文件。联系内容统一维护在 About 页的 `#contact` 区块；站点不设独立联系页面。

## 路由与渲染

- `(site)` 承载公开路由、导航和公开动效。
- `(tools)` 承载管理端与实验室的实时 Context。
- 文件写 Route Handler 显式使用 Node.js runtime，并保留测试模式与 token 双重限制。
- 普通作品和灯光集合通过 `generateStaticParams()` 静态生成，未知 slug 返回 404。
- JSON 损坏、版本不兼容或读取失败会进入错误边界，不会伪装成 404。

公开渲染使用 Puck RSC 入口，并按当前页面实际出现的组件 type 构造运行时注册表；编辑器继续使用包含 fields 和 defaultProps 的完整配置。

组件注册以可序列化的 `PuckComponentDescriptor` 为静态事实源，统一生成组件类型、分类、公开 renderer 映射、ComponentLab 可见性和媒体布局 profile。复杂的 Puck 字段 schema 仍保留在独立配置中；公开站、Puck 预览和 ComponentLab 继续复用 canonical renderer，不新增平行 JSX。

图片由 `MediaLayoutProfile` 根据 12 列网格生成准确的 `sizes`。公开运行时从页面 JSON 选出唯一的 `PublicMediaHint`，每页最多预加载首个有效媒体；其余图片保持懒加载。图片完成状态由页面级协调器统一处理，不再为每张图创建独立监听器。

## 服务与客户端边界

- 公开内容读取由 `public-content-service` 提供，只读、`server-only` 且可复用 React 服务端缓存。
- 本地编辑器写入由 `local-editor-content-service` 提供，只供 Route Handler 使用。
- `LocalEditorRoutePolicy` 统一处理 Host、Origin、Token 与读写权限；API 不再复制鉴权分支。
- Navigation 只在首次点击、键盘聚焦或明确 hover 意图后加载抽屉。Lenis 在首屏后按需加载，并只在桌面精细指针且未启用减少动态效果时运行。
- Hero、ProjectSection、WorksListEntry 与 ContactFlashlight 使用服务端内容外壳和最小客户端交互岛，静态内容与图片不进入整块客户端组件。

## 部署

生产部署必须使用普通模式，不设置 `NEXT_PUBLIC_SITE_MODE=testing`，也不得暴露本地编辑 token。部署前执行：

将 `NEXT_PUBLIC_SITE_URL` 设置为公开站完整源地址，用于解析 Open Graph 图片；本地默认值为 `http://localhost:3000`。

```bash
npm ci
npm run build
```

`public/**` 图片及 `public/fonts/generated/**` 字体子集必须作为普通 Git 文件提交，严禁使用 Git LFS。字体视觉基线没有改变；公开站与创作工具只在交付文件和加载时机上分流。
