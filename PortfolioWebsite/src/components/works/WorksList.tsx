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
import { type ComponentDesignDocument } from "@/lib/component-design-schema";
import {
    createResponsiveGridBounds,
    getResponsiveGridColumnClassName,
    getSectionSpacingClassName,
    getSpacingRem,
    getComponentSectionProfileClassName,
} from "@/lib/component-design-style";
import WorksListEntry, {
    type WorksListEntryAlias,
} from "@/components/works/WorksListEntry";
import { hasEditableTextContent } from "@/lib/editable-text";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";
import { PUBLIC_COPY } from "@/lib/public-copy";

interface WorkItem {
    aliases?: WorksListEntryAlias[];
    number?: ReactNode;
    id: string;
    href?: string;
    title: ReactNode;
    category: ReactNode;
    imageSrc: string;
    imagePreset?: ImagePreset;
    imageFitMode?: ImageFitMode;
    desc: ReactNode;
    descriptionAlign?: TypographyAlignment;
}

export type WorksListProps = {
    heading?: ReactNode;
    indexSummary?: ReactNode;
    works?: WorkItem[];
    entriesContent?: ReactNode;
    entryDesign?: ComponentDesignDocument["components"]["WorksListEntry"];
    editMode?: boolean;
} & ComponentDesignOverride<"WorksList"> & ComponentLayoutProps;

export default function WorksList({
    componentLayout,
    heading = "All Selected Works",
    indexSummary,
    works = [],
    entriesContent,
    entryDesign,
    editMode = false,
    design,
}: WorksListProps) {
    const resolvedDesign = resolveComponentDesign("WorksList", design);
    const hasLegacyWorks = works && works.length > 0;
    const hasEntriesContent = Boolean(entriesContent);

    if (!hasLegacyWorks && !hasEntriesContent) {
        return (
            <div className="p-12 text-center">
                <Typography
                    as="p"
                    preset="sans-body"
                    size="caption"
                    weight="semantic"
                    wrapPolicy="label"
                    align="center"
                    className="text-textMuted"
                >
                    {PUBLIC_COPY.fallbacks.worksEmpty}
                </Typography>
            </div>
        );
    }

    if (componentLayout) {
        const headingTypography = getComponentLayoutTypography(componentLayout, "heading");
        const summaryTypography = getComponentLayoutTypography(componentLayout, "indexSummary");
        return (
            <section className={`grid w-full content-center text-white ${getComponentSectionProfileClassName(componentLayout)}`}>
                {(hasEditableTextContent(heading) || hasEditableTextContent(indexSummary)) ? (
                    <div className={`grid-container relative z-20 border-b border-white/10 pb-8 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}>
                        {hasEditableTextContent(heading) ? (
                            <ComponentLayoutNode layout={componentLayout} nodeId="heading">
                                <Typography
                                    as="h1"
                                    preset={headingTypography?.preset ?? "sans-body"}
                                    size={headingTypography?.size ?? "title-sm"}
                                    weight="semantic"
                                    wrapPolicy={headingTypography?.wrap ?? "heading"}
                                    align={getComponentLayoutAlignment(componentLayout, "heading")}
                                    className="text-white"
                                >
                                    {heading}
                                </Typography>
                            </ComponentLayoutNode>
                        ) : null}
                        {hasEditableTextContent(indexSummary) ? (
                            <ComponentLayoutNode layout={componentLayout} nodeId="indexSummary">
                                <Typography
                                    as="p"
                                    preset={summaryTypography?.preset ?? "sans-body"}
                                    size={summaryTypography?.size ?? "body-sm"}
                                    weight="semantic"
                                    wrapPolicy={summaryTypography?.wrap ?? "prose"}
                                    align={getComponentLayoutAlignment(componentLayout, "indexSummary", "right")}
                                    className="text-textMuted"
                                >
                                    {indexSummary}
                                </Typography>
                            </ComponentLayoutNode>
                        ) : null}
                    </div>
                ) : null}
                <div className="grid w-full border-t border-white/10">
                    {editMode && entriesContent
                      ? entriesContent
                      : works.map((work, index) => (
                        <WorksListEntry
                            key={work.id || index}
                            id={work.id}
                            aliases={work.aliases}
                            number={work.number ?? `0${index + 1}`}
                            href={work.href ?? `/works/${work.id}`}
                            title={work.title}
                            category={work.category}
                            imageSrc={work.imageSrc}
                            imagePreset={work.imagePreset}
                            imageFitMode={work.imageFitMode}
                            desc={work.desc}
                            descriptionAlign={work.descriptionAlign}
                            editMode={editMode}
                            design={entryDesign}
                            componentLayout={componentLayout}
                        />
                      ))}
                </div>
            </section>
        );
    }

    return (
        <div className={`grid w-full content-center text-white ${getSectionSpacingClassName(resolvedDesign.sectionSpacing)}`}>
            <div
                className={`grid-container relative z-20 ${editMode ? "pointer-events-auto" : "pointer-events-none"}`}
                style={{ marginBottom: getSpacingRem(resolvedDesign.headingBottomSpacing) }}
            >
                <div className={`${getResponsiveGridColumnClassName(createResponsiveGridBounds(
                  { leftCol: 1, rightCol: 12 },
                  { leftCol: 2, rightCol: 11 },
                  resolvedDesign.headingBounds,
                ))} grid gap-4 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto] md:items-end`}>
                    <Typography
                        as="h1"
                        preset="sans-body"
                        size="title-sm"
                        weight="semantic"
                        wrapPolicy="heading"
                        className="text-white"
                    >
                        {heading}
                    </Typography>
                    {hasEditableTextContent(indexSummary) ? (
                      <Typography
                        as="p"
                        preset="sans-body"
                        size="caption"
                        weight="semantic"
                        wrapPolicy="label"
                        className="text-textMuted md:text-right"
                      >
                        {indexSummary}
                      </Typography>
                    ) : null}
                </div>
            </div>

            {editMode && entriesContent ? (
                <div className="grid w-full border-t border-white/10">{entriesContent}</div>
            ) : (
                <div className="grid w-full border-t border-white/10">
                    {works.map((work, index) => (
                        <WorksListEntry
                            key={work.id || index}
                            id={work.id}
                            aliases={work.aliases}
                            number={work.number ?? `0${index + 1}`}
                            href={work.href ?? `/works/${work.id}`}
                            title={work.title}
                            category={work.category}
                            imageSrc={work.imageSrc}
                            imagePreset={work.imagePreset}
                            imageFitMode={work.imageFitMode}
                            desc={work.desc}
                            descriptionAlign={work.descriptionAlign}
                            editMode={editMode}
                            design={entryDesign}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
