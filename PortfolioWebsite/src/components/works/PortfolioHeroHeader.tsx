import { type ReactNode } from "react";
import Typography from "@/components/common/Typography";
import {
    type ComponentDesignOverride,
    resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { MotionLink } from "@/components/motion/MotionLink";
import {
    getGridColumnClassName,
    getResponsiveGridColumnClassName,
    getSpacingRem,
} from "@/lib/component-design-style";

type LightingCollectionHeroHeaderProps = {
    title: ReactNode;
    subtitle: ReactNode;
    descriptionLine1: ReactNode;
    descriptionLine2: ReactNode;
    ctaLabel?: string;
    ctaHref?: string;
    editMode?: boolean;
} & ComponentDesignOverride<"PortfolioHeroHeader">;

function hasNodeContent(value: ReactNode) {
    if (value === null || value === undefined || value === false) {
        return false;
    }

    if (typeof value === "string") {
        return value.trim().length > 0;
    }

    return true;
}

export default function LightingCollectionHeroHeader({
    title,
    subtitle,
    descriptionLine1,
    descriptionLine2,
    ctaLabel,
    ctaHref,
    editMode = false,
    design,
}: LightingCollectionHeroHeaderProps) {
    const resolvedDesign = resolveComponentDesign("PortfolioHeroHeader", design);
    const hasSubtitle = hasNodeContent(subtitle);
    const hasDescriptionLine1 = hasNodeContent(descriptionLine1);
    const hasDescriptionLine2 = hasNodeContent(descriptionLine2);
    const hasCta = hasNodeContent(ctaLabel) && Boolean(ctaHref);
    const hasSideRail = hasDescriptionLine1 || hasDescriptionLine2 || hasCta;

    const titleLockup = (
        <div className={hasSideRail ? "max-w-[52rem]" : "max-w-[64rem]"}>
            <Typography
                as="h1"
                preset="luna-editorial"
                size="display"
                weight="semantic"
                wrapPolicy="heading"
                className="text-white"
            >
                {title}
            </Typography>
            {hasSubtitle ? (
                <div className="mt-1 lg:mt-2">
                    <Typography
                        as="h2"
                        preset="luna-editorial"
                        size="title"
                        weight="display"
                        wrapPolicy="heading"
                        className="text-white/82"
                    >
                        {subtitle}
                    </Typography>
                </div>
            ) : null}
        </div>
    );

    return (
        <section className="border-b border-white/10 rhythm-section-hero">
            <div className="grid-container">
                {hasSideRail ? (
                    <div className="grid-subgrid col-span-12 lg:items-end">
                        <div className={getResponsiveGridColumnClassName(resolvedDesign.titleBounds)}>
                            {titleLockup}
                        </div>

                        <div className={getResponsiveGridColumnClassName(resolvedDesign.sideBounds)}>
                            <div className="grid content-start justify-items-start lg:pl-4">
                                {hasDescriptionLine1 ? (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="caption"
                                        weight="semantic"
                                        wrapPolicy="label"
                                        className="text-textMuted"
                                    >
                                        {descriptionLine1}
                                    </Typography>
                                ) : null}
                                {hasDescriptionLine2 ? (
                                    <Typography
                                        as="p"
                                        preset="sans-body"
                                        size="body"
                                        weight="semantic"
                                        wrapPolicy="prose"
                                        className="text-textPrimary/90"
                                        style={{ marginTop: getSpacingRem(resolvedDesign.descriptionTopSpacing) }}
                                    >
                                        {descriptionLine2}
                                    </Typography>
                                ) : null}
                                {ctaLabel && ctaHref ? (
                                    <MotionLink
                                        href={ctaHref}
                                        disabled={editMode}
                                        className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                                        style={{ marginTop: getSpacingRem(resolvedDesign.ctaTopSpacing) }}
                                    >
                                        <span className="h-px w-6 bg-white/30 transition-all duration-300 group-hover:w-10 group-hover:bg-white"></span>
                                        <Typography
                                            preset="sans-body"
                                            size="label"
                                            weight="semantic"
                                            wrapPolicy="label"
                                            className="text-inherit"
                                        >
                                            {ctaLabel}
                                        </Typography>
                                    </MotionLink>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={getGridColumnClassName(resolvedDesign.singleColumnBounds)}>
                        {titleLockup}
                    </div>
                )}
            </div>
        </section>
    );
}
