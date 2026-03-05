import React from "react";

interface PortfolioHeroHeaderProps {
    title: string;
    subtitle: string;
    descriptionLine1: string;
    descriptionLine2: string;
}

export default function PortfolioHeroHeader({
    title,
    subtitle,
    descriptionLine1,
    descriptionLine2,
}: PortfolioHeroHeaderProps) {
    return (
        <section className="pt-40 pb-20 px-4 md:px-12 grid-container">
            <div className="col-span-4 md:col-start-1 md:col-span-12 border-b border-white/10 pb-8">
                <h1 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna transform translate-y-2 text-white">
                    {title || "TITLE"}
                </h1>
                <div className="flex justify-between items-end mt-4">
                    <h2 className="text-[12vw] sm:text-[8vw] font-black tracking-tighter uppercase leading-none font-luna text-white/40">
                        {subtitle || "SUBTITLE"}
                    </h2>
                    <div className="text-right pb-2">
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                            {descriptionLine1 || "Description Line 1"}
                        </p>
                        <p className="font-serif text-sm tracking-widest text-white/70 mt-2">
                            {descriptionLine2 || "Description Line 2"}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
