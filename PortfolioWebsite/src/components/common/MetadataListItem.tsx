import type { ReactNode } from "react";

interface MetadataListItemProps {
  label: ReactNode;
  value: ReactNode;
  align?: "start" | "end";
}

export default function MetadataListItem({ label, value, align = "start" }: MetadataListItemProps) {
  const valueClassName =
    align === "end"
      ? "font-mono text-textPrimary text-left md:text-right max-w-full md:max-w-[75%] self-start md:self-end break-words leading-relaxed"
      : "font-futura text-textPrimary leading-[1.85] break-words";

  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-mono text-textMuted break-words">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
