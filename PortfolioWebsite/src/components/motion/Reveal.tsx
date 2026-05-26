"use client";

import { type ReactNode } from "react";

import {
  motion,
  revealLeftVariants,
  revealRightVariants,
  revealUpVariants,
  type HTMLMotionProps,
} from "@/lib/motion";

type RevealDirection = "left" | "right" | "up";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  direction?: RevealDirection;
  disabled?: boolean;
};

const variantsByDirection = {
  left: revealLeftVariants,
  right: revealRightVariants,
  up: revealUpVariants,
} as const;

export function Reveal({
  children,
  direction = "up",
  disabled = false,
  initial,
  transition,
  variants,
  whileInView,
  viewport,
  ...props
}: RevealProps) {
  return (
    <motion.div
      {...props}
      initial={disabled ? false : initial ?? "hidden"}
      whileInView={disabled ? undefined : whileInView ?? "visible"}
      viewport={disabled ? undefined : viewport ?? { once: true, margin: "-100px" }}
      variants={disabled ? undefined : variants ?? variantsByDirection[direction]}
      transition={disabled ? undefined : transition}
    >
      {children}
    </motion.div>
  );
}
