# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 14 的个人作品集网站，采用 App Router 架构。项目使用 TypeScript、Tailwind CSS 和 Framer Motion 构建，集成了 Puck CMS 可视化编辑器用于内容管理。

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（常规模式）
npm run dev

# 启动测试模式（启用 Puck CMS 编辑器，可访问 /admin 和 /playground）
npm run dev:test

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 运行 slug 验证测试
npm run test:slug

# 构建 Puck 预览样式
npm run build:puck-preview-css
```

## 核心架构

### 双模式系统

项目支持两种内容模式，通过环境变量 `NEXT_PUBLIC_SITE_MODE` 控制：

- **常规模式** (`npm run dev`)：使用硬编码数据，`/admin` 路由不可访问
- **测试模式** (`npm run dev:test`)：启用 Puck CMS，可访问 `/admin` 进行可视化编辑，内容保存到 `content/pages/*.json`

### 路由结构

- `/` - 首页（英雄区 + 项目展示）
- `/works` - 作品列表页（网格布局）
- `/works/[id]` - 作品详情页（breakdown 展示）
- `/works/lighting-portfolio` - 灯光作品集索引
- `/works/lighting-portfolio/[id]` - 灯光作品详情
- `/contact` - 联系页（手电筒交互效果）
- `/playground` - 仅测试模式可见
- `/admin` - Puck CMS 编辑器（仅测试模式）
- `/p/[[...slug]]` - Puck 渲染的动态页面

### 中间件逻辑

`src/middleware.ts` 实现：
- 测试模式下将 `/works`、`/contact` 等路由重定向到 `/p/*` 对应的 CMS 页面
- Puck 路径安全验证，阻止路径遍历攻击（`..`、`%2e%2e`、反斜杠等）

### 内容管理

- **硬编码数据**：位于各页面组件内部（如 `src/app/works/[id]/page.tsx` 的 `projectsData`）
- **CMS 数据**：存储在 `content/pages/*.json`，通过 Puck 编辑器管理
- **图片资源**：统一放置在 `public/images/` 下，按项目分文件夹组织

## 设计系统

### 颜色规范

- 背景：纯黑 `#000000` 或 `bg-black`
- 主文本：`text-white` 用于标题和强调
- 次级文本：`text-white/70`、`text-white/50`、`text-white/40` 建立层次
- 边框/分割线：`border-white/10`、`border-white/20` 极弱对比

### 字体系统

- **Display 字体** (`font-luna`, `font-futura`)：超大标题，极粗字重，紧凑字距
- **Serif** (`font-serif`, Noto Serif SC)：正文、副标题，优雅感
- **Mono** (`font-mono`)：年份、标签、辅助文字，全大写，超宽字距

### 布局原则

- 采用 12 列网格系统（移动端 4 列）
- 不对称布局，通过 `col-start` 和 `col-span` 控制留白
- 避免简单居中堆砌，强调视觉层次和呼吸感

### 交互特性

- **自定义光标**：全站隐藏系统光标，使用白色圆圈跟随，`mix-blend-mode: difference`
- **作品列表悬停**：文字从幽灵描边变为实心白，背景显示预览图，微小位移
- **手电筒效果**：Contact 页面使用 radial gradient mask 跟随鼠标
- **图片对比滑块**：灯光作品支持 lit/unlit 对比，拖动滑块查看

## 关键组件

### Breakdown 组件（作品详情页）

位于 `src/components/breakdowns/`：
- `BreakdownHeadline` - 标题区
- `BreakdownTriptych` - 三栏技术展示
- `ImageSlider` - 光照对比滑块（支持 `litImg`/`unlitImg`）
- `MosaicGallery` - 图片画廊
- `ParameterGrid` - 参数网格
- `MediaTextCard` - 图文卡片
- `TextSplitLayout` - 文本分栏布局
- `HighDensityInfoBlock` - 高密度信息块
- `MetaDataBlock` - 元数据展示

### Puck CMS 配置

- 配置文件：`src/puck/config.tsx`
- 所有 breakdown 组件已注册为 Puck 组件，可在编辑器中拖拽使用
- 编辑器客户端：`src/puck/editor-client.tsx`
- 渲染客户端：`src/puck/render-client.tsx`

## 数据结构

### 作品数据字段

```typescript
{
  title: string;           // 作品标题
  idNum: string;          // 编号（如 "01"）
  heroImage: string;      // 英雄区图片路径
  description: string;    // 描述文案
  col1/col2/col3: {       // 三栏展示
    title: string;
    text: string;
    img: string;
  };
  gallery: string[] | Array<{  // 图库（支持对比）
    litImg: string;
    unlitImg?: string;
    caption?: string;
  }>;
  navLink?: string;       // 外部链接
  nextId: string;         // 下一个作品 ID
  nextName: string;       // 下一个作品名称
  nextBg: string;         // 下一个作品背景图
}
```

## 重要文档

- `网页风格和规范.md` - 详细的设计规范和视觉语言定义
- `配置指南.md` - 内容配置、添加作品、Puck 使用指南
- `PortfolioData.md` - 作品集数据结构说明

## 安全注意事项

- Puck 路径验证在 `src/middleware.ts` 和 `src/lib/puck-slug.test.ts` 中实现
- 禁止路径遍历：`..`、`%2e%2e`、`%2f`、反斜杠、空字节等均被拦截
- 测试模式仅用于本地开发，生产环境应使用常规模式

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **动画**：Framer Motion
- **平滑滚动**：Lenis
- **CMS**：Puck (@measured/puck)
- **图标**：Lucide React

## 开发注意事项

1. 修改设计时必须遵循 `网页风格和规范.md` 中的规范
2. 添加新作品参考 `配置指南.md` 的步骤
3. 图片路径必须以 `/images/` 开头，对应 `public/images/` 目录
4. 所有作品 ID 必须唯一
5. 不得输出任何 Emoji
6. 不得进行破坏性操作（删除文件夹、硬盘、git 仓库）
7. 删除文件前必须明确征得用户同意
