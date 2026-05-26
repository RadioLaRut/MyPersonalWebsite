import { clsx } from "clsx";

export const interactionClassNames = {
  blockLink:
    "interactive outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-white/70",
  button:
    "interactive outline-none transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70",
  inlineLink:
    "interactive outline-none transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70",
  lightButton:
    "outline-none transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-slate-500",
  lightInline:
    "outline-none transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-slate-500",
} as const;

export function composeInteractionClassName(
  className: string,
  preset: keyof typeof interactionClassNames = "inlineLink",
) {
  return clsx(interactionClassNames[preset], className);
}
