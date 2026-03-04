# Puck CMS 架构集成项目：工程执行规格与 PRD (致 Codex 5.3x)

本文档是将架构蓝图转化为可被完全自动化系统 (Codex级) 严格无偏差执行的工程包。请严格遵照以下 7 大执行面进行开发。

---

## 1. 假设与前置条件清单
为消除不确定性，本工程执行基于以下“合理默认且锁死”的前置条件：
- **Next.js 版本**：14.x (App Router 模式)。原因：稳定性最强，且方案中的路由和 API 机制与 14 完全契合。
- **App Router**：启用 (`src/app/` 结构)。
- **Turbopack**：不依赖/不默认启用。忽略 Watch 的机制优先考虑 Webpack (修改 `next.config.mjs`)，即使在 Turbopack 下也必须通过物理隔离 (移出 src/) 来保底。
- **Node 版本**：Node 18+ (包含原生的 `fs/promises` 支持)。
- **Puck 版本**：最新稳定版 (`@measured/puck@latest`)。
- **站点 CSS 的位置**：`src/app/globals.css`。这是注入 iframe 隔离层时的写死路径。
- **运行平台区分**：本地 `npm run dev` 用于排版编辑；Vercel 生产用于纯静态托管 (SSG)。

---

## 2. 最终目录结构与关键文件列表
绝对禁止出现二选一方案，以下路径完全写死，Codex 必须原样创建：

- **`content/pages/**/*.json`**：存放生成的静态排版数据。**严格放在项目根目录**，严禁放入 `src/` 以彻底规避热更新 (HMR) 闪烁。
- **`src/puck/config.tsx`**：Puck 的语义化积木组件注册中心与配置入口。
- **`src/app/admin/[[...puckPath]]/page.tsx`**：本地可视化编辑器入口。包含 iframe 隔离配置与安全拦截。
- **`src/app/api/puck/route.ts`**：后台保存 JSON 的专属接口，内置安全过滤、并发排队与同目录原子写入操作。
- **`src/app/api/upload/route.ts`**：本地热上传专属接口，内置严格清洗与统一错误规范。
- **`src/app/p/[[...slug]]/page.tsx`**：过渡期前台 JSON 消费路由。由于原有页面不可立刻删除的安全红线，新网页在过渡期全量落在 `/p/` 下。
- **`src/lib/security.ts`**：统管 `/admin` 与两组 API 的共享拦截防线 `assertLocalEditorAccess(type)`。
- **【新增】`public/puck-preview.css`**：为 Puck iframe 专供的稳定样式入口，由单独命令生成。
- **`next.config.mjs`**：必须修改，增加 `webpack` 配置，将根目录的 `content/pages` 加入 `watchOptions.ignored`。

---

## 3. 硬性规范 → 可测试验收项映射表 (含核心防冲破基准)

| 规范类别 | 验收项描述 | 实现位置 | 验收方式 | 失败判定 (即拦截生效边界) |
| :--- | :--- | :--- | :--- | :--- |
| **【修订】安全锁死黑名单** | `NODE_ENV===development` 且 `NEXT_PUBLIC_ENABLE_PUCK===true`，且绝对不存在生产环境变量（拦截名单死锁：`VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_GIT_PROVIDER`, `VERCEL_GIT_COMMIT_SHA`, `CI`）。任何一个存在即阻断。 | `src/lib/security.ts` 导出 `assertLocalEditorAccess()` | 分别设置以上变量跑 `pnpm dev` 访问 `/admin`。 | 必须返回阻断；行为见下方统一响应策略。 |
| **【新增】Guard 统一响应与防爆盾** | 必须由唯一的 `assertLocalEditorAccess(type)` 接管。对于 Page：调用 Next.js `notFound()` 隐藏后台存在性。对于 API 路由：返回 JSON `{ error: { code: "UNAUTHORIZED", message: "Editor access denied" } }` 及 `403` HTTP 码，**且强行附加 `Cache-Control: no-store`** 响应头防止 CDN 缓存。 | `/admin/page.tsx` 及 `/api/*` 顶部。代码物理审查 import 同一函数。 | 1. 关环境变量访问；2. `CI=1` 启动访问；3. 常规正常访问。 | 响应不是隐藏的 404 或没有防缓存的 JSON 403，抑或代码实现未复用。 |
| **fs 直读配置** | 获取 JSON 必须用原生的 Node API 而非 bundler `import`。 | `src/app/p/[[...slug]]/page.tsx` | 代码审查不得含 `import from...json`。 | 使用 import 导致页面迟滞刷新或构建报错。 |
| **【修订】路由 Slug 清洗与投毒边界** | URL 统一 lowercase。多斜杠 `//` 强制合并 (`/`)。遇到 `\`、未编码或 `%2e%2e`（即 `..`）等目录穿越符强制拒绝并抛 400。URL 请求必须进行 `decodeURIComponent` 解码处理。**路径映射死锁：**`/p` 和 `/p/` ->找 `index.json`； `/p/a/b` -> 找 `a/b.json`。 | 所有的 slug 读取与存储入口。 | 存取时输入 `/p//A/..` -> 返回 HTTP 400 Bad Request。 | 映射到错位文件或发生沙盒外的物理写入。 |
| **【修订】静态构建(SSG)无视版本的强证明** | 禁止查控制台圆点玄学。强校验规则死锁：1) `generateStaticParams` 必须同步深度遍历枚举所有可用后缀；2) 组件内**绝对禁止**任何 `cookies()`, `headers()` 或 `force-dynamic` 声明；3) 不许存在 `revalidate` 配置；4) **终极验收：执行 `next start` 后**快速访问 `/p/` 下路由多遍，不该触发任何服务器耗时挂起日志（彻底缓存）。 | `src/app/p/[[...slug]]/page.tsx` | 执行 `npm run build && npm run start`，检查启动后路由响应耗时和痕迹。 | 存在遗漏枚举，或 `start` 后访问页面发生了服务端构建再渲染表现。 |
| **【修订】Iframe CSS/字体刚性注入主方案** | **主方案抛弃哈希，采用固定外挂：**在 package.json 增加 script 如 `npx tailwindcss -i src/app/globals.css -o public/puck-preview.css` 生成静态挂载点。在 `<Puck iframe={{ enabled: true }}>` 中注入 `<link href="/puck-preview.css">`。针对 fonts，由 `globals.css` 中暴露出带 css变量控制的 font-family 发射给 iframe 内部即可一致。 | Tailwind 单独打钩脚本 + `<Puck>` 配置 | `/admin` 中使用 DevTools 计算面板内 DOM。 | font-family 降级为默认，内外 margin 差距错误明显。 |
| **【修订】确信的 API 统一错误返回态** | 上传 API 不设体积控制。死锁禁止 SVG (`*.svg`)。错误情况如 SVG 返回 `{ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "..." } }` (415)；错误情况如路径含 `../` 返回 `BAD_REQUEST` (400)。成功时的标准死锁： `{ url: "/images/puck/生成的特征名" }`。 | `src/app/api/upload/route.ts` | 尝试 POST 伪装的 `.svg` 或包含恶心的 `../`。 | 未按上述契约死死的格式进行抛送。 |
| **【修订】原子并发写与内存队列死锁** | 数据写入 `[slug].tmp.json` 再 `fs.rename` 原子覆盖老文件防截断。**并发死锁**：服务端内设置一把全局锁 `const writeQueue = new Map<string, Promise<void>>()` 保证同一 slug 排出串行串。无论写成或失败，`tmp` 必须要 `unlink` 清扫残局，绝不留半段空壳。 | `src/app/api/puck/route.ts` | 采用循环并发脚本：`Promise.all` 连击提交同一个 API。 | 破坏出了残缺括号或直接白屏抛服务端读取错。 |

---

## 4. 分阶段实施计划
### 阶段 1：基础设施与守卫
- 重点编写统一复用的 `assertLocalEditorAccess(type)`，实现 404 页遮掩与 API `no-store`，测试各种 CI 变量阻断情况。
### 阶段 2：Puck 引擎与样式隔离墙
- 重点使用外挂 npm script 并构 `puck-preview.css`；在 Puck `<iframe/>` 组件中彻底 `<link>` 入，对齐一切字体内边距。
### 阶段 3：本地化持久层 (API)
- 重点开发 API 后端保存，基于 `Map` 的队列上锁并在原级目录下完成 `tmp` 原子覆盖操作；约束上传并阻击 svg 和越权目录。
### 阶段 4：前台灰度稳健消费
- 依靠安全死准星开发 `generateStaticParams()` 遍历 Json 文件树；绝不牵扯 `force-dynamic` 或者 Header 强读。
### 阶段 5：单页代码数据提纯迁移 (lighting-portfolio)
- 人工双开验证原界面与被搭建好的 CMS 画布。实现置换。

---

## 5. 安全红线与威胁模型防泄漏
- **API Cache Poisoning**：Guard 通过注入 `Cache-Control: no-store` 彻底废除 Edge 的 403 静态分发错误死链。
- **并发碎裂 (Race Conditions)**：对同文件的 `Map Queue` 并发防撕裂队列，加上同目录操作系统最核的 `.tmp -> rename` 原子替换大法，杜绝大字节量下的空 JSON 或截断现象。

