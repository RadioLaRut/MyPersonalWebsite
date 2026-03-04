# 作品集数据与架构整理 (Portfolio Data & Architecture)

基于用户提供的简历和作品集规范，梳理出以下顶层级 Work 列表以及特定作品的内部结构。

## 一、游戏作品 (Game Projects)
将简历中的每个游戏提取为独立的 Work：

1. **杀毒奇兵 (Slay the Virus)**
   *   **职责**：UI设计 / 海报设计 / 策划
   *   **核心内容**：结合背包管理与卡牌构筑，视觉一致性把控，UI迭代，海报精修。
2. **帅油桶 (WOW, Otto!)**
   *   **职责**：主策划
   *   **核心内容**：轨迹球叙事交互，围绕“轮椅操控感”设计。
3. **我和你爆了 (I'm Explode with U)**
   *   **职责**：主策划
   *   **核心内容**：双人对战平台游戏，泡泡击退与风险博弈机制设计。
4. **普罗米修斯计划 (The Prometheus)**
   *   **职责**：主策划 / 世界观设计 / 灯光
   *   **核心内容**：即时战术，冷暖光影对比引导视线（此作品在简历中也是灯光强相关，但作为独立Game展示）。
5. **视差之间 (Somewhere Between Parallax)**
   *   **职责**：UI设计
   *   **核心内容**：交互VR作品，基于视差贴图碎片。
6. **暗喻之间 (Insight)**
   *   **职责**：主策划 / 程序 / 编剧
   *   **核心内容**：分支剧情叙事，UE蓝图独立开发，网络舆论题材。
7. **企鹅贸易公司 (Penguin Trading Company)**
   *   **职责**：主策划 / 技术美术 / PM
   *   **核心内容**：模拟经营，项目管理，UE资产锁系统开发，自动化工具。

## 二、灯光与技术美术作品 (Lighting & Tech Art)
除了游戏项目外，添加以下独立 Work：

1. **Houdini 程序化生成 (Houdini Procedural Generation)**
2. **Epic 舞台灯光 (Epic Stage Lighting)**
3. **灯光作品集 (Lighting Portfolio)**

### 灯光作品集 (Lighting Portfolio) 内部结构
点击“灯光作品集”后，进入该 Work 的二级页面（并排展示多个“集”/Collections）。

*   **交互逻辑**：采用网格状并列排列（Grid Alignment），每个集展示一张封面图。点击封面图进入具体的 Breakdown 详情页。
*   **具体分集归纳**：
    *   **Collection 1: 氛围一** (对应 PDF 页码：3, 4, 5)
    *   **Collection 2: 氛围二** (对应 PDF 页码：6, 7, 8)
    *   **Collection 3: 氛围三** (对应 PDF 页码：9, 10, 11, 12 为打光；13 为无光照对比)
    *   **Collection 4: 氛围四** (对应 PDF 页码：14, 15, 16 为打光；17 为无光照对比)
    *   **Collection 5: 氛围五 (双构图)** (对应 PDF 页码：18-24 为两个构图的打光；21 和 25 为无光照对比)
    *   **Collection 6: 氛围练习** (对应 PDF 页码：41, 42-43, 44)

---

## 页面 UI/UX 梳理与设计思考 (基于网页风格和规范)
1. **主页/列表页展示 (Home/Works List)**
   *   这十个 Work 统一呈现在主页（或单独的 Works 列表页）中。采用大文字幽灵描边 (`text-transparent [-webkit-text-stroke:1px]`) 的极简列表形式，悬停显示缩略图和发光白色文本。
2. **灯光作品集的二级页面 (Lighting Collections Index)**
   *   **网格对齐 (Grid Alignment)**：页面采用 12 列网格。比如使用 `col-span-6 md:col-span-4` 将屏幕横向分割为并列的卡片，保持不等距或带有呼吸感的留白（如两边预留 `col-span-1` 或 `col-span-2`）。
   *   **策展人风格**：不使用传统的方框强力切割，通过图片本身和极简的数字序号（如 `01 / ` `02 / ` 的字样，配置 `font-mono tracking-widest`）来作为集的标识。
3. **具体的 Breakdown 页 (Detail Page)**
   *   运用滚动视差 (Parallax)，依次呈现大面积的高清打光图。
   *   光照与无光照的对比可以使用**交互式滑块 (Before/After Slider)**，或在滚动时由鼠标/触发器实现灯光的“点亮/熄灭”效果，极为契合“手电筒”、“静谧感”的设计语言。
