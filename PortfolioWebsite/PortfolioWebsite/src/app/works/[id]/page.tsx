import React from "react";
import ClientBreakdown from "@/components/works/ClientBreakdown";

// 添加了图库数组，并将所有文案翻译为中文
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectsData: Record<string, any> = {
  "lighting-atmosphere": {
    title: "灯光氛围",
    idNum: "01",
    heroImage: "/images/TrainStation/2Day.png",
    description:
      "火车站与城市环境。专注于真实的灯光衰减和符合物理规律的深邃大气密度。探索了白天、黄昏、雾天和夜晚等不一样的光照条件方案。所有场景灯光均为动态全时段演算并构建，展现了极为扎实的渲染理论基础与极高的美术审美修养。",
    col1: {
      title: "白天 / 雾天",
      text: "应用体积雾渐变增加画面的景深感。",
      img: "/images/TrainStation/2Fog.png",
    },
    col2: {
      title: "夜晚",
      text: "光影对比的张力由自发光材质与高光反射驱动。",
      img: "/images/TrainStation/2Dust.png",
    },
    col3: {
      title: "过程",
      text: "测试了多个 HDRI 贴图结合平行光的渲染管线。",
      img: "/images/City2026Add/001.PNG",
    },
    gallery: [
      "/images/TrainStation/Day.png",
      "/images/TrainStation/Dusk.png",
      "/images/TrainStation/Night.png",
      "/images/TrainStation/NoLight.png",
      "/images/TrainStation/2Day.png",
      "/images/TrainStation/2Dust.png",
      "/images/TrainStation/2Fog.png",
      "/images/TrainStation/2Night.png",
      "/images/TrainStation/2NoLight.png",
      "/images/City2026Add/001.PNG",
      "/images/City2026Add/002.PNG",
      "/images/City2026Add/003.PNG",
    ],

    nextId: "insight",
    nextName: "INSIGHT",
    nextBg: "/images/Insight/InsightCover.png",
  },
  insight: {
    title: "INSIGHT",
    idNum: "02",
    heroImage: "/images/Insight/InsightCover.png",
    description:
      "INSIGHT 是一款轻交互的互动叙事游戏。玩家在游戏中扮演一位网络舆情监管员。通过浏览各类的互联网舆论和帖子，判断这些内容应该被推流或者限流，在悄无声息中改变整个世界。我主要负责策划、程序、和剧本编写。灵感来自于《不予播出》、《接线疑云》。",
    col1: {
      title: "Articy Draft",
      text: "剧本写作使用了 Articy Draft，通过节点极为方便地实现多分支剧情流程树的管理。",
      img: "/images/Insight/Code01.jpg",
    },
    col2: {
      title: "框架逻辑",
      text: "Unreal Engine 蓝图深度结合对话树系统，驱动复杂的叙事逻辑表现。",
      img: "/images/Insight/Code02.jpg",
    },
    col3: {
      title: "UI 设计",
      text: "拟真桌面操作系统 UI 设计，精准重现复古操作终端的压抑美学感。",
      img: "/images/Insight/Shot01.jpg",
    },
    gallery: [
      "/images/Insight/Shot02.jpg",
      "/images/Insight/Shot03.jpg",
      "/images/Insight/Shot04.jpg",
    ],

    navLink: "https://www.bilibili.com/video/BV1gQbDzQEUL",
    nextId: "slay-the-virus",
    nextName: "SLAY THE VIRUS",
    nextBg: "/images/STV/STVTitle.png",
  },
  "slay-the-virus": {
    title: "SLAY THE VIRUS",
    idNum: "03",
    heroImage: "/images/STV/STVTitle.png",
    description:
      "结合背包管理的肉鸽卡牌游戏。玩家扮演一位需要运用智慧引导细胞战斗的医生，在病人体内同棘手的病毒群落做殊死搏斗。我主要负责 UI 的整体布局框架与视觉美术风格把控。平衡小组成员差异并推进风格统一迭代。",
    col1: {
      title: "UI 布局",
      text: "基于网格的空间资源背包管理交互系统架构。",
      img: "/images/STV/01.jpg",
    },
    col2: {
      title: "卡牌设计",
      text: "在 Photoshop 中精修由组员绘制的草稿与技能特效资产组合。",
      img: "/images/STV/02.jpg",
    },
    col3: {
      title: "后期处理",
      text: "拉升整体视觉的电影感对比度及文字图形的易读性。",
      img: "/images/STV/PosterLandscapeOrigine.jpg",
    },
    gallery: ["/images/STV/03.jpg", "/images/STV/04.jpg", "/images/STV/05.jpg"],

    navLink: "https://www.bilibili.com/video/BV1QfgzzrE3J/",
    nextId: "prometheus",
    nextName: "PROMETHEUS PROJECT",
    nextBg: "/images/Prometheus/PrometheusTitle.png",
  },
  prometheus: {
    title: "THE PROMETHEUS PROJECT",
    idNum: "04",
    heroImage: "/images/Prometheus/PrometheusTitle.png",
    description:
      "一款在 Unreal Engine 5 中制作的硬核潜行游玩体验，玩家扮演一名记者深入隐秘的政府大楼，并意外发现了惊天秘密的“普罗米修斯”生化实验计划。我在其中身兼系统策划、关卡设计与全职灯光师。完成白盒测试与玩法闭环搭建后，交由美术细化并由我进行最终的电影感打光包装。",
    col1: {
      title: "关卡设计 (Level Design)",
      text: "白盒封块与秘密潜行的死角巡逻路径编排构建。",
      img: "/images/Prometheus/Shot01.jpg",
    },
    col2: {
      title: "沉浸式打光 (Lighting)",
      text: "通过高对比阴影叙述视觉重量，直接辅助潜行潜藏机制的判断基准。",
      img: "/images/Prometheus/Shot02.jpg",
    },
    col3: {
      title: "智能系统 (Systems)",
      text: "编写了 AI 视觉感知锥与多环境表面声响探测事件体系。",
      img: "/images/Prometheus/Shot04.jpg",
    },
    gallery: [
      "/images/Prometheus/Shot03.jpg",
      "/images/Prometheus/Shot05.jpg",
      "/images/Prometheus/Shot06.jpg",
    ],

    navLink: "https://www.bilibili.com/video/BV1GSGmzBEx8",
    nextId: "holy-tank",
    nextName: "HOLY TANK (帅油桶)",
    nextBg: "/images/HolyTank/7d9ca92e5ade09bfc1c349a49001b2eb.png",
  },
  "holy-tank": {
    title: "帅油桶 (HOLY TANK)",
    idNum: "05",
    heroImage: "/images/HolyTank/7d9ca92e5ade09bfc1c349a49001b2eb.png",
    description:
      "受《Florence》启发的互动碎片化叙事游戏项目。玩家在游戏中扮演一名残疾人士，深刻体验生活在这座充满“敌意甚至刁难建筑”城市中的寸步难行。游戏最核心的创新点，即是抛弃传统键鼠并完全绑定了一台实体“轨迹球”进行轮椅推移的操作，极深地绑定了玩家操作难度与角色身体残障体验上的通感频率。我主要负责游戏整体系统与前沿交互玩法的逻辑设计。",
    col1: {
      title: "通感设计",
      text: "纯轨迹球物理阻力操控模拟系统架构设计研讨。",
      img: "/images/HolyTank/f0f6239817a545ccad2f7dc47aff8acc.png",
    },
    col2: {
      title: "叙事体验",
      text: "环境叙事 (Environmental Storytelling) 展现社会隐性偏见。",
      img: "/images/HolyTank/f0f6239817a545ccad2f7dc47aff8acc.png",
    },
    col3: {
      title: "概念方向",
      text: "针对带有显性恶意的公共城市建筑体系发起的探究与批判。",
      img: "/images/HolyTank/7d9ca92e5ade09bfc1c349a49001b2eb.png",
    },
    navLink: "https://www.bilibili.com/video/BV1GqkRYxEWM/",
    nextId: "pcg-town",
    nextName: "HOUDINI 驱动生成村镇",
    nextBg: "/images/Others/PCG/PCG01.png",
  },
  "pcg-town": {
    title: "HOUDINI 驱动的小镇生成管线",
    idNum: "06",
    heroImage: "/images/Others/PCG/PCG01.png",
    description:
      "采用 Houdini 节点化开发，高度整合至 Unreal Engine 内部的程序化小镇管线原型工具。美术或关卡设计师仅需要框定场景边界，随意绘制道路脉络和自然水域样条线（Spline）并一键执行。我将其封装为拥有 70 余项深层扩展参数的面板：支持精编房屋簇密度、建筑物受水景与主路的影响朝向、随机风化的墙体倾角误差，以及环境地坪的高阶植被撒点体系（Scattering Rules），极大扩展了虚幻场景生产链的空间与产能下限。",
    col1: {
      title: "HDA 封装逻辑",
      text: "在 UE5 中内置调用 Houdini Engine 的数据数字资产。处理大量网格的实时更迭。",
      img: "/images/Others/PCG/PCG02.png",
    },
    col2: {
      title: "样条线路网",
      text: "由任意贝塞尔曲线动态分割计算的智能土路及河流系统。",
      img: "/images/Others/PCG/PCG03.png",
    },
    col3: {
      title: "环境撒布引擎",
      text: "基于规则的高速碰撞规避算法用于树木与房舍周边杂物的植被生成。",
      img: "/images/Others/PCG/PCG05.png",
    },
    gallery: ["/images/Others/PCG/PCG04png.png"],

    nextId: "atmosphere-practice",
    nextName: "ATMOSPHERE PRACTICE",
    nextBg: "/images/Others/01.png",
  },
  "atmosphere-practice": {
    title: "环境与灯光氛围试炼",
    idNum: "07",
    heroImage: "/images/Others/01.png",
    description:
      "日常的虚幻引擎写实环境与硬性打光专项练习。涵盖了繁杂多样的极难光影表现项目：例如潮湿重油污的高反射赛博朋克商业排场，日夜天光状态更替的情绪模拟，以及针对多种高光度及次表面材质的粗糙度瑕疵测试。",
    col1: {
      title: "霓虹折射",
      text: "湿润材质上的全实时屏幕空间反射及高强对比人造主光源布置。",
      img: "/images/Others/CyberRestaurant.png",
    },
    col2: {
      title: "体积情绪",
      text: "使用厚度极高且带有物理色散的粒子雾系统勾勒极端的空间剪影之美。",
      img: "/images/Others/02.png",
    },
    col3: {
      title: "破败微距",
      text: "探索贴图与模型瑕疵如何在微妙斜侧光的照耀下获得照片级的张力。",
      img: "/images/Others/01.png",
    },
    gallery: [
      "/images/West/CDay.jpeg",
      "/images/West/CDust.jpeg",
      "/images/West/CNight.jpeg",
      "/images/West/CNoLight.jpg",
      "/images/West/Day.jpeg",
      "/images/West/Dust.jpeg",
      "/images/West/Night.jpeg",
      "/images/West/NoLight.jpg",
      "/images/雨林/Output.0050.png",
      "/images/雨林/Output.0101.png",
      "/images/雨林/Shot005.0002.png",
      "/images/雨林/Version2Output.0029.png",
    ],

    nextId: "epic-stage",
    nextName: "STAGE LIGHTING (EPIC)",
    nextBg: "/images/Others/Epic.png",
  },
  "epic-stage": {
    title: "舞台灯光叙事概念设计",
    idNum: "08",
    heroImage: "/images/Others/Epic.png",
    description:
      "这是一支我在课外自主且独立发起的概念性舞台灯光设计短片。音乐内核来源于史诗概念音乐剧《Epic》。我全权接管并包揽了概念舞台的设计搭置、虚拟镜头的追踪位移，并创造性地使用粗粝但力量感十足的【黏土定格动画（Stop-motion）】形式来表达演员的走位与调度起伏。这种舍弃平滑过渡的独特手法，反而更加凶悍地凸显了灯光作为本作“绝对第一主角”的视觉存在感。我也通过大量研读剧本，运用独特的色彩语言为希腊诸神铺排了带有强烈性格象征的灯光阵列系统映射——当剧情高潮来临，主宰神力倾泻全场时，相对应颜色的强光便会雷厉风行地骤然点亮后方的巨型大理石雕像，构筑极致的舞台神圣张力视听奇观。",
    col1: {
      title: "舞台编排",
      text: "虚拟演播室的大型光机结构铺设统筹布置及长镜头的游机位走位逻辑演算。",
      img: "/images/Others/Epic02.png",
    },
    col2: {
      title: "神座点亮策略",
      text: "后场巨大主神大理石雕塑通过复杂的材质发光指令随着音轨爆破而启动。",
      img: "/images/Others/Epic.png",
    },
    col3: {
      title: "定格镜头呈现",
      text: "极具侵略性的丢帧人物位移调度系统编排技术栈落地方案。",
      img: "/images/Others/Epic02.png",
    },
    navLink: "https://www.bilibili.com/video/BV1oSDTYJEi2/",
    nextId: "lighting-atmosphere",
    nextName: "LIGHTING ATMOSPHERE",
    nextBg: "/images/TrainStation/2Day.png",
  },
};

export default function BreakdownPage({ params }: { params: { id: string } }) {
  const data = projectsData[params.id] || projectsData["insight"];

  return <ClientBreakdown data={data} />;
}
