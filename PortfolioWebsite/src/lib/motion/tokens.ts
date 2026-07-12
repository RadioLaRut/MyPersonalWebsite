export const motionDurations = {
  ambient: 5,
  deliberate: 1.1,
  fast: 0.3,
  heroSupporting: 0.95,
  interactive: 0.4,
  navigationFooter: 0.45,
  reveal: 0.82,
  slow: 0.65,
  standard: 0.52,
} as const;

export const motionEasings = {
  emphasized: [0.16, 1, 0.3, 1],
  soft: [0.25, 1, 0.5, 1],
  standard: [0.22, 1, 0.36, 1],
} as const;

export const motionStagger = {
  itemDelay: 0.12,
  itemInitialDelay: 0.16,
} as const;

export const motionDelays = {
  heroLead: 0.2,
  heroSupporting: 0.38,
  navigationFooter: 0.66,
} as const;

export const motionOffsets = {
  heroLeadY: 28,
  heroSupportingX: 24,
  navigationHoverX: 8,
  navigationPanelX: "100%",
  reveal: 24,
  staggeredMenuItemX: 20,
} as const;

export const motionScales = {
  imageSettle: 1.025,
  navigationIndicatorHover: 1.5,
} as const;

export const motionSprings = {
  navigationIndicator: {
    damping: 30,
    stiffness: 300,
    type: "spring",
  },
} as const;

type MediaScrollTokens = {
  input: number[];
  scale: number[];
  y: string[];
};

type OpacityScrollTokens = {
  input: number[];
  opacity: number[];
};

export const motionScrollTokens = {
  heroMedia: {
    input: [0, 1],
    scale: [1, 1.08],
    y: ["0%", "12%"],
  },
  projectContent: {
    input: [0, 0.32, 0.72, 1],
    opacity: [0.34, 1, 1, 0.34],
  },
  projectMedia: {
    input: [0, 1],
    scale: [1.01, 1.04],
    y: ["-8%", "8%"],
  },
} satisfies {
  heroMedia: MediaScrollTokens;
  projectContent: OpacityScrollTokens;
  projectMedia: MediaScrollTokens;
};

export const motionTransitions = {
  ambient: { duration: motionDurations.ambient, ease: "easeOut" },
  fade: { duration: motionDurations.slow, ease: motionEasings.soft },
  heroLead: {
    delay: motionDelays.heroLead,
    duration: motionDurations.deliberate,
    ease: motionEasings.standard,
  },
  heroSupporting: {
    delay: motionDelays.heroSupporting,
    duration: motionDurations.heroSupporting,
    ease: motionEasings.standard,
  },
  hover: {
    duration: motionDurations.interactive,
    ease: motionEasings.standard,
  },
  navigationFooter: {
    delay: motionDelays.navigationFooter,
    duration: motionDurations.navigationFooter,
    ease: "easeOut",
  },
  navigationHeader: {
    duration: motionDurations.interactive,
    ease: "easeOut",
  },
  navigationItem: {
    duration: motionDurations.standard,
    ease: "easeOut",
  },
  navigationOverlay: {
    duration: motionDurations.slow,
    ease: motionEasings.standard,
  },
  navigationPanel: {
    duration: motionDurations.reveal,
    ease: motionEasings.standard,
  },
  reveal: { duration: motionDurations.reveal, ease: motionEasings.standard },
  standard: { duration: motionDurations.standard, ease: motionEasings.standard },
} as const;

export const reducedMotionTransition = {
  duration: 0,
} as const;
