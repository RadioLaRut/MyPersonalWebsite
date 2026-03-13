'use client';

import React, { type ReactNode } from 'react';

import { PresetImage } from '@/components/common/PresetImage';
import Typography from "@/components/common/Typography";
import { useComponentDesign } from '@/components/layout/ComponentDesignProvider';
import {
  getGridColumnStyle,
  getSectionSpacingClassName,
  getSpacingRem,
} from '@/lib/component-design-style';
import { type ImageFitMode, type ImagePreset } from '@/lib/image-presentation';

interface InfoItem {
    label: ReactNode;
    value: ReactNode;
}

interface HighDensityInfoBlockProps {
    phase1: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; items?: InfoItem[]; label?: ReactNode };
    phase2: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; items?: InfoItem[]; label?: ReactNode };
    phase3: { title: ReactNode; subtitle?: ReactNode; content: ReactNode; imageSrc?: string; imagePreset?: ImagePreset; imageFitMode?: ImageFitMode; label?: ReactNode };
    phase1ItemsContent?: ReactNode;
    phase2ItemsContent?: ReactNode;
}

export default function HighDensityInfoBlock({ phase1, phase2, phase3, phase1ItemsContent, phase2ItemsContent }: HighDensityInfoBlockProps) {
    const design = useComponentDesign('HighDensityInfoBlock');
    const phase3ImageAlt = typeof phase3.title === "string" ? phase3.title : "Phase image";

    return (
        <div className={`w-full ${getSectionSpacingClassName(design.sectionSpacing)}`}>
            <div className="grid-container border-t border-white/20 rhythm-divider-top">

                <div className="pr-0 lg:pr-5 mb-12 lg:mb-0 border-r border-white/5" style={getGridColumnStyle(design.leftBounds)}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase1.label || "PHASE 01 / CONTEXT"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={design.titleSize} weight="semantic" wrapPolicy={design.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(design.phaseTitleGap) }}>{phase1.title}</Typography>
                    {phase1.subtitle && <Typography as="h4" preset="sans-body" size={design.bodySize} weight="light" wrapPolicy={design.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(design.subtitleGap) }}>{phase1.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={design.bodySize} weight="medium" wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"} className="pr-0 text-textMuted lg:pr-4" style={{ marginBottom: getSpacingRem(design.titleBodyGap) }}>
                        {phase1.content}
                    </Typography>

                    {phase1.items && (
                        <div className="grid border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(design.itemsTopSpacing), rowGap: getSpacingRem("12") }}>
                            {phase1.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="div" preset="sans-body" size={design.bodySize} weight="semantic" wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"} align="right" className="text-textPrimary text-left lg:text-right max-w-full lg:max-w-[75%] self-start lg:self-end">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase1ItemsContent ? (
                        <div className="border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(design.itemsTopSpacing) }}>
                            {phase1ItemsContent}
                        </div>
                    ) : null}
                </div>

                <div className="px-0 lg:px-8 mb-12 lg:mb-0 border-r border-transparent lg:border-white/5" style={getGridColumnStyle(design.middleBounds)}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase2.label || "PHASE 02 / SYSTEM ARCHITECTURE"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={design.titleSize} weight="semantic" wrapPolicy={design.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(design.phaseTitleGap) }}>{phase2.title}</Typography>
                    {phase2.subtitle && <Typography as="h4" preset="sans-body" size={design.bodySize} weight="light" wrapPolicy={design.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(design.subtitleGap) }}>{phase2.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={design.bodySize} weight="medium" wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"} className="text-textMuted" style={{ marginBottom: getSpacingRem(design.titleBodyGap) }}>
                        {phase2.content}
                    </Typography>

                    {phase2.items && (
                        <div className="grid border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(design.itemsTopSpacing), rowGap: getSpacingRem("12") }}>
                            {phase2.items.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography as="span" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="text-textMuted">
                                        {item.label}
                                    </Typography>
                                    <Typography as="span" preset="sans-body" size={design.bodySize} weight="semantic" wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"} className="text-textPrimary">{item.value}</Typography>
                                </div>
                            ))}
                        </div>
                    )}

                    {phase2ItemsContent ? (
                        <div className="border-t border-white/10 pt-6" style={{ marginTop: getSpacingRem(design.itemsTopSpacing) }}>
                            {phase2ItemsContent}
                        </div>
                    ) : null}
                </div>

                <div className="pl-0 lg:pl-8" style={getGridColumnStyle(design.rightBounds)}>
                    <Typography as="div" preset="sans-body" size="caption" weight="semantic" wrapPolicy="label" className="mb-4 text-textMuted">
                        {phase3.label || "PHASE 03 / EXECUTION & RESULTS"}
                    </Typography>
                    <Typography as="h3" preset="sans-body" size={design.titleSize} weight="semantic" wrapPolicy={design.titleAutoWrap ? "heading" : "nowrap"} className="text-textPrimary" style={{ marginBottom: getSpacingRem(design.phaseTitleGap) }}>{phase3.title}</Typography>
                    {phase3.subtitle && <Typography as="h4" preset="sans-body" size={design.bodySize} weight="light" wrapPolicy={design.subtitleAutoWrap ? "prose" : "nowrap"} className="text-textMuted italic" style={{ marginBottom: getSpacingRem(design.subtitleGap) }}>{phase3.subtitle}</Typography>}
                    <Typography as="p" preset="sans-body" size={design.bodySize} weight="medium" wrapPolicy={design.bodyAutoWrap ? "prose" : "nowrap"} className="text-textMuted" style={{ marginBottom: getSpacingRem(design.titleBodyGap) }}>
                        {phase3.content}
                    </Typography>

                    {phase3.imageSrc && (
                        <div className="relative w-full overflow-hidden border border-white/10 bg-neutral-900" style={{ marginTop: getSpacingRem(design.imageTopSpacing) }}>
                            <PresetImage
                                src={phase3.imageSrc}
                                alt={phase3ImageAlt}
                                preset={phase3.imagePreset}
                                fitMode={phase3.imageFitMode}
                                imageClassName="opacity-90 transition-all duration-700 hover:scale-105 hover:opacity-100"
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
