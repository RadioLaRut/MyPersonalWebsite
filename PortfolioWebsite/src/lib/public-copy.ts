export const PUBLIC_COPY = {
  metadata: {
    title: "JIANG CHENGYAN",
    description: "江承彦作品集：灯光、技术美术、游戏设计与交互叙事案例。",
  },
  navigation: {
    trigger: "MENU",
    triggerLabel: "Menu",
    close: "CLOSE",
    closeLabel: "Close menu",
    dialogLabel: "Main navigation",
    navLabel: "主导航",
    items: [
      { label: "Home", href: "/" },
      { label: "Lighting", href: "/works/lighting-portfolio" },
      { label: "All Works", href: "/works" },
      { label: "About", href: "/about" },
    ],
    testingItems: [
      { label: "Playground", href: "/playground" },
      { label: "Editor", href: "/admin" },
    ],
  },
  fallbacks: {
    bilibiliTitle: "哔哩哔哩视频",
    heroEyebrow: "PROJECT",
    heroSummary: "Add a short project summary.",
    heroTitle: "PROJECT TITLE",
    heroVideoLabel: "观看视频",
    projectCoverAlt: "Project cover",
    projectLinkLabel: "Open project",
    worksEmpty: "No works available. Add some works to the list.",
  },
  contact: {
    copyLabel: "复制微信号",
    copySuccessMessage: "微信号已复制",
    copyErrorMessage: "复制失败，请手动选择微信号",
    unavailableLabel: "微信号不可复制",
  },
  errors: {
    title: "作品内容加载失败",
    description: "内容文件可能损坏或版本不兼容，请检查权威 JSON。",
    retry: "重新加载",
  },
} as const;

export function collectPublicCopyStrings(): string[] {
  const strings: string[] = [];
  const pending: unknown[] = [PUBLIC_COPY];

  while (pending.length > 0) {
    const value = pending.pop();
    if (typeof value === "string") {
      strings.push(value);
      continue;
    }
    if (Array.isArray(value)) {
      pending.push(...value);
      continue;
    }
    if (value && typeof value === "object") {
      pending.push(...Object.values(value));
    }
  }

  return strings;
}
