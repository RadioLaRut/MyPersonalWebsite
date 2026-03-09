"use client";

import { motion } from "framer-motion";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface LightingCollectionItemProps {
  src: string;
  caption: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  editMode?: boolean;
}

export default function LightingCollectionItem({
  src,
  caption,
  preset,
  fitMode,
  editMode = false,
}: LightingCollectionItemProps) {
  if (!src) {
    if (!editMode) {
      return null;
    }

    return (
      <div className="mb-32 last:mb-0">
        <div className="grid-container">
          <div className="col-span-4 md:col-start-2 md:col-span-10">
            <div className="flex aspect-video items-center justify-center border border-dashed border-white/15 bg-white/[0.02] px-6 text-center">
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                  LightingCollectionItem
                </p>
                <p className="font-futura text-xs uppercase tracking-[0.18em] text-white/70">
                  请设置图片 src
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageAlt = caption || "Lighting collection image";

  return (
    <div className="mb-32 last:mb-0">
      <div className="grid-container">
        <div className="col-span-4 md:col-start-2 md:col-span-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="w-full bg-white/5 border border-white/10 relative overflow-hidden group">
              <PresetImage
                src={src}
                alt={imageAlt}
                preset={preset}
                fitMode={fitMode}
              />
            </div>

            {caption ? (
              <div className="mt-4 px-2">
                <p className="font-futura text-xs md:text-sm tracking-widest text-white/80">
                  {caption}
                </p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
