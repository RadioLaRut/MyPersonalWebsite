"use client";

import { useEffect } from "react";

import { coordinateImageLoading } from "@/lib/image-load-coordinator";

export default function ImageLoadCoordinator() {
  useEffect(() => coordinateImageLoading(document), []);

  return null;
}
