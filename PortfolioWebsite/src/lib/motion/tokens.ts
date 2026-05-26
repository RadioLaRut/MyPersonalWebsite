export const motionDurations = {
  ambient: 5,
  deliberate: 1.1,
  fast: 0.3,
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

export const motionTransitions = {
  ambient: { duration: motionDurations.ambient, ease: "easeOut" },
  fade: { duration: motionDurations.slow, ease: motionEasings.soft },
  hover: { duration: 0.4, ease: motionEasings.standard },
  reveal: { duration: motionDurations.reveal, ease: motionEasings.standard },
  standard: { duration: motionDurations.standard, ease: motionEasings.standard },
} as const;

export const reducedMotionTransition = {
  duration: 0,
} as const;
