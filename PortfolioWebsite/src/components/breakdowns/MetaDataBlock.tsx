'use client';

import React from 'react';

interface MetaDataBlockProps {
    items: {
        label: string;
        value: string;
    }[];
}

export default function MetaDataBlock({ items }: MetaDataBlockProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full my-24 border-t border-white/20 pt-8 pb-8 bg-black">
            <div className="grid-container text-center md:text-left">
                {items.map((item, i) => (
                    <div key={i} className="col-span-4 md:col-span-3 mb-8 md:mb-0">
                        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40 mb-2">
                            {item.label}
                        </div>
                        <div className="font-mono text-sm lg:text-base uppercase tracking-widest text-white/90">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
