"use client";

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
    <div className="w-full rhythm-block-compact border-t border-white/20 bg-black py-8">
      <div className="grid-container text-center lg:text-left">
        {items.map((item, i) => (
          <div key={i} className="col-span-3 mb-8 lg:mb-0">
            <Typography
              as="div"
              preset="sans-body"
              size="caption"
              weight="semantic"
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
