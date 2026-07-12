import type { Variants } from "framer-motion";

import {
  motionOffsets,
  motionScales,
  motionStagger,
  motionTransitions,
} from "./tokens.ts";

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: motionTransitions.fade },
} satisfies Variants;

export const revealUpVariants = {
  hidden: { opacity: 0, y: motionOffsets.reveal },
  visible: { opacity: 1, y: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const revealRightVariants = {
  hidden: { opacity: 0, x: motionOffsets.reveal },
  visible: { opacity: 1, x: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const revealLeftVariants = {
  hidden: { opacity: 0, x: -motionOffsets.reveal },
  visible: { opacity: 1, x: 0, transition: motionTransitions.reveal },
} satisfies Variants;

export const menuItemVariants = {
  hidden: { opacity: 0, x: motionOffsets.staggeredMenuItemX },
  visible: (index = 0) => ({
    opacity: 1,
    transition: {
      ...motionTransitions.navigationItem,
      delay: motionStagger.itemInitialDelay + index * motionStagger.itemDelay,
    },
    x: 0,
  }),
  exit: {
    opacity: 0,
    transition: motionTransitions.navigationItem,
    x: motionOffsets.staggeredMenuItemX,
  },
} satisfies Variants;

export const imageSettleVariants = {
  hidden: { scale: motionScales.imageSettle },
  visible: { scale: 1, transition: motionTransitions.ambient },
} satisfies Variants;

export const heroLeadVariants = {
  hidden: { opacity: 0, y: motionOffsets.heroLeadY },
  visible: {
    opacity: 1,
    transition: motionTransitions.heroLead,
    y: 0,
  },
} satisfies Variants;

export const heroSupportingVariants = {
  hidden: { opacity: 0, x: motionOffsets.heroSupportingX },
  visible: {
    opacity: 1,
    transition: motionTransitions.heroSupporting,
    x: 0,
  },
} satisfies Variants;

export const navigationHeaderVariants = {
  hidden: { opacity: 0, transition: motionTransitions.navigationHeader },
  visible: { opacity: 1, transition: motionTransitions.navigationHeader },
} satisfies Variants;

export const navigationOverlayVariants = {
  hidden: { opacity: 0, transition: motionTransitions.navigationOverlay },
  visible: { opacity: 1, transition: motionTransitions.navigationOverlay },
} satisfies Variants;

export const navigationPanelVariants = {
  closed: {
    opacity: 1,
    transition: motionTransitions.navigationPanel,
    x: motionOffsets.navigationPanelX,
  },
  open: {
    opacity: 1,
    transition: motionTransitions.navigationPanel,
    x: 0,
  },
} satisfies Variants;

export const navigationIndicatorVariants = {
  initial: { opacity: 0.8, scaleY: 1, x: 0 },
  hover: {
    opacity: 1,
    scaleY: motionScales.navigationIndicatorHover,
    transition: motionTransitions.hover,
    x: motionOffsets.navigationHoverX,
  },
} satisfies Variants;

export const navigationLabelVariants = {
  initial: { x: 0 },
  hover: {
    transition: motionTransitions.hover,
    x: motionOffsets.navigationHoverX,
  },
} satisfies Variants;

export const navigationFooterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: motionTransitions.navigationFooter },
} satisfies Variants;
