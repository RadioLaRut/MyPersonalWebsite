'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import puckConfig from '@/puck/config';

const ENABLE_PLAYGROUND = true;
const EXCLUDED_COMPONENT_KEYS = new Set(['ContactFlashlight']);

const playgroundComponents = Object.entries(puckConfig.components).filter(
  ([componentKey]) => !EXCLUDED_COMPONENT_KEYS.has(componentKey),
);

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
        <div className="col-span-4 md:col-start-2 md:col-span-10 mb-24">
          <Link
            href="/"
            className="inline-block mb-8 font-mono text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
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
            className="font-futura text-white/70 tracking-wide text-lg md:text-xl max-w-3xl"
          >
            当前页面会自动展示 Puck 中全部常规组件（已排除特效组件），用于统一预览布局与交互。
          </motion.p>
        </div>

        <div className="col-span-4 md:col-span-12 border-b border-white/20 mb-24" />

        {playgroundComponents.map(([componentKey, componentConfig], index) => {
          const componentProps = {
            ...(componentConfig.defaultProps ?? {}),
            editMode: false,
          } as never;

          return (
            <div key={componentKey} className="col-span-4 md:col-span-12 mb-32 group">
              <div className="mb-4">
                <span className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                  {`UI COMPONENT ${String(index + 1).padStart(2, '0')}`}
                </span>
                <h2 className="text-2xl font-futura tracking-widest mt-2 mb-8">{`<${componentKey} />`}</h2>
              </div>

              {componentConfig.render(componentProps)}
            </div>
          );
        })}
      </div>
    </main>
  );
}
