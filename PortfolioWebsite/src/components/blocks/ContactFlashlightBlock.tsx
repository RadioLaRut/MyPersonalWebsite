import React, { type CSSProperties, type ReactNode } from "react";
import ContactFlashlightIsland from "./ContactFlashlightIsland";
import ComponentLayoutNode, {
    getComponentLayoutAlignment,
    getComponentLayoutTypography,
    type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
    type TypographyAlignment,
} from "@/components/common/Typography";
import {
    getComponentSectionProfileClassName,
    getGridColumnClassName,
} from "@/lib/component-design-style";
import {
    type ComponentDesignOverride,
    resolveComponentDesign,
} from "@/lib/component-design-runtime";
import { hasEditableTextContent, toPlainText } from "@/lib/editable-text";
import { PUBLIC_COPY } from "@/lib/public-copy";

export interface ContactFlashlightBlockProps extends ComponentDesignOverride<"ContactFlashlight">, ComponentLayoutProps {
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
    clientsHeading?: ReactNode;
    employmentHeading?: ReactNode;
    contactHeading?: ReactNode;
    emailHeading?: ReactNode;
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
    clientsHeading,
    employmentHeading,
    contactHeading,
    emailHeading,
    componentLayout,
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

    const renderV2ContentData = (interactive = true) => {
        if (!componentLayout) return null;
        const typography = (nodeId: string) =>
            getComponentLayoutTypography(componentLayout, nodeId);
        return (
            <div className={`grid-container w-full ${getComponentSectionProfileClassName(componentLayout)}`}>
                {hasEditableTextContent(name) ? (
                    <ComponentLayoutNode layout={componentLayout} nodeId="name">
                        <Typography
                            as="h1"
                            preset={typography("name")?.preset ?? "luna-editorial"}
                            size={typography("name")?.size ?? "display"}
                            weight="semantic"
                            wrapPolicy={typography("name")?.wrap ?? "heading"}
                            align={getComponentLayoutAlignment(componentLayout, "name")}
                            className="text-inherit"
                        >
                            {name}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(taglineText) ? (
                    <ComponentLayoutNode
                        gapFrom="name"
                        layout={componentLayout}
                        nodeId="tagline"
                    >
                        <Typography
                            as="p"
                            preset={typography("tagline")?.preset ?? "sans-body"}
                            size={typography("tagline")?.size ?? "title-sm"}
                            weight="semantic"
                            wrapPolicy={typography("tagline")?.wrap ?? "heading"}
                            align={getComponentLayoutAlignment(componentLayout, "tagline")}
                            className="text-inherit"
                        >
                            {taglineText}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(taglineSub) ? (
                    <ComponentLayoutNode
                        gapFrom={hasEditableTextContent(taglineText) ? "tagline" : "name"}
                        layout={componentLayout}
                        nodeId="taglineSub"
                    >
                        <Typography
                            as="p"
                            preset={typography("taglineSub")?.preset ?? "sans-body"}
                            size={typography("taglineSub")?.size ?? "body"}
                            weight="semantic"
                            wrapPolicy={typography("taglineSub")?.wrap ?? "prose"}
                            align={getComponentLayoutAlignment(
                                componentLayout,
                                "taglineSub",
                                taglineSubAlign,
                            )}
                            className="opacity-50"
                        >
                            {taglineSub}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(clientsHeading) ? (
                    <ComponentLayoutNode layout={componentLayout} nodeId="clientsHeading">
                        <Typography
                            as="h2"
                            preset={typography("clientsHeading")?.preset ?? "sans-body"}
                            size={typography("clientsHeading")?.size ?? "label"}
                            weight="semantic"
                            wrapPolicy={typography("clientsHeading")?.wrap ?? "label"}
                            align={getComponentLayoutAlignment(componentLayout, "clientsHeading")}
                            className="opacity-40"
                        >
                            {clientsHeading}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {(experienceContent || experienceHistory.length > 0) ? (
                    <ComponentLayoutNode
                        gapFrom="clientsHeading"
                        layout={componentLayout}
                        nodeId="clients.item"
                    >
                        {experienceContent ?? experienceHistory.map((item, index) => (
                            <div key={index} className="grid gap-1">
                                <Typography
                                    as="span"
                                    preset={typography("clients.item")?.preset ?? "sans-body"}
                                    size={typography("clients.item")?.size ?? "body-sm"}
                                    weight="strong"
                                    wrapPolicy={typography("clients.item")?.wrap ?? "prose"}
                                    align={getComponentLayoutAlignment(componentLayout, "clients.item")}
                                    className="text-inherit"
                                >
                                    {item.company}
                                </Typography>
                                <Typography
                                    as="span"
                                    preset={typography("clients.item")?.preset ?? "sans-body"}
                                    size={typography("clients.item")?.size ?? "body-sm"}
                                    weight="semantic"
                                    wrapPolicy={typography("clients.item")?.wrap ?? "prose"}
                                    align={getComponentLayoutAlignment(componentLayout, "clients.item")}
                                    className="opacity-50"
                                >
                                    {item.role}
                                </Typography>
                            </div>
                        ))}
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(employmentHeading) ? (
                    <ComponentLayoutNode layout={componentLayout} nodeId="employmentHeading">
                        <Typography
                            as="h2"
                            preset={typography("employmentHeading")?.preset ?? "sans-body"}
                            size={typography("employmentHeading")?.size ?? "label"}
                            weight="semantic"
                            wrapPolicy={typography("employmentHeading")?.wrap ?? "label"}
                            align={getComponentLayoutAlignment(componentLayout, "employmentHeading")}
                            className="opacity-40"
                        >
                            {employmentHeading}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {(creativeContent || creativeDirection.length > 0) ? (
                    <ComponentLayoutNode
                        gapFrom="employmentHeading"
                        layout={componentLayout}
                        nodeId="employment.item"
                    >
                        {creativeContent ?? creativeDirection.map((item, index) => (
                            <div key={index} className="grid gap-1">
                                <Typography
                                    as="span"
                                    preset={typography("employment.item")?.preset ?? "sans-body"}
                                    size={typography("employment.item")?.size ?? "body-sm"}
                                    weight="strong"
                                    wrapPolicy={typography("employment.item")?.wrap ?? "prose"}
                                    align={getComponentLayoutAlignment(componentLayout, "employment.item")}
                                    className="text-inherit"
                                >
                                    {item.title}
                                </Typography>
                                <Typography
                                    as="span"
                                    preset={typography("employment.item")?.preset ?? "sans-body"}
                                    size={typography("employment.item")?.size ?? "body-sm"}
                                    weight="semantic"
                                    wrapPolicy={typography("employment.item")?.wrap ?? "prose"}
                                    align={getComponentLayoutAlignment(componentLayout, "employment.item")}
                                    className="opacity-50"
                                >
                                    {item.subtitle}
                                </Typography>
                            </div>
                        ))}
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(contactHeading) ? (
                    <ComponentLayoutNode layout={componentLayout} nodeId="contactHeading">
                        <Typography
                            preset={typography("contactHeading")?.preset ?? "sans-body"}
                            size={typography("contactHeading")?.size ?? "label"}
                            weight="semantic"
                            wrapPolicy={typography("contactHeading")?.wrap ?? "label"}
                            align={getComponentLayoutAlignment(componentLayout, "contactHeading")}
                            className="opacity-40"
                        >
                            {contactHeading}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {wechatText ? (
                    <ComponentLayoutNode
                        gapFrom="contactHeading"
                        layout={componentLayout}
                        nodeId="wechat"
                    >
                        <button
                            type="button"
                            disabled={editMode || !interactive}
                            data-contact-copy={!editMode && interactive ? "" : undefined}
                            className="copyable-contact grid w-fit max-w-full text-left"
                        >
                            <Typography
                                as="span"
                                preset={typography("wechat")?.preset ?? "gothic-editorial"}
                                size={typography("wechat")?.size ?? "body-lg"}
                                weight="semantic"
                                wrapPolicy={typography("wechat")?.wrap ?? "url"}
                                align={getComponentLayoutAlignment(componentLayout, "wechat")}
                                className="break-all text-inherit"
                            >
                                {wechat}
                            </Typography>
                        </button>
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(copyLabel) ? (
                    <ComponentLayoutNode
                        gapFrom="wechat"
                        layout={componentLayout}
                        nodeId="copyPrompt"
                    >
                        <Typography
                            as="span"
                            preset={typography("copyPrompt")?.preset ?? "sans-body"}
                            size={typography("copyPrompt")?.size ?? "caption"}
                            weight="semantic"
                            wrapPolicy={typography("copyPrompt")?.wrap ?? "label"}
                            align={getComponentLayoutAlignment(componentLayout, "copyPrompt")}
                            className="opacity-50"
                        >
                            <span data-contact-copy-feedback={!editMode && interactive ? "" : undefined}>
                                {copyLabel}
                            </span>
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {hasEditableTextContent(emailHeading) ? (
                    <ComponentLayoutNode layout={componentLayout} nodeId="emailHeading">
                        <Typography
                            preset={typography("emailHeading")?.preset ?? "sans-body"}
                            size={typography("emailHeading")?.size ?? "label"}
                            weight="semantic"
                            wrapPolicy={typography("emailHeading")?.wrap ?? "label"}
                            align={getComponentLayoutAlignment(componentLayout, "emailHeading")}
                            className="opacity-40"
                        >
                            {emailHeading}
                        </Typography>
                    </ComponentLayoutNode>
                ) : null}
                {emailText ? (
                    <ComponentLayoutNode
                        gapFrom="emailHeading"
                        layout={componentLayout}
                        nodeId="email"
                    >
                        <a
                            href={`mailto:${emailText}`}
                            tabIndex={interactive ? undefined : -1}
                            className="copyable-contact block w-fit max-w-full break-all"
                        >
                            <Typography
                                as="span"
                                preset={typography("email")?.preset ?? "gothic-editorial"}
                                size={typography("email")?.size ?? "body-lg"}
                                weight="semantic"
                                wrapPolicy={typography("email")?.wrap ?? "url"}
                                align={getComponentLayoutAlignment(componentLayout, "email")}
                                className="text-inherit"
                            >
                                {email}
                            </Typography>
                        </a>
                    </ComponentLayoutNode>
                ) : null}
            </div>
        );
    };

    const renderContentData = (interactive = true) => componentLayout
      ? renderV2ContentData(interactive)
      : (
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
