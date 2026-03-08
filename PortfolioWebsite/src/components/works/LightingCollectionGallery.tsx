"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import ImageSlider from "@/components/breakdowns/ImageSlider";
import { PresetImage } from "@/components/common/PresetImage";
import { type ImageFitMode, type ImagePreset } from "@/lib/image-presentation";

type LightingCollectionImage = {
  lit: string;
  unlit?: string;
  caption: string;
  preset?: ImagePreset;
  fitMode?: ImageFitMode;
};

type LightingCollectionGalleryProps = {
  title: string;
  number: string;
  description?: string;
  backHref?: string;
  images: LightingCollectionImage[];
};

export default function LightingCollectionGallery({
  title,
  number,
  description,
  backHref = "/works/lighting-portfolio",
  images,
}: LightingCollectionGalleryProps) {
  return (
    <>
      <section className="pt-40 pb-20 px-8 md:px-16 border-b border-white/10">
        <Link
          href={backHref}
          className="inline-flex items-center text-white/40 hover:text-white transition-colors uppercase tracking-widest text-xs font-mono mb-12"
        >
          BACK TO PORTFOLIO
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="font-mono text-white/40 tracking-[0.4em] text-sm mb-4">COLLECTION {number}</p>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase font-luna text-white">
              {title}
            </h1>
          </div>
          <p className="font-futura tracking-widest text-white/60 text-sm max-w-sm">
            {description || `A detailed breakdown of lighting setup, mood exploration, and before/after comparisons for ${title.toLowerCase()}.`}
          </p>
        </div>
      </section>

      <section className="py-24">
        {images.map((img, index) => (
          <div key={`${img.caption}-${index}`} className="mb-32 last:mb-0 px-4 md:px-0">
            <div className="grid-container max-w-[100vw]">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                className="col-span-4 md:col-start-2 md:col-span-10"
              >
                <div className="w-full bg-white/5 border border-white/10 relative overflow-hidden group">
                  {img.unlit ? (
                    <ImageSlider
                      unlitSrc={img.unlit}
                      litSrc={img.lit}
                      alt={img.caption}
                      className="my-0"
                      imagePreset={img.preset}
                      imageFitMode={img.fitMode}
                    />
                  ) : (
                    <PresetImage
                      src={img.lit}
                      alt={img.caption}
                      preset={img.preset}
                      fitMode={img.fitMode}
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-between items-center px-2">
                  <p className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
                    SLIDE {index + 1} OF {images.length}
                  </p>
                  <p className="font-futura text-xs md:text-sm tracking-widest text-white/80">
                    {img.caption}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
