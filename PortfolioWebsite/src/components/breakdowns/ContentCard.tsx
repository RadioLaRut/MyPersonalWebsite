'use client';

import React, { type ReactNode } from 'react';
import { PresetImage } from '@/components/common/PresetImage';
import Typography from "@/components/common/Typography";
import { type ImageFitMode, type ImagePreset } from '@/lib/image-presentation';
import { toParagraphNodes } from '@/lib/editable-text';

interface ContentCardProps {
  title: ReactNode;
  description: ReactNode;
  imageSrc?: string;
  imagePreset?: ImagePreset;
  imageFitMode?: ImageFitMode;
  tags?: ReactNode[];
  imagePosition?: 'left' | 'right';
}

export default function ContentCard({
  title,
  description,
  imageSrc,
  imagePreset = 'ratio-16-9',
  imageFitMode = 'x',
  tags,
  imagePosition = 'right',
}: ContentCardProps) {
  const paragraphs = toParagraphNodes(description);
  const imageAlt = typeof title === 'string' ? title : 'Content card image';
  const hasImage = Boolean(imageSrc);

  const TextContent = (
    <div className="flex flex-col justify-start">
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {tags.map((tag, i) => (
            <Typography
              key={i}
              as="span"
              preset="sans-body"
              size="caption"
              weight="medium"
              wrapPolicy="label"
              className="border border-white/10 px-2 py-1 text-textMuted"
            >
              {tag}
            </Typography>
          ))}
        </div>
      )}

      <Typography
        as="h3"
        preset="sans-body"
        size="title"
        weight="display"
        wrapPolicy="heading"
        className="mb-8 text-white"
      >
        {title}
      </Typography>

      <div className="max-w-none space-y-5 lg:max-w-[36ch]">
        {paragraphs.map((paragraph, i) => (
          <Typography
            key={i}
            as="p"
            preset="sans-body"
            size="body"
            weight="medium"
            wrapPolicy="prose"
            className="text-textMuted"
          >
            {paragraph}
          </Typography>
        ))}
      </div>
    </div>
  );

  const ImageContent = hasImage ? (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-sm border border-white/10 bg-[#0a0a0a] transition-colors duration-500 group-hover:border-white/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <PresetImage
          src={imageSrc!}
          alt={imageAlt}
          preset={imagePreset}
          fitMode={imageFitMode}
          sizes="100vw"
        />
      </div>
    </div>
  ) : null;

  if (!hasImage) {
    return (
      <div className="w-full my-24 grid-container">
        <div className="col-start-3 col-span-8">{TextContent}</div>
      </div>
    );
  }

  const isImageLeft = imagePosition === 'left';

  return (
    <div className="w-full my-24 grid-container">
      {isImageLeft ? (
        <>
          <div className="col-span-8 col-start-1 order-2 lg:order-1 mt-12 lg:mt-0">
            {ImageContent}
          </div>
          <div className="col-span-4 col-start-9 order-1 lg:order-2">
            {TextContent}
          </div>
        </>
      ) : (
        <>
          <div className="col-span-4 col-start-1">{TextContent}</div>
          <div className="col-span-8 col-start-5 mt-12 lg:mt-0">
            {ImageContent}
          </div>
        </>
      )}
    </div>
  );
}
