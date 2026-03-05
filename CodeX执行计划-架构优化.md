# CodeX 架构优化执行计划

## 执行原则

1. **严格按顺序执行**：每个阶段完成后必须验证功能正常再进入下一阶段
2. **保持视觉效果**：所有图片优化必须保持原始质量，不得降低画质
3. **渐进式重构**：每次改动范围可控，便于回滚
4. **验证方式**：每阶段完成后运行 `npm run dev`，检查关键页面是否正常显示

---

## 阶段 1：修复损坏的图片引用（404 问题）

### 任务 1.1：修复 TrainStation 图片引用

**文件**：`src/puck/config.tsx` (line 240-241)

**当前代码**：
```typescript
images: [
  { src: "/images/TrainStation/2Day.png", caption: "Main View", _arrayItem: { id: "img-1" } },
  { src: "/images/TrainStation/1Day.png", caption: "Detail 1", _arrayItem: { id: "img-2" } },
  { src: "/images/TrainStation/3Day.png", caption: "Detail 2", _arrayItem: { id: "img-3" } },
]
```

**修改为**：
```typescript
images: [
  { src: "/images/TrainStation/2Day.png", caption: "Main View", _arrayItem: { id: "img-1" } },
  { src: "/images/TrainStation/Day.png", caption: "Detail 1", _arrayItem: { id: "img-2" } },
  { src: "/images/TrainStation/Cut2Day.png", caption: "Detail 2", _arrayItem: { id: "img-3" } },
]
```

### 任务 1.2：修复项目封面图片引用

**文件**：`src/data/projects.ts`

**需要修改的项目封面路径**：

1. **INSIGHT** (line 21)：
   - 当前：`coverUrl: '/assets/images/insight-cover.jpg'`
   - 修改为：`coverUrl: '/images/Insight/InsightCover.png'`

2. **PENGUIN TRADING** (line 44)：
   - 当前：`coverUrl: '/assets/images/penguin-cover.jpg'`
   - 修改为：`coverUrl: '/images/Others/Epic.png'`

3. **SLAY THE VIRUS** (line 57)：
   - 当前：`coverUrl: '/assets/images/virus-cover.jpg'`
   - 修改为：`coverUrl: '/images/STV/STVTitle.png'`

4. **THE PROMETHEUS PROJECT** (line 70)：
   - 当前：`coverUrl: '/assets/images/prometheus-cover.jpg'`
   - 需要先检查 Prometheus 目录中的实际文件，选择合适的封面图

5. **LIGHTING & TECH** (line 83)：
   - 当前：`coverUrl: '/assets/images/lighting-cover.jpg'`
   - 修改为：`coverUrl: '/images/Test/lit.jpg'`

**验证点**：运行 `npm run dev`，检查所有项目封面是否正常显示，无 404 错误

---

## 阶段 2：优化 public/images 目录结构

### 当前问题
- 中文文件夹名：`雨林`、`封面和结尾`
- 命名不规范：`STV`、`Others`、`Test`
- 与项目 ID 不对应

### 任务 2.1：规范化目录命名并统一映射关系

**目录重命名映射表**：

| 当前名称 | 新名称 | 对应项目 ID | 说明 |
|---------|--------|------------|------|
| Insight | insight | insight | 统一为小写 |
| STV | slay-the-virus | slay-the-virus | 与项目 ID 对应 |
| Others | penguin | penguin | 企鹅贸易项目 |
| Prometheus | prometheus | prometheus | 统一为小写 |
| Test | lighting | lighting | 灯光项目 |
| TrainStation | train-station | - | 规范命名 |
| 雨林 | rainforest | - | 中文转英文 |
| 封面和结尾 | covers | - | 中文转英文 |
| West | west | - | 统一为小写 |
| City2026Add | city-2026 | - | 规范命名 |
| HolyTank | holy-tank | - | 规范命名 |
| puck | puck | - | 保持不变 |

### 任务 2.2：执行目录重命名

**执行步骤**（按顺序）：

```bash
cd public/images

# 重命名项目目录
mv Insight insight
mv STV slay-the-virus
mv Others penguin
mv Prometheus prometheus
mv Test lighting
mv TrainStation train-station
mv 雨林 rainforest
mv 封面和结尾 covers
mv West west
mv City2026Add city-2026
mv HolyTank holy-tank
```

### 任务 2.3：更新所有代码中的图片路径引用

**需要全局搜索替换的路径**：

1. `/images/Insight/` → `/images/insight/`
2. `/images/STV/` → `/images/slay-the-virus/`
3. `/images/Others/` → `/images/penguin/`
4. `/images/Prometheus/` → `/images/prometheus/`
5. `/images/Test/` → `/images/lighting/`
6. `/images/TrainStation/` → `/images/train-station/`
7. `/images/雨林/` → `/images/rainforest/`
8. `/images/封面和结尾/` → `/images/covers/`
9. `/images/West/` → `/images/west/`
10. `/images/City2026Add/` → `/images/city-2026/`
11. `/images/HolyTank/` → `/images/holy-tank/`

**需要检查的文件**：
- `src/data/projects.ts`
- `src/components/**/*.tsx`
- `src/puck/config.tsx`
- `src/app/**/page.tsx`

**验证点**：
1. 全局搜索旧路径，确认无遗漏
2. 运行 `npm run dev`，逐页检查图片显示
3. 检查浏览器控制台无 404 错误

---

## 阶段 3：图片优化 - 转换为 Next.js Image 组件

### 原则
- 使用 `next/image` 的 `<Image>` 组件替换所有 `<img>` 标签
- 保持原图质量：设置 `quality={95}`
- 添加适当的 `width` 和 `height` 属性
- 启用懒加载（Image 组件默认行为）

### 任务 3.1：优化首屏关键组件

**优先级顺序**（从高到低）：
1. `src/components/home/HeroSection.tsx` (line 43)
2. `src/components/home/ProjectSection.tsx` (line 52)
3. `src/components/works/ClientBreakdown.tsx` (line 68, 126)
4. `src/components/works/LightingProjectCard.tsx` (line 35)

**修改模式示例**：

**修改前**：
```tsx
<img
  src="/images/penguin/CyberRestaurant.png"
  alt="Cyber Restaurant"
  className="w-full h-auto"
/>
```

**修改后**：
```tsx
import Image from 'next/image'

<Image
  src="/images/penguin/CyberRestaurant.png"
  alt="Cyber Restaurant"
  width={1920}
  height={1080}
  quality={95}
  className="w-full h-auto"
  priority={true}  // 仅首屏图片使用
/>
```

**注意事项**：
- 首屏图片使用 `priority={true}` 避免 LCP 警告
- 非首屏图片不加 `priority`，利用默认懒加载
- `width` 和 `height` 需要根据实际图片尺寸设置
- 保持 `quality={95}` 确保高质量输出

### 任务 3.2：批量转换其他组件中的图片

**需要检查和转换的组件**：
- `src/components/breakdowns/*.tsx` 中所有使用 `<img>` 的地方
- `src/components/works/*.tsx` 中所有使用 `<img>` 的地方
- `src/app/**/page.tsx` 中所有使用 `<img>` 的地方

**验证点**：
1. 运行 `npm run dev`，检查所有页面图片正常显示
2. 检查浏览器 Network 面板，确认图片请求使用了 Next.js 优化路径（`/_next/image?url=...`）
3. 确认图片质量无损失

---

## 阶段 4：组件架构优化

### 任务 4.1：创建 common 组件目录

```bash
mkdir -p src/components/common
```

### 任务 4.2：创建统一的图片组件

**新建文件**：`src/components/common/OptimizedImage.tsx`

```typescript
import Image from 'next/image'
import { ComponentProps } from 'react'

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, 'src'> {
  src: string
  alt: string
  priority?: boolean
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  quality = 95,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      quality={quality}
      {...props}
    />
  )
}
```

### 任务 4.3：创建项目封面组件

**新建文件**：`src/components/common/ProjectCover.tsx`

```typescript
import { OptimizedImage } from './OptimizedImage'

interface ProjectCoverProps {
  src: string
  alt: string
  priority?: boolean
}

export function ProjectCover({ src, alt, priority = false }: ProjectCoverProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      priority={priority}
      className="w-full h-auto object-cover"
    />
  )
}
```

### 任务 4.4：重构现有组件使用新的图片组件

**示例**：将 `HeroSection.tsx` 中的图片改为使用 `OptimizedImage`

**修改前**：
```tsx
<Image src="..." alt="..." width={...} height={...} />
```

**修改后**：
```tsx
import { OptimizedImage } from '@/components/common/OptimizedImage'

<OptimizedImage src="..." alt="..." width={...} height={...} priority />
```

**验证点**：功能保持不变，代码更简洁统一

---

## 阶段 5：性能验证和优化配置

### 任务 5.1：优化 next.config.mjs

**添加图片优化配置**：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
}

export default nextConfig
```

### 任务 5.2：构建验证

```bash
npm run build
```

**检查点**：
- 构建成功无错误
- 检查构建输出的页面大小（First Load JS）
- 确认图片优化生效

### 任务 5.3：性能测试

1. 运行 `npm run dev`
2. 打开浏览器开发者工具
3. 测试关键页面：
   - 首页加载速度
   - 项目详情页加载速度
   - 图片加载时间
4. 对比优化前后的性能数据

---

## 执行检查清单

每个阶段完成后，CodeX 必须确认：

- [ ] 阶段 1：所有 404 引用已修复，图片正常显示
- [ ] 阶段 2：目录结构已优化，路径引用已更新
- [ ] 阶段 3：所有 `<img>` 已转换为 `<Image>`，图片质量无损
- [ ] 阶段 4：组件化改造完成，代码更易维护
- [ ] 阶段 5：构建成功，性能提升明显

---

## 回滚策略

如果任何阶段出现问题：
1. 立即停止后续操作
2. 使用 git 回滚到上一个稳定状态
3. 向用户报告问题详情
4. 等待用户决策后再继续

---

## 预期成果

1. **性能提升**：
   - 首屏加载速度提升 50%+
   - 图片请求体积减少（通过 WebP/AVIF 格式）
   - 启用懒加载，减少初始加载压力

2. **代码质量**：
   - 统一的图片加载逻辑
   - 清晰的目录结构
   - 可复用的组件设计

3. **可维护性**：
   - 规范的文件命名
   - 项目 ID 与图片目录一一对应
   - 便于后续扩展
