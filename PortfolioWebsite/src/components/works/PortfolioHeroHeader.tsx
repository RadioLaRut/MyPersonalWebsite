import { type ReactNode } from "react";
import ComponentLayoutNode, {
    getComponentLayoutAlignment,
    getComponentLayoutTypography,
    type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
    type TypographyAlignment,
} from "@/components/common/Typography";
import {
    type ComponentDesignOverride,
    resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { MotionLink } from "@/components/motion/MotionLink";
import { hasEditableTextContent } from "@/lib/editable-text";
import {
    getGridColumnClassName,
    getResponsiveGridColumnClassName,
    getSpacingRem,
    getComponentSectionProfileClassName,
    getComponentSectionStyle,
} from "@/lib/component-design-style";

type LightingCollectionHeroHeaderProps = {
    title: ReactNode;
    subtitle: ReactNode;
    descriptionLine1: ReactNode;
    descriptionLine2: ReactNode;
    descriptionAlign?: TypographyAlignment;
    ctaLabel?: ReactNode;
    ctaHref?: string;
    editMode?: boolean;
} & ComponentDesignOverride<"PortfolioHeroHeader"> & ComponentLayoutProps;

export default function LightingCollectionHeroHeader({
    title,
    subtitle,
    descriptionLine1,
    descriptionLine2,
    descriptionAlign = "left",
    ctaLabel,
    ctaHref,
    componentLayout,
    editMode = false,
    design,
}: LightingCollectionHeroHeaderProps) {
    const resolvedDesign = resolveComponentDesign("PortfolioHeroHeader", design);
    const hasSubtitle = hasEditableTextContent(subtitle);
    const hasDescriptionLine1 = hasEditableTextContent(descriptionLine1);
    const hasDescriptionLine2 = hasEditableTextContent(descriptionLine2);
    const hasCta = hasEditableTextContent(ctaLabel) && Boolean(ctaHref);
    const hasSideRail = hasDescriptionLine1 || hasDescriptionLine2 || hasCta;

    if (componentLayout) {
        const titleTypography = getComponentLayoutTypography(componentLayout, "title");
        const subtitleTypography = getComponentLayoutTypography(componentLayout, "subtitle");
        const eyebrowTypography = getComponentLayoutTypography(componentLayout, "sideEyebrow");
        const descriptionTypography = getComponentLayoutTypography(componentLayout, "description");
        const ctaTypography = getComponentLayoutTypography(componentLayout, "cta");
        return (
            <section
                className={`border-b border-white/10 ${getComponentSectionProfileClassName(componentLayout)}`}
                style={getComponentSectionStyle(componentLayout)}
            >
                <div className="grid-container items-end">
                    <ComponentLayoutNode layout={componentLayout} nodeId="title">
                        <Typography
                            as="h1"
                            preset={titleTypography?.preset ?? "luna-editorial"}
                            size={titleTypography?.size ?? "display"}
                            weight="semantic"
                            wrapPolicy={titleTypography?.wrap ?? "heading"}
                            align={getComponentLayoutAlignment(componentLayout, "title")}
                            className="text-white"
                        >
                            {title}
                        </Typography>
                    </ComponentLayoutNode>
                    {hasSubtitle ? (
                        <ComponentLayoutNode
                            gapFrom="title"
                            layout={componentLayout}
                            nodeId="subtitle"
                        >
                            <Typography
                                as="h2"
                                preset={subtitleTypography?.preset ?? "luna-editorial"}
                                size={subtitleTypography?.size ?? "title"}
                                weight="display"
                                wrapPolicy={subtitleTypography?.wrap ?? "heading"}
                                align={getComponentLayoutAlignment(componentLayout, "subtitle")}
                                className="text-white/82"
                            >
                                {subtitle}
                            </Typography>
                        </ComponentLayoutNode>
                    ) : null}
                    {hasDescriptionLine1 ? (
                        <ComponentLayoutNode layout={componentLayout} nodeId="sideEyebrow">
                            <Typography
                                as="p"
                                preset={eyebrowTypography?.preset ?? "sans-body"}
                                size={eyebrowTypography?.size ?? "caption"}
                                weight="semantic"
                                wrapPolicy={eyebrowTypography?.wrap ?? "label"}
                                align={getComponentLayoutAlignment(componentLayout, "sideEyebrow")}
                                className="text-textMuted"
                            >
                                {descriptionLine1}
                            </Typography>
                        </ComponentLayoutNode>
                    ) : null}
                    {hasDescriptionLine2 ? (
                        <ComponentLayoutNode
                            gapFrom="sideEyebrow"
                            layout={componentLayout}
                            nodeId="description"
                        >
                            <Typography
                                as="p"
                                preset={descriptionTypography?.preset ?? "sans-body"}
                                size={descriptionTypography?.size ?? "body"}
                                weight="semantic"
                                wrapPolicy={descriptionTypography?.wrap ?? "prose"}
                                align={getComponentLayoutAlignment(
                                    componentLayout,
                                    "description",
                                    descriptionAlign,
                                )}
                                className="text-textPrimary/90"
                            >
                                {descriptionLine2}
                            </Typography>
                        </ComponentLayoutNode>
                    ) : null}
                    {hasCta && ctaHref ? (
                        <ComponentLayoutNode
                            gapFrom={hasDescriptionLine2 ? "description" : "sideEyebrow"}
                            layout={componentLayout}
                            nodeId="cta"
                        >
                            <MotionLink
                                href={ctaHref}
                                disabled={editMode}
                                className="group interactive inline-grid grid-flow-col auto-cols-max items-center gap-3 text-textMuted transition-colors duration-300 hover:text-white"
                            >
                                <span className="h-px w-6 bg-white/30 transition-all duration-300 group-hover:w-10 group-hover:bg-white" />
                                <Typography
                                    preset={ctaTypography?.preset ?? "sans-body"}
                                    size={ctaTypography?.size ?? "label"}
                                    weight="semantic"
                                    wrapPolicy={ctaTypography?.wrap ?? "label"}
                                    align={getComponentLayoutAlignment(componentLayout, "cta")}
                                    className="text-inherit"
                                >
                                    {ctaLabel}
                                </Typography>
                            </MotionLink>
                        </ComponentLayoutNode>
                    ) : null}
                </div>
            </section>
        );
    }

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
                                        align={descriptionAlign}
                                        className="text-textPrimary/90"
                                        style={{ marginTop: getSpacingRem(resolvedDesign.descriptionTopSpacing) }}
                                    >
                                        {descriptionLine2}
                                    </Typography>
                                ) : null}
                                {hasCta && ctaHref ? (
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
