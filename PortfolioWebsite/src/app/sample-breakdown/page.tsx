'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ImageSlider from '@/components/breakdowns/ImageSlider';
import ContentCard from '@/components/breakdowns/ContentCard';
import TextSplitLayout from '@/components/breakdowns/TextSplitLayout';
import ParameterGrid from '@/components/breakdowns/ParameterGrid';

import MetaDataBlock from '@/components/breakdowns/MetaDataBlock';
import HighDensityInfoBlock from '@/components/breakdowns/HighDensityInfoBlock';

export default function SampleBreakdownPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-32">
            <div className="grid-container">

                {/* Header Section */}
                <div className="col-start-2 col-span-10 mb-24">
                    <Link href="/" className="inline-block mb-8 font-mono text-xs uppercase tracking-[0.3em] text-textMuted hover:text-white transition-colors">
                        ← 返回主页
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[8vw] lg:text-[6vw] font-luna font-black leading-none tracking-tighter mb-6 uppercase"
                    >
                        Project: <br /> <span className="text-textMuted">Abandoned World</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-futura text-textPrimary tracking-wide text-lg lg:text-xl max-w-2xl"
                    >
                        这是一个向您展示如何使用预制组件拼接出一个完整项目 Breakdown 的样板页面。这里展示了能够适应从宏观灯光氛围、到具体工具开发流的排版组合逻辑。
                    </motion.p>
                </div>

                {/* Divider */}
                <div className="col-span-12 border-b border-white/20 mb-24"></div>

                <div className="col-span-12">
                    <MetaDataBlock
                        items={[
                            { label: "职责", value: "打光 / 技术美术" },
                            { label: "引擎", value: "UNREAL ENGINE 5.3" },
                            { label: "渲染", value: "LUMEN & RAYTRACING" },
                            { label: "周期", value: "3 周" }
                        ]}
                    />
                </div>

                <div className="col-span-12 mt-16">
                    <TextSplitLayout
                        heading="01. 确立视觉锚点"
                        layoutVariant="split-left"
                        paragraphs={[
                            "在初期白盒阶段，最大的挑战是如何在不引入多余细节的情况下，仅仅通过光影来确立空间尺度。在这个场景中，我利用侧逆光投射在废弃计算机显示器上的硬阴影，建立了‘冰冷、监视与压抑’的核心基调。",
                            "为了实现这一点，我刻意压暗了环境光补给，让定向主光源的物理反射成为空间内唯一的二次光源。"
                        ]}
                    />
                </div>

                <div className="col-span-12">
                    <ImageSlider
                        unlitSrc="/images/train-station/2NoLight.webp"
                        litSrc="/images/train-station/2Day.webp"
                        alt="Blockout vs Final Lighting"
                    />
                </div>

                <div className="col-span-12 mt-16">
                    <ContentCard
                        title="灯光绑定与自动曝光体验系统"
                        description="不仅是静态的美术调整，我还开发了一套蓝图工具，用于根据不同的镜头焦段和机位自动校准 Auto Exposure。\n这样可以确保在切换特写与远景时，高光不会溢出，暗部始终保持克制的细节。"
                        tags={["蓝图", "TA", "灯光管线"]}
                        imageSrc="/images/train-station/2NoLight.webp"
                    />
                </div>

                <div className="col-span-12 mt-16">
                    <ParameterGrid
                        mediaSrc="/images/train-station/2Day.webp"
                        parameters={[
                            { name: "体积雾消散系数 (VOLUMETRIC SCATTER)", value: "0.25", description: "控制光线在空气中传播时的衰减，实现更密集的'丁达尔'效应。" },
                            { name: "曝光补偿 (EV100)", value: "-2.0", description: "全局降低曝光基准，强制使场景大部分处于非常昏暗甚至死黑的阴影之中。" },
                            { name: "色彩校正 (COLOR GRADING)", description: "使用后期处理材质，对阴影中去饱和，只保留高光处的微弱暖色。你会发现没有配制底下的数值，这段文字会被很顺滑地向上补齐。" }
                        ]}
                    />
                </div>

                <div className="col-span-12 mt-16">
                    <TextSplitLayout
                        heading="02. 迭代与推演"
                        layoutVariant="stack"
                        paragraphs={[
                            "从早期的概念验证到最终输出的过程中，不同色温和光影结构的多次尝试是一条必经之路。下面的画廊展示了我在寻找最终画面基调时所经历的几种阶段性突破与迭代视角。",
                        ]}
                    />
                </div>



                <div className="col-span-12 mt-24 mb-32 border-t border-white/20 pt-24">
                    <div className="mb-24">
                        <span className="font-mono text-xs text-textMuted uppercase tracking-[0.3em]">WORKFLOW DEEP DIVE</span>
                        <h2 className="text-4xl lg:text-5xl font-luna mt-2">工作流痛点解决</h2>
                    </div>

                    <HighDensityInfoBlock
                        phase1={{
                            title: "灯光数据资产庞杂",
                            content: "传统工作流中，由于数十个灯光 Actor 分散在关卡中，协同修改非常困难，容易产生版本覆盖。",
                            items: [{ label: "ISSUES", value: "GIT MERGE CONFLICTS" }]
                        }}
                        phase2={{
                            title: "Data Asset 驱动的数据隔离",
                            content: "我引入了虚幻的 Primary Data Asset 系统，将所有的灯光强度、色温参数提取出来统一管理。关卡中不保存具体参数，只通过蓝图在运行时或编辑器刷新时读取 Data Asset。",
                            items: [{ label: "01", value: "Extract properties to DataAsset" }, { label: "02", value: "Construction Script driven update" }]
                        }}
                        phase3={{
                            title: "彻底解决协作痛点",
                            content: "由于 Data Asset 非常轻量且支持粒度更细的锁定，灯光师的参数调整不再与场景构建人员互相干扰，开发效率显著提升。",
                            imageSrc: "/images/train-station/2Day.webp"
                        }}
                    />
                </div>

            </div>
        </main>
    );
}
