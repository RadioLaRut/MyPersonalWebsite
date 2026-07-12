import { clsx } from "clsx";

// Tailwind 动效类必须保留为静态字符串，集中在这里避免业务组件重复声明时长与缓动。
export const motionClassNames = {
  fastAll: "transition-all duration-300",
  fastColors: "transition-colors duration-300",
  navigationLabel:
    "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  projectBackdrop: "transition-colors duration-1000",
  projectUnderline:
    "transition-[width,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
} as const;

export const interactionClassNames = {
  blockLink:
    "interactive outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-white/70",
  button:
    `interactive outline-none ${motionClassNames.fastColors} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70`,
  inlineLink:
    `interactive outline-none ${motionClassNames.fastColors} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/70`,
  lightButton:
    `outline-none ${motionClassNames.fastColors} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-slate-500`,
  lightInline:
    `outline-none ${motionClassNames.fastColors} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-slate-500`,
} as const;

export function composeInteractionClassName(
  className: string,
  preset: keyof typeof interactionClassNames = "inlineLink",
) {
  return clsx(interactionClassNames[preset], className);
}
