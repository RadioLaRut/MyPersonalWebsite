export type StoryBlock =
  | { type: 'FullscreenImage'; url: string; alt?: string }
  | { type: 'Text'; content: string; align?: 'left' | 'center' | 'right' }
  | { type: 'TextWithAside'; asideTitle: string; content: string }
  | { type: 'ImageStack'; urls: string[] }
  | { type: 'ExternalLink'; url: string; label: string };

export interface ProjectData {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl: string; // Used in the Works list
  blocks: StoryBlock[];
}

export const projects: ProjectData[] = [
  {
    id: 'insight',
    title: 'INSIGHT',
    subtitle: 'INTERACTIVE NARRATIVE GAME',
    coverUrl: '/images/insight/InsightCover.png',
    blocks: [
      {
        type: 'Text',
        content: 'INSIGHT是一款轻交互的互动叙事游戏。玩家在游戏中扮演一位网络舆情监管员。',
        align: 'center'
      },
      {
        type: 'TextWithAside',
        asideTitle: 'ROLE\nDirector, Programmer, Writer',
        content: '通过浏览各类的互联网舆论和帖子，判断这些内容应该被推流或者限流，在悄无声息中改变整个世界。最初的灵感来自于《不予播出》与《接线疑云》。',
      },
      {
        type: 'ExternalLink',
        label: 'WATCH GAMEPLAY ON BILIBILI',
        url: 'https://www.bilibili.com/video/BV1gQbDzQEUL'
      }
    ]
  },
  {
    id: 'penguin',
    title: 'PENGUIN TRADING',
    subtitle: 'MANAGEMENT SIMULATION',
    coverUrl: '/images/penguin/Epic.png',
    blocks: [
      {
        type: 'Text',
        content: '企鹅贸易公司是一款以“贱萌”企鹅为主角，融合模拟经营、资源管理与遗传培育的黑色幽默游戏。',
        align: 'left'
      }
    ]
  },
  {
    id: 'slay-the-virus',
    title: 'SLAY THE VIRUS',
    subtitle: 'DECK-BUILDING & INVENTORY MANAGEMENT',
    coverUrl: '/images/slay-the-virus/STVTitle.png',
    blocks: [
      {
        type: 'Text',
        content: '结合背包管理的卡牌游戏。玩家在游戏中扮演一位需要智慧细胞战斗的医生，在病人体内同病毒作战。',
        align: 'left'
      }
    ]
  },
  {
    id: 'prometheus',
    title: 'THE PROMETHEUS PROJECT',
    subtitle: 'STEALTH & TACTICAL',
    coverUrl: '/images/prometheus/PrometheusTitle.png',
    blocks: [
      {
        type: 'TextWithAside',
        asideTitle: 'LIGHTING & DESIGN',
        content: '即时战术游戏。玩家扮演记者潜入政府大楼，发现“上传人类大脑到互联网”的秘密计划。负责确立冷色主基调与关键区域暖光引导的光影美学。',
      }
    ]
  },
  {
    id: 'lighting',
    title: 'LIGHTING & TECH',
    subtitle: 'HOUDINI & UNREAL ENGINE 5',
    coverUrl: '/images/lighting/lit.jpg',
    blocks: [
      {
        type: 'Text',
        content: '舞台灯光与程序化生成练习。使用Houdini配合虚幻引擎完成程序化生成小镇。独立完成舞台设计与定格动画调度。',
      }
    ]
  }
];
