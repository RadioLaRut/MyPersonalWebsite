import React, { type CSSProperties, type ReactNode } from "react";
import ContactFlashlightIsland from "./ContactFlashlightIsland";
import Typography, {
    type TypographyAlignment,
} from "@/components/common/Typography";
import { getGridColumnClassName } from "@/lib/component-design-style";
import {
    type ComponentDesignOverride,
    resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { toPlainText } from "@/lib/editable-text";
import { PUBLIC_COPY } from "@/lib/public-copy";

export interface ContactFlashlightBlockProps extends ComponentDesignOverride<"ContactFlashlight"> {
    anchorId?: string;
    maskRadius?: number;
    maskSmoothness?: number;
    darkTextColor?: string;
    lightTextColor?: string;
    name?: ReactNode;
    taglineText?: ReactNode;
    taglineSub?: ReactNode;
    taglineSubAlign?: TypographyAlignment;
    email?: ReactNode;
    wechat?: ReactNode;
    copyLabel?: ReactNode;
    copySuccessMessage?: string;
    copyErrorMessage?: string;
    experienceHistory?: { company: ReactNode; role: ReactNode }[];
    creativeDirection?: { title: ReactNode; subtitle: ReactNode }[];
    experienceContent?: ReactNode;
    creativeContent?: ReactNode;
    editMode?: boolean;
}

export default function ContactFlashlightBlock({
    anchorId = "contact",
    maskRadius = 500,
    maskSmoothness = 40,
    darkTextColor = "rgba(255,255,255,0.4)",
    lightTextColor = "rgba(255,255,255,1)",
    name,
    taglineText,
    taglineSub,
    taglineSubAlign = "left",
    email,
    wechat,
    copyLabel = PUBLIC_COPY.contact.copyLabel,
    copySuccessMessage = PUBLIC_COPY.contact.copySuccessMessage,
    copyErrorMessage = PUBLIC_COPY.contact.copyErrorMessage,
    experienceHistory = [],
    creativeDirection = [],
    experienceContent,
    creativeContent,
    editMode = false,
    design: designOverride,
}: ContactFlashlightBlockProps) {
    const design = resolveComponentDesign("ContactFlashlight", designOverride);
    const emailText = toPlainText(email) ?? "";
    const wechatText = toPlainText(wechat) ?? "";
    const maskImage =
        `radial-gradient(${maskRadius}px circle at var(--flashlight-x, 50%) var(--flashlight-y, 50%), black 0%, black ${maskSmoothness}%, transparent 100%)`;
    const revealLayerStyle: CSSProperties = {
        color: lightTextColor,
        WebkitMaskImage: maskImage,
        maskImage,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
    };

    const renderContentData = (interactive = true) => (
        <div className="grid-container w-full rhythm-section-spacious">
            <section className={`${getGridColumnClassName(design.heroBounds)} mb-16 grid rhythm-stack-3 lg:mb-32`}>
                <h1
                    data-contact-enter={editMode ? undefined : "0"}
                    className="mix-blend-normal"
                >
                    <Typography
                        as="span"
                        preset="luna-editorial"
                        size="hero"
                        weight="semantic"
                        wrapPolicy="heading"
                        className="text-inherit"
                    >
                        {name}
                    </Typography>
                </h1>
                <div
                    data-contact-enter={editMode ? undefined : "300"}
                    className="max-w-2xl text-left mix-blend-normal"
                >
                    <Typography
                        as="p"
                        preset="sans-body"
                        size="body"
                        weight="strong"
                        wrapPolicy="prose"
                        className="text-inherit"
                    >
                        {taglineText}
                    </Typography>
                    <br />
                    <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="semantic"
                        wrapPolicy="prose"
                        align={taglineSubAlign}
                        className="opacity-50"
                    >
                        {taglineSub}
                    </Typography>
                </div>
            </section>

            <section
                data-contact-enter={editMode ? undefined : "600"}
                className={`${getGridColumnClassName(design.detailBounds)} grid grid-cols-1 gap-10 border-t border-current text-left rhythm-divider-top lg:grid-cols-2 lg:gap-16`}
            >
                <div className="rhythm-stack-4">
                    <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="semantic"
                        wrapPolicy="label"
                        className="opacity-40 mix-blend-normal"
                    >
                        Experience History
                    </Typography>
                    <div className="mix-blend-normal rhythm-stack-3">
                        {experienceContent ? (
                            experienceContent
                        ) : (
                            experienceHistory.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography
                                        as="span"
                                        preset="sans-body"
                                        size="body"
                                        weight="strong"
                                        wrapPolicy="prose"
                                        className="text-inherit"
                                    >
                                        {item.company}
                                    </Typography>
                                    <Typography
                                        as="span"
                                        preset="sans-body"
                                        size="label"
                                        weight="semantic"
                                        wrapPolicy="label"
                                        className="mt-2 opacity-50"
                                    >
                                        {item.role}
                                    </Typography>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rhythm-stack-4">
                    <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="semantic"
                        wrapPolicy="label"
                        className="opacity-40 mix-blend-normal"
                    >
                        Creative Direction
                    </Typography>
                    <div className="mix-blend-normal rhythm-stack-3">
                        {creativeContent ? (
                            creativeContent
                        ) : (
                            creativeDirection.map((item, i) => (
                                <div key={i} className="grid gap-1">
                                    <Typography
                                        as="span"
                                        preset="sans-body"
                                        size="body"
                                        weight="strong"
                                        wrapPolicy="prose"
                                        className="text-inherit"
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        as="span"
                                        preset="sans-body"
                                        size="label"
                                        weight="semantic"
                                        wrapPolicy="label"
                                        className="mt-2 opacity-50"
                                    >
                                        {item.subtitle}
                                    </Typography>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section
                data-contact-enter={editMode ? undefined : "900"}
                className={`${getGridColumnClassName(design.contactBounds)} mt-16 grid grid-cols-1 items-start gap-12 border-t border-current text-left rhythm-divider-top lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20`}
            >
                <div className="rhythm-stack-3">
                    <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="semantic"
                        wrapPolicy="label"
                        className="opacity-40 mix-blend-normal"
                    >
                        WeChat / Social
                    </Typography>
                    <button
                        type="button"
                        disabled={!wechatText || editMode || !interactive}
                        data-contact-copy={!editMode && interactive ? "" : undefined}
                        className="copyable-contact group grid w-fit max-w-full gap-2 text-left mix-blend-normal focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current disabled:cursor-text"
                        aria-label={
                          wechatText
                            ? `${PUBLIC_COPY.contact.copyLabel} ${wechatText}`
                            : PUBLIC_COPY.contact.unavailableLabel
                        }
                    >
                        <Typography
                            as="span"
                            preset="gothic-editorial"
                            size="body-lg"
                            weight="semantic"
                            wrapPolicy="url"
                            className="break-all text-inherit"
                        >
                            {wechat}
                        </Typography>
                        <Typography
                            as="span"
                            preset="sans-body"
                            size="caption"
                            weight="semantic"
                            wrapPolicy="label"
                            className="opacity-50 transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
                        >
                            <span data-contact-copy-feedback={!editMode && interactive ? "" : undefined}>
                                {copyLabel}
                            </span>
                        </Typography>
                    </button>
                    <span
                        className="sr-only"
                        role="status"
                        aria-live="polite"
                        data-contact-copy-live={!editMode && interactive ? "" : undefined}
                    >
                        {""}
                    </span>
                </div>

                <div className="rhythm-stack-3">
                    <Typography
                        as="span"
                        preset="sans-body"
                        size="label"
                        weight="semantic"
                        wrapPolicy="label"
                        className="opacity-40 mix-blend-normal"
                    >
                        Email / Contact
                    </Typography>
                    {emailText ? (
                        <a
                            href={`mailto:${emailText}`}
                            tabIndex={interactive ? undefined : -1}
                            className="copyable-contact block w-fit max-w-full break-all mix-blend-normal focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current"
                        >
                            <Typography
                                as="span"
                                preset="gothic-editorial"
                                size="body-lg"
                                weight="semantic"
                                wrapPolicy="url"
                                className="text-inherit"
                            >
                                {email}
                            </Typography>
                        </a>
                    ) : (
                        <Typography
                            as="span"
                            preset="gothic-editorial"
                            size="body-lg"
                            weight="semantic"
                            wrapPolicy="url"
                            className="copyable-contact block break-all mix-blend-normal"
                        >
                            {email}
                        </Typography>
                    )}
                </div>
            </section>
        </div>
    );

    return (
        <div
            id={anchorId || undefined}
            className="relative w-full scroll-mt-24 overflow-hidden selection:bg-white selection:text-black"
            data-contact-flashlight={editMode ? undefined : ""}
        >
            <div className="relative w-full mx-auto pb-16">
                {editMode ? (
                    <div
                        className="z-10 transition-colors duration-300"
                        style={{ color: lightTextColor }}
                    >
                        {renderContentData()}
                    </div>
                ) : (
                    <>
                {/* Base Layer (Dark Text) */}
                <div
                    className="z-10 transition-colors duration-300"
                    style={{ color: darkTextColor }}
                >
                    {renderContentData()}
                </div>

                {/* Reveal Layer (White Text masked by cursor) */}
                <div
                    className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
                    aria-hidden="true"
                    style={revealLayerStyle}
                    data-contact-reveal-layer=""
                    data-mask-image={maskImage}
                >
                    {renderContentData(false)}
                </div>
                    </>
                )}
            </div>
            {!editMode ? (
                <ContactFlashlightIsland
                    copyErrorMessage={copyErrorMessage}
                    copyLabel={toPlainText(copyLabel) ?? PUBLIC_COPY.contact.copyLabel}
                    copySuccessMessage={copySuccessMessage}
                    maskRadius={maskRadius}
                    wechat={wechatText}
                />
            ) : null}
        </div>
    );
}
