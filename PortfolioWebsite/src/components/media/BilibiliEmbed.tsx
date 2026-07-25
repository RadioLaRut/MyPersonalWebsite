import type { ReactNode } from "react";

import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  parseBilibiliVideoSource,
  resolveBilibiliEmbedTitle,
} from "@/lib/bilibili-embed";
import {
  createResponsiveGridBounds,
  getResponsiveGridColumnClassName,
} from "@/lib/component-design-style";
import {
  hasEditableTextContent,
  toPlainText,
} from "@/lib/editable-text";

export type BilibiliEmbedProps = {
  caption?: ReactNode;
  captionAlign?: TypographyAlignment;
  editMode?: boolean;
  source: string;
  title: ReactNode;
};

export default function BilibiliEmbed({
  caption,
  captionAlign = "left",
  editMode = false,
  source,
  title,
}: BilibiliEmbedProps) {
  const video = parseBilibiliVideoSource(source);
  const accessibleTitle = resolveBilibiliEmbedTitle(toPlainText(title));
  const contentBoundsClassName = getResponsiveGridColumnClassName(
    createResponsiveGridBounds(
      { leftCol: 1, rightCol: 12 },
      { leftCol: 2, rightCol: 11 },
      { leftCol: 2, rightCol: 11 },
    ),
  );

  if (!video) {
    if (!editMode) return null;

    return (
      <section className="w-full bg-black py-8 md:py-12">
        <div className="grid-container">
          <div
            className={`${contentBoundsClassName} grid aspect-video place-items-center bg-[#171717] px-8 text-center`}
            data-bilibili-state="invalid"
          >
            <div>
              <Typography
                as="p"
                preset="sans-body"
                size="label"
                weight="semantic"
                wrapPolicy="label"
                align="center"
                className="text-white/80"
              >
                B 站视频源无效
              </Typography>
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="semantic"
                wrapPolicy="prose"
                align="center"
                className="mt-3 text-white/45"
              >
                请填写 BV 号或 bilibili.com/video/BV… 标准链接
              </Typography>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-black py-8 md:py-12 lg:py-16">
      <div className="grid-container">
        <figure className={`${contentBoundsClassName} w-full`}>
          <div className="aspect-video w-full overflow-hidden bg-[#111]">
            <iframe
              src={video.embedUrl}
              title={accessibleTitle}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className={`h-full w-full border-0 ${editMode ? "pointer-events-none" : ""}`}
            />
          </div>

          <figcaption className="grid gap-3 border-t border-white/10 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            {hasEditableTextContent(caption) ? (
              <Typography
                as="p"
                preset="sans-body"
                size="body-sm"
                weight="semantic"
                wrapPolicy="prose"
                align={captionAlign}
                className="text-textSecondary"
              >
                {caption}
              </Typography>
            ) : (
              <span aria-hidden="true" />
            )}
            <a
              href={editMode ? undefined : video.watchUrl}
              target={editMode ? undefined : "_blank"}
              rel={editMode ? undefined : "noopener noreferrer"}
              aria-disabled={editMode || undefined}
              className={editMode
                ? "cursor-default text-white/45"
                : "interactive text-white/55 transition-colors hover:text-white"}
            >
              <Typography
                as="span"
                preset="sans-body"
                size="label"
                weight="semantic"
                wrapPolicy="label"
                className="text-inherit"
              >
                在哔哩哔哩观看
              </Typography>
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
