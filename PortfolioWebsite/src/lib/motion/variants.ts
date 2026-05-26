import type { Variants } from "framer-motion";

import { motionTransitions } from "./tokens.ts";

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: motionTransitions.fade },
} satisfies Variants;

export const revealUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const revealRightVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const revealLeftVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const menuItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
} satisfies Variants;

export const imageSettleVariants = {
  hidden: { scale: 1.025 },
  visible: { scale: 1, transition: motionTransitions.ambient },
} satisfies Variants;
