# 个人作品集网站文档

本文档详细说明了网站的页面结构、可用组件及其配置方式，用于指导 JSON 内容文件的编写。

---

## 目录

1. [页面结构](#页面结构)
2. [JSON 文件基础结构](#json-文件基础结构)
3. [组件详解](#组件详解)
   - [首页组件](#首页组件)
   - [作品列表组件](#作品列表组件)
   - [作品详情组件](#作品详情组件)
   - [Breakdown 组件](#breakdown-组件)
   - [Blocks 组件](#blocks-组件)
   - [Works 专用组件](#works-专用组件)
   - [通用组件](#通用组件)
4. [图片资源规范](#图片资源规范)
5. [完整示例](#完整示例)

---

## 页面结构

### 路由概览

| 路由路径 | JSON 文件位置 | 页面用途 |
|---------|-------------|---------|
| `/` 或 `/p` | `content/pages/index.json` | 首页，展示项目列表 |
| `/works` 或 `/p/works` | `content/pages/works.json` | 作品列表页 |
| `/works/[id]` 或 `/p/works/[id]` | `content/pages/works/[id].json` | 单个作品详情页 |
| `/contact` 或 `/p/contact` | `content/pages/contact.json` | 联系方式页 |
| `/works/lighting-portfolio` | `content/pages/works/lighting-portfolio.json` | 灯光作品集合页 |

### 路径说明

- `/p/` 前缀：CMS 预览模式下的路径
- 无前缀：生产环境路径
- 两种路径访问的是同一份 JSON 内容

---

## JSON 文件基础结构

每个 JSON 文件遵循以下基础结构：

```json
{
    "root": {
        "props": {
            "title": "页面标题"
        }
    },
    "content": [
        {
            "type": "组件名称",
            "props": {
                "id": "唯一标识符",
                "其他属性": "值"
            }
        }
    ]
}
```

### 重要说明

1. **`type`**：指定使用的组件名称，必须与本文档中列出的组件名称完全匹配
2. **`props.id`**：每个组件必须有唯一 id，用于 Puck 编辑器识别
3. **`content` 数组**：组件按数组顺序从上到下渲染
4. **数组字段**：包含数组的组件需要为每个数组项添加 `"_arrayItem": { "id": "xxx" }`

---

## 组件详解

### 首页组件

#### HeroSection

全屏英雄区域，展示网站主标题和背景图。

**用途**：仅用于首页顶部，作为网站入口视觉。

**配置项**：无（使用固定配置）

**JSON 示例**：
```json
{
    "type": "HeroSection",
    "props": {
        "id": "hero-section-1"
    }
}
```

---

#### ProjectSection

单个项目展示区块，包含背景图、标题和链接。

**用途**：首页滚动展示各个项目，每个项目占一屏高度。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `title` | string | 是 | 项目标题，大字显示 |
| `subtitle` | string | 否 | 副标题，显示在标题上方 |
| `imageSrc` | string | 是 | 背景图片路径 |
| `link` | string | 是 | 点击跳转链接 |
| `index` | number | 是 | 项目索引，影响布局方向（偶数左对齐，奇数右对齐） |

**JSON 示例**：
```json
{
    "type": "ProjectSection",
    "props": {
        "id": "proj-1",
        "title": "LIGHTING PORTFOLIO",
        "subtitle": "Lighting Art / Level Mood",
        "imageSrc": "/images/train-station/2Day.png",
        "link": "/p/works/lighting-portfolio",
        "index": 0
    }
}
```

---

### 作品列表组件

#### WorksList

作品列表组件，以列表形式展示所有作品。

**用途**：作品列表页，展示所有项目的概览。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `heading` | string | 否 | 列表标题，默认 "All Selected Works" |
| `works` | array | 是 | 作品数组 |

**works 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 作品唯一标识符 |
| `href` | string | 否 | 点击跳转链接，默认根据 id 生成 |
| `title` | string | 是 | 作品标题 |
| `category` | string | 是 | 作品分类 |
| `imageSrc` | string | 是 | 悬停时显示的背景图片 |
| `desc` | string | 是 | 作品简短描述 |

**JSON 示例**：
```json
{
    "type": "WorksList",
    "props": {
        "id": "workslist-1",
        "heading": "All Selected Works",
        "works": [
            {
                "id": "lighting-portfolio",
                "href": "/p/works/lighting-portfolio",
                "title": "LIGHTING PORTFOLIO",
                "category": "Lighting Art",
                "imageSrc": "/images/train-station/2Day.png",
                "desc": "A curated collection of lighting and mood practices",
                "_arrayItem": { "id": "w1" }
            }
        ]
    }
}
```

---

### 作品详情组件

#### HeroHeadline / BreakdownIntroHeader

作品详情页头部，展示项目标题、副标题和主图。

**用途**：作品详情页顶部，作为项目的首屏展示。

**注意**：`HeroHeadline` 和 `BreakdownIntroHeader` 功能相同，可互换使用。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `eyebrow` | string | 否 | 顶部小标签，如 "Project 01" |
| `title` | string | 是 | 项目标题，大字显示 |
| `subtitle` | string | 否 | 副标题描述 |
| `heroImage` | string | 是 | 主背景图片路径 |
| `navLink` | string | 否 | 外部链接（如 Bilibili 视频链接） |

**JSON 示例**：
```json
{
    "type": "HeroHeadline",
    "props": {
        "id": "hero-1",
        "eyebrow": "Project 02",
        "title": "INSIGHT",
        "subtitle": "",
        "heroImage": "/images/insight/InsightCover.png",
        "navLink": "https://www.bilibili.com/video/BV1gQbDzQEUL"
    }
}
```

---

#### RichParagraph

富文本段落组件，支持中英双语混排。

**用途**：作品详情页中的项目描述文本块。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `content` | string | 是 | 段落内容，支持中英混排 |

**JSON 示例**：
```json
{
    "type": "RichParagraph",
    "props": {
        "id": "desc-1",
        "content": "INSIGHT 是一款轻交互的互动叙事游戏。玩家在游戏中扮演一位网络舆情监管员。"
    }
}
```

---

#### BreakdownTriptych

三栏布局组件，用于展示项目的三个技术要点。

**用途**：作品详情页中展示技术细节，每个要点包含标题、描述和图片。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `col1Title` | string | 是 | 第一栏标题 |
| `col1Text` | string | 是 | 第一栏描述 |
| `col1Img` | string | 是 | 第一栏图片路径 |
| `col2Title` | string | 是 | 第二栏标题 |
| `col2Text` | string | 是 | 第二栏描述 |
| `col2Img` | string | 是 | 第二栏图片路径 |
| `col3Title` | string | 是 | 第三栏标题 |
| `col3Text` | string | 是 | 第三栏描述 |
| `col3Img` | string | 是 | 第三栏图片路径 |

**JSON 示例**：
```json
{
    "type": "BreakdownTriptych",
    "props": {
        "id": "triptych-1",
        "col1Title": "Articy Draft",
        "col1Text": "剧本写作使用了 Articy Draft，通过节点极为方便地实现多分支剧情流程树的管理。",
        "col1Img": "/images/insight/Code01.jpg",
        "col2Title": "框架逻辑",
        "col2Text": "Unreal Engine 蓝图深度结合对话树系统。",
        "col2Img": "/images/insight/Code02.jpg",
        "col3Title": "UI 设计",
        "col3Text": "拟真桌面操作系统 UI 设计。",
        "col3Img": "/images/insight/Shot01.jpg"
    }
}
```

---

#### MosaicGallery

全屏图片画廊组件。

**用途**：作品详情页中展示多张截图，每张图片占一屏高度。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `images` | array | 是 | 图片数组 |

**images 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `src` | string | 是 | 图片路径 |
| `caption` | string | 否 | 图片说明，显示在右下角 |

**JSON 示例**：
```json
{
    "type": "MosaicGallery",
    "props": {
        "id": "gallery-1",
        "images": [
            {
                "src": "/images/insight/Shot02.jpg",
                "caption": "截图 02",
                "_arrayItem": { "id": "img-1" }
            },
            {
                "src": "/images/insight/Shot03.jpg",
                "caption": "截图 03",
                "_arrayItem": { "id": "img-2" }
            }
        ]
    }
}
```

---

#### NextProjectBlock

下一个项目导航块。

**用途**：作品详情页底部，引导用户查看下一个项目。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `nextId` | string | 是 | 下一个项目的 id（用于生成链接） |
| `nextName` | string | 是 | 下一个项目的名称 |
| `nextBg` | string | 是 | 下一个项目的背景图片 |
| `href` | string | 否 | 自定义跳转链接，默认根据 nextId 生成 |

**JSON 示例**：
```json
{
    "type": "NextProjectBlock",
    "props": {
        "id": "next-1",
        "nextId": "slay-the-virus",
        "nextName": "SLAY THE VIRUS",
        "nextBg": "/images/slay-the-virus/STVTitle.png"
    }
}
```

---

### Breakdown 组件

以下组件用于构建更丰富的作品详情页面内容。

#### BreakdownHeadline

章节标题组件。

**用途**：在长页面中分隔不同章节。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `title` | string | 是 | 章节标题 |

**JSON 示例**：
```json
{
    "type": "BreakdownHeadline",
    "props": {
        "id": "headline-1",
        "title": "TECHNICAL BREAKDOWN"
    }
}
```

---

#### ImageSlider

图片对比滑块组件，用于展示前后对比效果。

**用途**：展示灯光前后对比、处理前后对比等场景。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `unlitSrc` | string | 是 | 对比前图片路径（左侧/初始状态） |
| `litSrc` | string | 是 | 对比后图片路径（右侧/最终状态） |
| `alt` | string | 否 | 图片替代文本 |

**JSON 示例**：
```json
{
    "type": "ImageSlider",
    "props": {
        "id": "slider-1",
        "unlitSrc": "/images/train-station/2Day.png",
        "litSrc": "/images/train-station/2Night.png",
        "alt": "Lighting Comparison"
    }
}
```

---

#### MediaTextCard

图文卡片组件，左侧文字右侧图片。

**用途**：展示单个技术要点的详细说明。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `title` | string | 是 | 卡片标题 |
| `description` | string | 是 | 详细描述，支持换行（使用 `\n`） |
| `imageSrc` | string | 否 | 右侧图片路径 |
| `tags` | array | 否 | 标签数组 |

**tags 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `tag` | string | 是 | 标签文本 |

**JSON 示例**：
```json
{
    "type": "MediaTextCard",
    "props": {
        "id": "card-1",
        "title": "Breakdown Title",
        "description": "这里是详细描述。\n可以换行。",
        "imageSrc": "/images/train-station/2Day.png",
        "tags": [
            { "tag": "Lighting", "_arrayItem": { "id": "tag-1" } },
            { "tag": "Unreal Engine", "_arrayItem": { "id": "tag-2" } }
        ]
    }
}
```

---

#### ParameterGrid

参数网格组件，用于展示技术参数和生成预览。

**用途**：展示程序化生成、技术参数等内容。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `mediaSrc` | string | 是 | 预览媒体路径（图片或视频） |
| `isVideo` | string | 否 | 是否为视频，可选值："true" / "false" |
| `parameters` | array | 否 | 参数数组 |

**parameters 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `name` | string | 是 | 参数名称 |
| `value` | string | 否 | 参数值（大字显示） |
| `description` | string | 是 | 参数描述 |

**JSON 示例**：
```json
{
    "type": "ParameterGrid",
    "props": {
        "id": "param-1",
        "mediaSrc": "/images/train-station/2Night.png",
        "isVideo": "false",
        "parameters": [
            {
                "name": "Global Illumination",
                "value": "Lumen",
                "description": "使用实时全局光照维持空间中的连续反弹。",
                "_arrayItem": { "id": "param-1" }
            }
        ]
    }
}
```

---

#### TextSplitLayout

图文分离布局组件。

**用途**：展示核心概念说明，支持三种布局变体。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `heading` | string | 是 | 标题 |
| `paragraphs` | array | 是 | 段落数组 |
| `imageSrc` | string | 否 | 图片路径 |
| `layoutVariant` | string | 否 | 布局变体：`split-left` / `split-right` / `stack` |

**layoutVariant 说明**：
- `split-left`：标题和图片在左，文字在右
- `split-right`：文字在左，标题和图片在右
- `stack`：垂直堆叠，居中对齐

**paragraphs 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `text` | string | 是 | 段落文本 |

**JSON 示例**：
```json
{
    "type": "TextSplitLayout",
    "props": {
        "id": "split-1",
        "heading": "CORE CONCEPT",
        "paragraphs": [
            { "text": "第一段说明文字。", "_arrayItem": { "id": "para-1" } },
            { "text": "第二段说明文字。", "_arrayItem": { "id": "para-2" } }
        ],
        "imageSrc": "/images/train-station/2Day.png",
        "layoutVariant": "split-left"
    }
}
```

---

#### HighDensityInfoBlock

高密度信息块组件，三栏展示项目的三个阶段。

**用途**：展示项目的背景、架构和执行结果。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `phase1Title` | string | 是 | 第一阶段标题 |
| `phase1Subtitle` | string | 否 | 第一阶段副标题 |
| `phase1Content` | string | 是 | 第一阶段内容 |
| `phase1Items` | array | 否 | 第一阶段元数据项 |
| `phase2Title` | string | 是 | 第二阶段标题 |
| `phase2Subtitle` | string | 否 | 第二阶段副标题 |
| `phase2Content` | string | 是 | 第二阶段内容 |
| `phase2Items` | array | 否 | 第二阶段元数据项 |
| `phase3Title` | string | 是 | 第三阶段标题 |
| `phase3Subtitle` | string | 否 | 第三阶段副标题 |
| `phase3Content` | string | 是 | 第三阶段内容 |
| `phase3ImageSrc` | string | 否 | 第三阶段图片 |

**phaseItems 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `label` | string | 是 | 标签 |
| `value` | string | 是 | 值 |

**JSON 示例**：
```json
{
    "type": "HighDensityInfoBlock",
    "props": {
        "id": "info-1",
        "phase1Title": "Context",
        "phase1Content": "问题背景与起始约束说明。",
        "phase1Items": [
            { "label": "引擎", "value": "Unreal Engine 5", "_arrayItem": { "id": "item-1" } }
        ],
        "phase2Title": "Architecture",
        "phase2Content": "具体方案结构说明。",
        "phase2Items": [],
        "phase3Title": "Execution",
        "phase3Content": "方法与结果说明。",
        "phase3ImageSrc": "/images/train-station/2Day.png"
    }
}
```

---

### Blocks 组件

#### ContactFlashlight

联系页面组件，带有手电筒跟随效果。

**用途**：联系页面，展示个人信息、经历和联系方式。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `maskRadius` | number | 否 | 手电筒光圈半径，默认 500 |
| `maskSmoothness` | number | 否 | 光圈边缘平滑度，默认 40 |
| `darkTextColor` | string | 否 | 暗色文字颜色 |
| `lightTextColor` | string | 否 | 亮色文字颜色 |
| `name` | string | 否 | 姓名 |
| `taglineText` | string | 否 | 标语文字 |
| `taglineSub` | string | 否 | 标语副文字 |
| `email` | string | 否 | 邮箱地址 |
| `wechat` | string | 否 | 微信号 |
| `experienceHistory` | array | 否 | 经历列表 |
| `creativeDirection` | array | 否 | 创作方向列表 |

**experienceHistory 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `company` | string | 是 | 公司名称 |
| `role` | string | 是 | 职位 |

**creativeDirection 数组项配置**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `title` | string | 是 | 方向标题 |
| `subtitle` | string | 是 | 方向副标题 |

**JSON 示例**：
```json
{
    "type": "ContactFlashlight",
    "props": {
        "id": "contact-1",
        "maskRadius": 500,
        "maskSmoothness": 40,
        "name": "JIANG CHENGYAN",
        "taglineText": "艺术与科技 / 交互叙事设计 / 游戏设计",
        "taglineSub": "CUC '2028",
        "email": "example@email.com",
        "wechat": "your_wechat_id",
        "experienceHistory": [
            {
                "company": "腾讯光子工作室",
                "role": "Lighting Technical Art Intern",
                "_arrayItem": { "id": "exp-1" }
            }
        ],
        "creativeDirection": [
            {
                "title": "交互叙事与关卡设计",
                "subtitle": "Interactive Narrative & Level Design",
                "_arrayItem": { "id": "cd-1" }
            }
        ]
    }
}
```

---

### Works 专用组件

#### PortfolioHeroHeader

作品集合页头部组件。

**用途**：作品集合页（如 Lighting Portfolio）的顶部标题区域。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `title` | string | 是 | 主标题（大字） |
| `subtitle` | string | 是 | 副标题（大字，半透明） |
| `descriptionLine1` | string | 否 | 描述第一行 |
| `descriptionLine2` | string | 否 | 描述第二行 |

**JSON 示例**：
```json
{
    "type": "PortfolioHeroHeader",
    "props": {
        "id": "hero-1",
        "title": "LIGHTING",
        "subtitle": "PORTFOLIO",
        "descriptionLine1": "A Curated Selection",
        "descriptionLine2": "Unreal Engine 5"
    }
}
```

---

#### LightingProjectCard

灯光作品卡片组件。

**用途**：作品集合页中展示单个作品卡片。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `number` | string | 是 | 编号（如 "01"） |
| `title` | string | 是 | 作品标题 |
| `coverImage` | string | 是 | 封面图片路径 |
| `href` | string | 否 | 点击跳转链接 |

**JSON 示例**：
```json
{
    "type": "LightingProjectCard",
    "props": {
        "id": "card-1",
        "number": "01",
        "title": "CITY ADD",
        "coverImage": "/images/city-2026/002.PNG",
        "href": "/p/works/lighting-atmosphere"
    }
}
```

---

### 通用组件

#### ImagePanel

图片展示面板组件。

**用途**：展示单张图片，带有可选说明。

**配置项**：

| 字段名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `id` | string | 是 | 唯一标识符 |
| `src` | string | 是 | 图片路径 |
| `alt` | string | 是 | 图片替代文本 |
| `caption` | string | 否 | 图片说明 |

**JSON 示例**：
```json
{
    "type": "ImagePanel",
    "props": {
        "id": "panel-1",
        "src": "/images/train-station/2Day.png",
        "alt": "Main View",
        "caption": "Visual block"
    }
}
```

---

## 图片资源规范

### 图片路径格式

所有图片路径以 `/images/` 开头，指向 `public/images/` 目录：

```
/images/文件夹名/文件名.扩展名
```

### 现有图片目录结构

```
public/images/
├── covers/              # 网站封面图
│   ├── 2025/
│   └── 2026/
├── insight/             # INSIGHT 项目图片
├── prometheus/          # PROMETHEUS 项目图片
├── slay-the-virus/      # SLAY THE VIRUS 项目图片
├── train-station/       # 火车站场景图片
├── city-2026/           # 城市场景图片
├── rainforest/          # 雨林场景图片
├── west/                # 西部场景图片
├── penguin/             # 企鹅贸易公司项目图片
│   └── PCG/             # 程序化生成图片
├── holy-tank/           # 帅油桶项目图片
└── lighting/            # 灯光对比图片
```

### 添加新图片

1. 将图片文件放入 `public/images/` 下的相应目录
2. 在 JSON 中使用路径 `/images/目录名/文件名.扩展名` 引用

### 图片命名建议

- 使用英文和数字
- 使用连字符 `-` 分隔单词
- 避免空格和特殊字符
- 示例：`train-station-day.png`

---

## 完整示例

### 首页示例 (index.json)

```json
{
    "root": {
        "props": {
            "title": "Home"
        }
    },
    "content": [
        {
            "type": "HeroSection",
            "props": {
                "id": "hero-section-1"
            }
        },
        {
            "type": "ProjectSection",
            "props": {
                "id": "proj-1",
                "title": "LIGHTING PORTFOLIO",
                "subtitle": "Lighting Art / Level Mood",
                "imageSrc": "/images/train-station/2Day.png",
                "link": "/p/works/lighting-portfolio",
                "index": 0
            }
        },
        {
            "type": "ProjectSection",
            "props": {
                "id": "proj-2",
                "title": "INSIGHT",
                "subtitle": "Lead Designer / Programmer",
                "imageSrc": "/images/insight/InsightCover.png",
                "link": "/p/works/insight",
                "index": 1
            }
        }
    ]
}
```

### 作品详情页示例 (works/insight.json)

```json
{
    "root": {
        "props": {
            "title": "INSIGHT"
        }
    },
    "content": [
        {
            "type": "HeroHeadline",
            "props": {
                "id": "hero-1",
                "eyebrow": "Project 02",
                "title": "INSIGHT",
                "subtitle": "",
                "heroImage": "/images/insight/InsightCover.png",
                "navLink": "https://www.bilibili.com/video/BV1gQbDzQEUL"
            }
        },
        {
            "type": "RichParagraph",
            "props": {
                "id": "desc-1",
                "content": "INSIGHT 是一款轻交互的互动叙事游戏。玩家在游戏中扮演一位网络舆情监管员。"
            }
        },
        {
            "type": "BreakdownTriptych",
            "props": {
                "id": "triptych-1",
                "col1Title": "Articy Draft",
                "col1Text": "剧本写作使用了 Articy Draft。",
                "col1Img": "/images/insight/Code01.jpg",
                "col2Title": "框架逻辑",
                "col2Text": "Unreal Engine 蓝图深度结合对话树系统。",
                "col2Img": "/images/insight/Code02.jpg",
                "col3Title": "UI 设计",
                "col3Text": "拟真桌面操作系统 UI 设计。",
                "col3Img": "/images/insight/Shot01.jpg"
            }
        },
        {
            "type": "MosaicGallery",
            "props": {
                "id": "gallery-1",
                "images": [
                    {
                        "src": "/images/insight/Shot02.jpg",
                        "caption": "截图 02",
                        "_arrayItem": { "id": "img-1" }
                    },
                    {
                        "src": "/images/insight/Shot03.jpg",
                        "caption": "截图 03",
                        "_arrayItem": { "id": "img-2" }
                    }
                ]
            }
        },
        {
            "type": "NextProjectBlock",
            "props": {
                "id": "next-1",
                "nextId": "slay-the-virus",
                "nextName": "SLAY THE VIRUS",
                "nextBg": "/images/slay-the-virus/STVTitle.png"
            }
        }
    ]
}
```

### 联系页示例 (contact.json)

```json
{
    "root": {
        "props": {
            "title": "Contact Page"
        }
    },
    "content": [
        {
            "type": "ContactFlashlight",
            "props": {
                "id": "contact-1",
                "name": "JIANG CHENGYAN",
                "taglineText": "艺术与科技 / 交互叙事设计 / 游戏设计",
                "taglineSub": "CUC '2028",
                "email": "your@email.com",
                "wechat": "your_wechat_id",
                "experienceHistory": [
                    {
                        "company": "腾讯光子工作室",
                        "role": "Lighting Technical Art Intern",
                        "_arrayItem": { "id": "exp-1" }
                    }
                ],
                "creativeDirection": [
                    {
                        "title": "交互叙事与关卡设计",
                        "subtitle": "Interactive Narrative & Level Design",
                        "_arrayItem": { "id": "cd-1" }
                    }
                ]
            }
        }
    ]
}
```

---

## 组件使用场景速查表

| 页面类型 | 推荐组件组合 |
|---------|------------|
| 首页 | `HeroSection` + `ProjectSection` × N |
| 作品列表 | `WorksList` |
| 作品详情（简单） | `HeroHeadline` + `RichParagraph` + `BreakdownTriptych` + `MosaicGallery` + `NextProjectBlock` |
| 作品详情（复杂） | `HeroHeadline` + `RichParagraph` + `BreakdownHeadline` + `TextSplitLayout` + `ImageSlider` + `HighDensityInfoBlock` + `ParameterGrid` + `MosaicGallery` + `NextProjectBlock` |
| 作品集合 | `PortfolioHeroHeader` + `LightingProjectCard` × N |
| 联系页 | `ContactFlashlight` |

---

## 注意事项

1. **组件顺序**：`content` 数组中的组件按顺序渲染，注意逻辑顺序
2. **唯一 ID**：每个组件的 `id` 必须在整个 JSON 文件中唯一
3. **数组项标记**：所有数组项必须包含 `"_arrayItem": { "id": "xxx" }`
4. **路径格式**：图片路径和链接路径使用 `/p/` 前缀以兼容预览模式
5. **双语文本**：大部分文本字段支持中英混排，系统会自动识别并应用不同字体

---

*文档版本：1.0*
*最后更新：2026-03-06*
