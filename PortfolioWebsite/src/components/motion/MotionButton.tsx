"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

import { composeInteractionClassName } from "@/lib/motion";

type MotionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  interactionPreset?: Parameters<typeof composeInteractionClassName>[1];
};

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  function MotionButton(
    { className = "", interactionPreset = "button", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={composeInteractionClassName(className, interactionPreset)}
      />
    );
  },
);
