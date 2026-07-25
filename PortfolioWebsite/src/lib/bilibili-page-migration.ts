import { isPlainRecord } from "./json-utils.ts";
import type { PageDocument } from "./page-document-contract.ts";

export const BILIBILI_VIDEO_BY_PAGE_SLUG = {
  "works/epic-stage": "https://www.bilibili.com/video/BV1oSDTYJEi2",
  "works/holy-tank": "https://www.bilibili.com/video/BV1GqkRYxEWM",
  "works/im-explode": "https://www.bilibili.com/video/BV1DNwUeDEos",
  "works/insight": "https://www.bilibili.com/video/BV1gQbDzQEUL",
  "works/prometheus": "https://www.bilibili.com/video/BV1GSGmzBEx8",
  "works/slay-the-virus": "https://www.bilibili.com/video/BV1QfgzzrE3J",
} as const;

type BilibiliPageSlug = keyof typeof BILIBILI_VIDEO_BY_PAGE_SLUG;

export function migrateBilibiliPage(
  document: PageDocument,
  slug: string,
): { document: PageDocument; migrated: boolean } {
  const source = BILIBILI_VIDEO_BY_PAGE_SLUG[slug as BilibiliPageSlug];
  if (!source) return { document, migrated: false };

  const nextDocument = JSON.parse(JSON.stringify(document)) as PageDocument;
  const content = nextDocument.content as unknown[];
  const heroIndex = content.findIndex(
    (node) => isPlainRecord(node) && node.type === "HeroHeadline",
  );
  if (heroIndex < 0) return { document, migrated: false };

  let migrated = false;
  const hero = content[heroIndex];
  if (isPlainRecord(hero) && isPlainRecord(hero.props)) {
    if (hero.props.navLink !== "") {
      hero.props.navLink = "";
      migrated = true;
    }
    if (hero.props.navLinkLabel !== "") {
      hero.props.navLinkLabel = "";
      migrated = true;
    }
  }

  const alreadyHasVideo = content.some(
    (node) => isPlainRecord(node) && node.type === "BilibiliEmbed",
  );
  if (!alreadyHasVideo) {
    const pageTitle = nextDocument.root.props.title.trim() || "项目";
    content.splice(heroIndex + 1, 0, {
      props: {
        caption: "",
        captionAlign: "left",
        id: `bilibili-${slug.replaceAll("/", "-")}`,
        source,
        title: `${pageTitle}项目视频`,
      },
      type: "BilibiliEmbed",
    });
    migrated = true;
  }

  return migrated
    ? { document: nextDocument, migrated: true }
    : { document, migrated: false };
}
