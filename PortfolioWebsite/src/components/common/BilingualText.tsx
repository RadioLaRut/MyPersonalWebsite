"use client";

import type { ReactNode } from "react";

import Typography from "@/components/common/Typography";

type Weight = "light" | "medium" | "black";

interface BilingualTextProps {
  text?: ReactNode | string | null | undefined;
  children?: ReactNode;
  weight?: Weight;
  className?: string;
}

function mapLegacyWeight(weight: Weight) {
  if (weight === "black") {
    return "display";
  }

  if (weight === "medium") {
    return "medium";
  }

  return "light";
}

export default function BilingualText({
  text,
  children,
  weight = "medium",
  className,
}: BilingualTextProps) {
  const content = children ?? text;

  if (content == null) {
    return null;
  }

  return (
    <Typography
      preset="sans-body"
      size="body"
      weight={mapLegacyWeight(weight)}
      wrapPolicy="prose"
      className={className}
      as="span"
    >
      {content}
    </Typography>
  );
}
