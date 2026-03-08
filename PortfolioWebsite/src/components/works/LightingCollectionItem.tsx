"use client";

import { motion } from "framer-motion";
import ImageSlider from "@/components/breakdowns/ImageSlider";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

export interface LightingCollectionItemProps {
  lit: string;
  unlit?: string;
  caption: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
  index?: number;
  total?: number;
}

export default function LightingCollectionItem({
  lit,
  unlit,
  caption,
  preset,
  fitMode,
  index = 0,
  total = 1,
}: LightingCollectionItemProps) {
  if (!lit) {
    return null;
  }

  return (
    <div className="mb-32 last:mb-0 px-4 md:px-0">
      <div className="grid-container max-w-[100vw]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="col-span-4 md:col-start-2 md:col-span-10"
        >
          <div className="w-full bg-white/5 border border-white/10 relative overflow-hidden group">
            {unlit ? (
              <ImageSlider
                unlitSrc={unlit}
                litSrc={lit}
                alt={caption}
                className="my-0"
                imagePreset={preset}
                imageFitMode={fitMode}
              />
            ) : (
              <PresetImage
                src={lit}
                alt={caption}
                preset={preset}
                fitMode={fitMode}
              />
            )}
          </div>

          <div className="mt-6 flex justify-between items-center px-2">
            <p className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
              SLIDE {index + 1} OF {total}
            </p>
            <p className="font-futura text-xs md:text-sm tracking-widest text-white/80">
              {caption}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
