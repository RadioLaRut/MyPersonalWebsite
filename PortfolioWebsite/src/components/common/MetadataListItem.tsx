"use client";

import type { ReactNode } from "react";
import {
  getComponentLayoutAlignment,
  getComponentLayoutTypography,
} from "@/components/common/ComponentLayoutNode";
import {
  MetadataListItemLayoutNode,
  useMetadataListItemLayout,
} from "@/components/common/MetadataListItemLayoutContext";
import Typography from "@/components/common/Typography";

interface MetadataListItemProps {
  label: ReactNode;
  value: ReactNode;
  align?: "start" | "end";
}

export default function MetadataListItem({
  label,
  value,
  align = "start",
}: MetadataListItemProps) {
  const itemLayout = useMetadataListItemLayout();
  const valueClassName =
    align === "end"
      ? "text-textPrimary text-left md:text-right max-w-full md:max-w-[75%] self-start md:self-end"
      : "text-textPrimary";

  if (!itemLayout) {
    return (
      <div className="grid gap-1">
        <Typography
          as="span"
          preset="sans-body"
          size="caption"
          weight="semantic"
          wrapPolicy="label"
          className="text-textMuted"
        >
          {label}
        </Typography>
        <Typography
          as="span"
          preset="sans-body"
          size="body"
          weight="semantic"
          wrapPolicy="prose"
          align={align === "end" ? "right" : "left"}
          className={valueClassName}
        >
          {value}
        </Typography>
      </div>
    );
  }

  const labelTypography = getComponentLayoutTypography(
    itemLayout.layout,
    itemLayout.labelNodeId,
  );
  const valueTypography = getComponentLayoutTypography(
    itemLayout.layout,
    itemLayout.valueNodeId,
  );

  return (
    <div className="relative col-span-12 grid grid-cols-12 content-start">
      <MetadataListItemLayoutNode role="label">
        <Typography
          as="span"
          preset={labelTypography?.preset ?? "sans-body"}
          size={labelTypography?.size ?? "caption"}
          weight="semantic"
          wrapPolicy={labelTypography?.wrap ?? "label"}
          align={getComponentLayoutAlignment(
            itemLayout.layout,
            itemLayout.labelNodeId,
          )}
          className="text-textMuted"
        >
          {label}
        </Typography>
      </MetadataListItemLayoutNode>
      <MetadataListItemLayoutNode role="value">
        <Typography
          as="span"
          preset={valueTypography?.preset ?? "sans-body"}
          size={valueTypography?.size ?? "body"}
          weight="semantic"
          wrapPolicy={valueTypography?.wrap ?? "prose"}
          align={getComponentLayoutAlignment(
            itemLayout.layout,
            itemLayout.valueNodeId,
            align === "end" ? "right" : "left",
          )}
          className={valueClassName}
        >
          {value}
        </Typography>
      </MetadataListItemLayoutNode>
    </div>
  );
}
