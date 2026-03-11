'use client';

import React, { type ReactNode } from 'react';
import Typography from "@/components/common/Typography";

interface SectionHeadlineProps {
    title: ReactNode;
}

export default function BreakdownSectionHeadline({ title }: SectionHeadlineProps) {
    return (
        <div className="w-full my-16 grid-container">
            <div className="col-span-12">
                <Typography
                    as="h2"
                    preset="sans-body"
                    size="title"
                    weight="display"
                    wrapPolicy="heading"
                    className="text-white"
                >
                    {title}
                </Typography>
            </div>
        </div>
    );
}
