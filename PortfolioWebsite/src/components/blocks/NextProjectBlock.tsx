import React from "react";

interface NextProjectBlockProps {
    nextId: string;
    nextName: string;
    nextBg: string;
    href?: string;
}

export default function NextProjectBlock({ nextId, nextName, nextBg, href }: NextProjectBlockProps) {
    const isCmsPreviewEnabled =
        process.env.NEXT_PUBLIC_ENABLE_PUCK === "true" || process.env.NEXT_PUBLIC_USE_JSON === "true";
    const nextHref = href ?? (isCmsPreviewEnabled ? `/p/works/${nextId}` : `/works/${nextId}`);

    return (
        <footer className="mt-0 border-t border-white/20 relative z-20">
            <a
                href={nextHref}
                className="group block relative h-[40vh] md:h-[60vh] overflow-hidden w-full interactive bg-black"
            >
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 z-10 transition-colors duration-700 pointer-events-none"></div>
                <img
                    src={nextBg}
                    alt="Next Project"
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-out opacity-40 group-hover:opacity-100"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 mix-blend-difference pointer-events-none">
                    <span className="font-mono text-xs text-white/50 tracking-[0.3em] uppercase mb-4 opacity-70 group-hover:opacity-100 transition-all duration-700">
                        NEXT PROJECT
                    </span>
                    <h2 className="text-4xl md:text-[6vw] text-white font-black uppercase tracking-tighter transition-all duration-700 leading-none font-futura">
                        {nextName}
                    </h2>
                </div>
            </a>
            <div className="bg-black py-8 px-8 md:px-12 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs font-mono text-white/40 tracking-widest border-t border-white/10">
                <span className="mb-2 md:mb-0">© 2026 江承彦 / JIANG CHENGYAN</span>
                <span>Designed for Darkness</span>
            </div>
        </footer>
    );
}
