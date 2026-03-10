'use client';

import React, { type ReactNode } from 'react';

interface SectionHeadlineProps {
    title: ReactNode;
}

export default function BreakdownSectionHeadline({ title }: SectionHeadlineProps) {
    return (
        <div className="w-full my-16 grid-container">
            <div className="col-span-12">
                <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-none font-futura">
                    {title}
                </h2>
            </div>
        </div>
    );
}
