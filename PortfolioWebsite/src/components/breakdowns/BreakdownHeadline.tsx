'use client';

import React from 'react';

interface BreakdownHeadlineProps {
    title: string;
}

export default function BreakdownHeadline({ title }: BreakdownHeadlineProps) {
    return (
        <div className="w-full my-16 grid-container">
            <div className="col-span-4 md:col-span-12">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none font-futura">
                    {title}
                </h2>
            </div>
        </div>
    );
}
