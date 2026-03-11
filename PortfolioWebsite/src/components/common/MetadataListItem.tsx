import type { ReactNode } from "react";
import Typography from "@/components/common/Typography";

interface MetadataListItemProps {
  label: ReactNode;
  value: ReactNode;
  align?: "start" | "end";
}

export default function MetadataListItem({ label, value, align = "start" }: MetadataListItemProps) {
  const valueClassName =
    align === "end"
      ? "text-textPrimary text-left md:text-right max-w-full md:max-w-[75%] self-start md:self-end"
      : "text-textPrimary";

  return (
    <div className="flex flex-col gap-1">
      <Typography
        as="span"
        preset="sans-body"
        size="caption"
        weight="medium"
        wrapPolicy="label"
        className="text-textMuted"
      >
        {label}
      </Typography>
      <Typography
        as="span"
        preset="sans-body"
        size="body-sm"
        weight="regular"
        wrapPolicy="prose"
        align={align === "end" ? "right" : "left"}
        className={valueClassName}
      >
        {value}
      </Typography>
    </div>
  );
}
