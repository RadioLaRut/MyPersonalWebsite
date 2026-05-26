"use client";

import Link, { type LinkProps } from "next/link";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
  forwardRef,
} from "react";

import { composeInteractionClassName } from "@/lib/motion";

type MotionLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, keyof LinkProps | "href"> &
  LinkProps & {
    children: ReactNode;
    disabled?: boolean;
    disabledElement?: ElementType;
    interactionPreset?: Parameters<typeof composeInteractionClassName>[1];
  };

export const MotionLink = forwardRef<HTMLElement, MotionLinkProps>(function MotionLink(
  {
    children,
    className = "",
    disabled = false,
    disabledElement: DisabledElement = "span",
    href,
    interactionPreset = "inlineLink",
    locale,
    onClick,
    prefetch = true,
    replace,
    scroll,
    shallow,
    ...props
  },
  ref,
) {
  const resolvedClassName = disabled
    ? className
    : composeInteractionClassName(className, interactionPreset);

  if (disabled) {
    return (
      <DisabledElement
        {...props}
        ref={ref}
        aria-disabled="true"
        className={resolvedClassName}
      >
        {children}
      </DisabledElement>
    );
  }

  return (
    <Link
      {...props}
      ref={ref as Ref<HTMLAnchorElement>}
      href={href}
      locale={locale}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      className={resolvedClassName}
      onClick={onClick}
    >
      {children}
    </Link>
  );
});
