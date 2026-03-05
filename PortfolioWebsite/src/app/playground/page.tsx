'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ImageSlider from '@/components/breakdowns/ImageSlider';
import MediaTextCard from '@/components/breakdowns/MediaTextCard';
import TextSplitLayout from '@/components/breakdowns/TextSplitLayout';
import ParameterGrid from '@/components/breakdowns/ParameterGrid';
import MosaicGallery from '@/components/breakdowns/MosaicGallery';
import MetaDataBlock from '@/components/breakdowns/MetaDataBlock';
import HighDensityInfoBlock from '@/components/breakdowns/HighDensityInfoBlock';

// This is a feature toggle, in a production app this might come from env vars
// For portfolio purposes, we hardcode it here or in a config file
const ENABLE_PLAYGROUND = true;

export default function PlaygroundPage() {
    if (!ENABLE_PLAYGROUND) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <h1 className="text-2xl font-mono">404 - Not Found</h1>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pt-32 pb-32">
            <div className="grid-container">

                {/* Header Section */}
                <div className="col-span-4 md:col-start-2 md:col-span-10 mb-24">
                    <Link href="/" className="inline-block mb-8 font-mono text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
                        ← 返回首页
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[8vw] md:text-[5vw] font-luna font-black leading-none tracking-tighter mb-6"
                    >
                        PLAYGROUND 游乐场
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-futura text-white/70 tracking-wide text-lg md:text-xl max-w-2xl"
                    >
                        预制“作品分解（Breakdown）”组件的测试阅览区。向下滚动以查看带有占位文案的各个预制件的排版与交互效果。
                    </motion.p>
                </div>

                {/* Divider */}
                <div className="col-span-4 md:col-span-12 border-b border-white/20 mb-24"></div>

                {/* Component 1: ImageSlider */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 01</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2">{`<ImageSlider />`}</h2>
                    </div>
                    <ImageSlider
                        unlitSrc="/images/Test/unlit.jpg"
                        litSrc="/images/Test/lit.jpg"
                    />
                </div>

                {/* Component 2: MediaTextCard */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 02</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<MediaTextCard />`}</h2>
                    </div>
                    <MediaTextCard
                        title="资产锁定系统 (ASSET LOCK SYSTEM)"
                        description="基于 UE 编辑器开发设计了一套资产锁定系统：监听资产状态变化并自动锁定/解锁；通过缩略图角标及 UI 提示增强团队协作可见性，并对他人已锁定资产提供只读限制，实现了近似 Perforce 独占排他锁的体验。"
                        tags={["虚幻引擎", "C++", "工具链", "GIT 工作流"]}
                        imageSrc="/images/Test/unlit.jpg"
                    />
                </div>

                {/* Component 3: TextSplitLayout */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 03 A</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<TextSplitLayout layoutVariant="split-left" />`}</h2>
                    </div>
                    <TextSplitLayout
                        heading="死寂与疏离 (SILENT & ALIENATED)"
                        layoutVariant="split-left"
                        imageSrc="/images/Test/lit.jpg"
                        paragraphs={[
                            "叙事基调需要营造一种极致的孤独与隔离感。通过操纵体积雾密度并严格遵循去色、冷峻的色彩调色板，在没有任何对白之前，我们就已经建立起了一套传达‘疏离’的视觉语言。",
                            "我利用强烈的定向光线制造冷厉的阴影分割，强调粗野主义的建筑几何，让玩家在这些庞大的工业巨构面前感到彻底的暴露与渺小。"
                        ]}
                    />

                    <div className="mb-4 mt-32">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 03 B</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<TextSplitLayout layoutVariant="stack" />`}</h2>
                    </div>
                    <TextSplitLayout
                        heading="压倒性的极简 (OVERWHELMING MINIMALISM)"
                        layoutVariant="stack"
                        imageSrc="/images/Test/unlit.jpg"
                        paragraphs={[
                            "在中心对称的构图中加入极简的灯光，引导玩家视觉汇聚于一点。",
                        ]}
                    />
                </div>

                {/* Component 4: ParameterGrid */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 04 A</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<ParameterGrid /> (With Parameters)`}</h2>
                    </div>
                    <ParameterGrid
                        mediaSrc="/images/Test/unlit.jpg"
                        parameters={[
                            { name: "房屋密度 (HOUSE DENSITY)", value: "150-300", description: "控制样条线边界内生成的房屋总数。" },
                            { name: "偏航角偏移 (YAW OFFSET)", value: "±15°", description: "添加有机的随机旋转偏移，以打破呆板的网格对齐感。" },
                            { name: "植被层级 (FOLIAGE TIER)", value: "03", description: "决定程序化底层植被杂草的密度与缩放多样性。" },
                            { name: "随意的注释 (UNCONFIGURED VALUE)", description: "如果不配置数值，则底下的说明文本会顺畅地向上补齐，不留突兀的空白。" }
                        ]}
                    />

                    <div className="mb-4 mt-32">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 04 B</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<ParameterGrid /> (Media Only)`}</h2>
                    </div>
                    <ParameterGrid
                        mediaSrc="/images/Test/lit.jpg"
                    />
                </div>

                {/* Component 5: MosaicGallery */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 05</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<MosaicGallery />`}</h2>
                    </div>
                    <MosaicGallery
                        images={[
                            { src: "/images/Test/unlit.jpg", caption: "最终打磨 (FINAL POLISH)" },
                            { src: "/images/Test/lit.jpg", caption: "白盒阶段 (BLOCKOUT)" },
                            { src: "/images/Test/unlit.jpg", caption: "灯光阶段 (LIGHTING PASS)" }
                        ]}
                    />
                </div>

                {/* Component 6: MetaDataBlock */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 06</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<MetaDataBlock />`}</h2>
                    </div>
                    <MetaDataBlock
                        items={[
                            { label: "职责", value: "主策划 / 技术美术" },
                            { label: "引擎", value: "UNREAL ENGINE 5" },
                            { label: "开发周期", value: "10 个月" },
                            { label: "工具栈", value: "蓝图, HOUDINI, GIT" }
                        ]}
                    />
                </div>

                {/* Component 7: HighDensityInfoBlock */}
                <div className="col-span-4 md:col-span-12 mb-32 group">
                    <div className="mb-4">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">UI COMPONENT 07</span>
                        <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<HighDensityInfoBlock />`}</h2>
                    </div>
                    <HighDensityInfoBlock
                        phase1={{
                            title: "缺乏 3D 管线与 UE 经验",
                            content: "团队饱受频繁的合并冲突与未被记录的资产更改之苦。美术与策划团队经常相互覆盖对方的工作，导致项目进度严重滞后。",
                            items: [{ label: "TEAM SIZE", value: "12 ARTISTS" }, { label: "CONFLICTS", value: "15+ PER WEEK" }]
                        }}
                        phase2={{
                            title: "中心化资产锁定架构",
                            content: "我设计了一套严格的 Git 工作流，并辅以自定义的虚幻引擎编辑器子系统（Editor Subsystem），在提交发生前自动监控并接管文件状态。",
                            items: [{ label: "01", value: "Custom Editor Subsystem catches Save events" }, { label: "02", value: "Query Perforce/Git lock status via bash script" }]
                        }}
                        phase3={{
                            title: "提升 40% 产出效率",
                            content: "消除了 95% 的合并冲突。美术人员现在可以通过可视化的界面立即得知某个资产是否被签出，大幅度降低了跨部门的心智内耗。",
                            imageSrc: "/images/Test/lit.jpg"
                        }}
                    />
                </div>


            </div>
        </main>
    );
}
