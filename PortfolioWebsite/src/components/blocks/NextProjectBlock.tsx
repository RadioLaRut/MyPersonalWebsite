import { PresetImage } from "@/components/common/PresetImage";
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
type NextProjectBlockProps = {
    nextId: string;
    href?: string;
    nextBg?: string;
    nextName?: string;
    editMode?: boolean;
} & ComponentDesignOverride<"NextProjectBlock">;

export default function NextProjectBlock({
    nextId,
    href = "/works",
    nextBg = "",
    nextName,
    editMode = false,
    design,
}: NextProjectBlockProps) {
    const resolvedDesign = resolveComponentDesign("NextProjectBlock", design);
    const destinationName = nextName?.trim() || nextId;

    return (
        <footer className="mt-0 border-t border-white/20 relative z-20">
            <MotionLink
                href={href}
                disabled={editMode}
                interactionPreset="blockLink"
                className={`group block relative h-[calc(var(--site-viewport-unit)*40)] md:h-[calc(var(--site-viewport-unit)*60)] overflow-hidden w-full bg-black ${editMode ? "cursor-default" : "interactive"}`}
            >
                <div className="pointer-events-none absolute inset-0 z-10 bg-black/[0.58] transition-colors duration-700 group-hover:bg-black/[0.38] group-focus-visible:bg-black/[0.38]"></div>
                <div className="absolute inset-0 grid place-items-center">
                    <PresetImage
                        src={nextBg}
                        alt={`${destinationName} 封面`}
                        preset="ratio-21-9"
                        fitMode="cover"
                        lockFrame={false}
                        sizes="100vw"
                        frameClassName="h-full w-full"
                        imageClassName="scale-100 opacity-40 transition-[filter,opacity,transform] duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-75 group-hover:contrast-[1.04] group-focus-visible:scale-[1.025] group-focus-visible:opacity-75 group-focus-visible:contrast-[1.04]"
                    />
                </div>

                <div className="pointer-events-none absolute inset-0 z-20">
                    <div className="grid-container h-full">
                        <div className={`${getGridColumnClassName(resolvedDesign.overlayBounds)} grid h-full place-items-center text-center mix-blend-difference`}>
                            <div className="rhythm-stack-4">
                                <Typography
                                    preset="sans-body"
                                    size="label"
                                    weight="semantic"
                                    wrapPolicy="label"
                                    align="center"
                                    className="text-textMuted opacity-70 transition-all duration-700 group-hover:opacity-95 group-focus-visible:opacity-95 [&_.typography-run]:transition-[letter-spacing] [&_.typography-run]:duration-700 [&_.typography-run]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&_.typography-run]:!tracking-[0.12em] group-focus-visible:[&_.typography-run]:!tracking-[0.12em]"
                                >
                                    NEXT PROJECT
                                </Typography>
                                <Typography
                                    as="h2"
                                    preset="sans-body"
                                    size="title"
                                    weight="display"
                                    wrapPolicy="heading"
                                    align="center"
                                    className="text-white uppercase transition-all duration-700 [&_.typography-run]:transition-[letter-spacing] [&_.typography-run]:duration-700 [&_.typography-run]:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&_.typography-run]:!tracking-[0.04em] group-focus-visible:[&_.typography-run]:!tracking-[0.04em]"
                                >
                                    {destinationName}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </MotionLink>
            <div className="border-t border-white/10 bg-black">
                <div
                    className="grid-container gap-y-2 py-8 text-center md:text-left"
                    style={{ paddingTop: getSpacingRem(resolvedDesign.footerTopSpacing), paddingBottom: getSpacingRem(resolvedDesign.footerTopSpacing) }}
                >
                    <div className="col-span-12 grid grid-cols-12 gap-y-2 text-center lg:items-center lg:text-left">
                        <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="semantic"
                            wrapPolicy="label"
                            className={`${getResponsiveGridColumnClassName(resolvedDesign.footerLeftBounds)} text-textMuted`}
                        >
                            © 2026 江承彦 / JIANG CHENGYAN
                        </Typography>
                        <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="semantic"
                            wrapPolicy="label"
                            className={`${getResponsiveGridColumnClassName(resolvedDesign.footerRightBounds)} text-textMuted lg:text-right lg:justify-self-end`}
                        >
                            Designed for Darkness
                        </Typography>
                    </div>
                </div>
            </div>
        </footer>
    );
}
