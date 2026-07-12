"use client";
import React, { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import Typography from "@/components/common/Typography";
import { useComponentDesign } from "@/components/layout/ComponentDesignProvider";
import { getGridColumnClassName } from "@/lib/component-design-style";
import { motion, useInputCapabilities } from "@/lib/motion";

export interface ContactFlashlightBlockProps {
    anchorId?: string;
    maskRadius?: number;
    maskSmoothness?: number;
    darkTextColor?: string;
    lightTextColor?: string;
    name?: ReactNode;
    taglineText?: ReactNode;
    taglineSub?: ReactNode;
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
    email,
    wechat,
    copyLabel = "复制微信号",
    copySuccessMessage = "微信号已复制",
    copyErrorMessage = "复制失败，请手动选择微信号",
    experienceHistory = [],
    creativeDirection = [],
    experienceContent,
    creativeContent,
    editMode = false,
}: ContactFlashlightBlockProps) {
    const design = useComponentDesign("ContactFlashlight");
    const containerRef = useRef<HTMLDivElement>(null);
    const revealLayerRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
    const copyResetTimerRef = useRef<number | null>(null);
    const { isTouchLike } = useInputCapabilities();
    const disablesFlashlight = editMode || isTouchLike || isTouchDevice;
    const emailText = typeof email === "string" ? email.trim() : "";
    const wechatText = typeof wechat === "string" ? wechat.trim() : "";

    useEffect(() => () => {
        if (copyResetTimerRef.current !== null) {
            window.clearTimeout(copyResetTimerRef.current);
        }
    }, []);

    const copyWechat = async () => {
        if (!wechatText || !navigator.clipboard) {
            setCopyStatus("error");
        } else {
            try {
                await navigator.clipboard.writeText(wechatText);
                setCopyStatus("success");
            } catch {
                setCopyStatus("error");
            }
        }

        if (copyResetTimerRef.current !== null) {
            window.clearTimeout(copyResetTimerRef.current);
        }
        copyResetTimerRef.current = window.setTimeout(() => setCopyStatus("idle"), 3000);
    };

    useEffect(() => {
        if (editMode) {
            setIsTouchDevice(true);
            return;
        }

        const checkTouchDevice = () => {
            const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
            const isSmallScreen = window.innerWidth < 1024;
            // 双保险策略：触摸设备或小屏幕都禁用探视灯效果
            setIsTouchDevice(isCoarsePointer || isSmallScreen);
        };
        checkTouchDevice();
        window.addEventListener("resize", checkTouchDevice);
        return () => window.removeEventListener("resize", checkTouchDevice);
    }, [editMode]);

    useEffect(() => {
        if (disablesFlashlight) {
            return;
        }

        let lastClientX = window.innerWidth / 2;
        let lastClientY = window.innerHeight / 2;
        let frameId = 0;
        let frameQueued = false;

        const updatePosition = () => {
            frameQueued = false;

            if (!containerRef.current || !revealLayerRef.current) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const relativeX = lastClientX - rect.left;
            const relativeY = lastClientY - rect.top;
            const minX = -maskRadius;
            const maxX = rect.width + maskRadius;
            const minY = -maskRadius;
            const maxY = rect.height + maskRadius;
            const x = Math.min(Math.max(relativeX, minX), maxX);
            const y = Math.min(Math.max(relativeY, minY), maxY);

            revealLayerRef.current.style.setProperty("--flashlight-x", `${x}px`);
            revealLayerRef.current.style.setProperty("--flashlight-y", `${y}px`);
        };

        const queueUpdate = () => {
            if (frameQueued) {
                return;
            }

            frameQueued = true;
            frameId = window.requestAnimationFrame(updatePosition);
        };

        const handleMouseMove = (e: MouseEvent) => {
            lastClientX = e.clientX;
            lastClientY = e.clientY;
            queueUpdate();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("scroll", queueUpdate, { passive: true });
        window.addEventListener("resize", queueUpdate);

        queueUpdate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("scroll", queueUpdate);
            window.removeEventListener("resize", queueUpdate);

            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, [disablesFlashlight, maskRadius]);

    const revealLayerStyle: CSSProperties = {
        color: lightTextColor,
        WebkitMaskImage: disablesFlashlight
            ? "none"
            : `radial-gradient(${maskRadius}px circle at var(--flashlight-x, 50%) var(--flashlight-y, 50%), black 0%, black ${maskSmoothness}%, transparent 100%)`,
        maskImage: disablesFlashlight
            ? "none"
            : `radial-gradient(${maskRadius}px circle at var(--flashlight-x, 50%) var(--flashlight-y, 50%), black 0%, black ${maskSmoothness}%, transparent 100%)`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
    };

    const renderContentData = (interactive = true) => (
        <div className="grid-container w-full rhythm-section-spacious">
            <section className={`${getGridColumnClassName(design.heroBounds)} mb-24 grid rhythm-stack-3 lg:mb-32`}>
                <motion.h1
                    initial={editMode ? false : { opacity: 0, y: 20 }}
                    animate={editMode ? undefined : { opacity: 1, y: 0 }}
                    transition={editMode ? undefined : { duration: 1 }}
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
                </motion.h1>
                <motion.div
                    initial={editMode ? false : { opacity: 0 }}
                    animate={editMode ? undefined : { opacity: 1 }}
                    transition={editMode ? undefined : { delay: 0.3, duration: 1 }}
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
                        wrapPolicy="label"
                        className="opacity-50"
                    >
                        {taglineSub}
                    </Typography>
                </motion.div>
            </section>

            <motion.section
                initial={editMode ? false : { opacity: 0 }}
                animate={editMode ? undefined : { opacity: 1 }}
                transition={editMode ? undefined : { delay: 0.6, duration: 1 }}
                className={`${getGridColumnClassName(design.detailBounds)} grid grid-cols-1 gap-16 border-t border-current text-left rhythm-divider-top lg:grid-cols-2`}
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
            </motion.section>

            <motion.section
                initial={editMode ? false : { opacity: 0 }}
                animate={editMode ? undefined : { opacity: 1 }}
                transition={editMode ? undefined : { delay: 0.9, duration: 1 }}
                className={`${getGridColumnClassName(design.contactBounds)} mt-24 grid grid-cols-1 items-start gap-12 border-t border-current text-left rhythm-divider-top lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20`}
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
                        onClick={copyWechat}
                        disabled={!wechatText || editMode || !interactive}
                        className="copyable-contact group grid w-fit max-w-full gap-2 text-left mix-blend-normal focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current disabled:cursor-text"
                        aria-label={wechatText ? `复制微信号 ${wechatText}` : "微信号不可复制"}
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
                            {copyStatus === "success"
                                ? copySuccessMessage
                                : copyStatus === "error"
                                  ? copyErrorMessage
                                  : copyLabel}
                        </Typography>
                    </button>
                    <span className="sr-only" role="status" aria-live="polite">
                        {copyStatus === "success"
                            ? copySuccessMessage
                            : copyStatus === "error"
                              ? copyErrorMessage
                              : ""}
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
            </motion.section>
        </div>
    );

    return (
        <div
            id={anchorId || undefined}
            className="relative w-full scroll-mt-24 overflow-hidden selection:bg-white selection:text-black"
        >
            <div ref={containerRef} className="relative w-full mx-auto pb-16">
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
                    ref={revealLayerRef}
                    className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
                    aria-hidden="true"
                    style={revealLayerStyle}
                >
                    {renderContentData(false)}
                </div>
                    </>
                )}
            </div>
        </div>
    );
}
