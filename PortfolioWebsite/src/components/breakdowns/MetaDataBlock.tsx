'use client';

import React from 'react';
import Typography from "@/components/common/Typography";

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
            <div className="grid-container text-center lg:text-left">
                {items.map((item, i) => (
                    <div key={i} className="col-span-3 mb-8 lg:mb-0">
                        <Typography
                            as="div"
                            preset="sans-body"
                            size="caption"
                            weight="medium"
                            wrapPolicy="label"
                            className="mb-2 text-textMuted"
                        >
                            {item.label}
                        </Typography>
                        <Typography
                            as="div"
                            preset="sans-body"
                            size="body-sm"
                            weight="medium"
                            wrapPolicy="label"
                            className="text-textPrimary"
                        >
                            {item.value}
                        </Typography>
                    </div>
                ))}
            </div>
        </div>
    );
}
