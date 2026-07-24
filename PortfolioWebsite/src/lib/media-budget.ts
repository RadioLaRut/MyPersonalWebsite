export type MediaBudget = {
  maxDimension: number;
  maxFrames: number;
  maxPixels: number;
  version: 1;
};

export const MEDIA_BUDGET_V1: MediaBudget = Object.freeze({
  maxDimension: 8_192,
  maxFrames: 1,
  maxPixels: 40_000_000,
  version: 1,
});

export const SHARP_MEDIA_INPUT_OPTIONS = Object.freeze({
  failOn: "error" as const,
  limitInputPixels: MEDIA_BUDGET_V1.maxPixels,
});

export type MediaMetadataLike = {
  frames?: number;
  height?: number;
  pages?: number;
  width?: number;
};

export class MediaBudgetError extends Error {
  readonly code = "MEDIA_BUDGET_EXCEEDED";

  constructor(message: string) {
    super(message);
    this.name = "MediaBudgetError";
  }
}

export function validateMediaMetadata(
  metadata: MediaMetadataLike,
  budget: MediaBudget = MEDIA_BUDGET_V1,
) {
  const { height, width } = metadata;
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    !width ||
    !height ||
    width < 1 ||
    height < 1
  ) {
    throw new MediaBudgetError("Image dimensions are missing or invalid");
  }
  if (width > budget.maxDimension || height > budget.maxDimension) {
    throw new MediaBudgetError(
      `Image dimensions exceed ${budget.maxDimension} pixels`,
    );
  }

  const pixels = width * height;
  if (!Number.isSafeInteger(pixels) || pixels > budget.maxPixels) {
    throw new MediaBudgetError(`Image pixels exceed ${budget.maxPixels}`);
  }

  const pages = metadata.pages ?? 1;
  const frames = metadata.frames ?? 1;
  if (
    !Number.isSafeInteger(pages) ||
    !Number.isSafeInteger(frames) ||
    pages < 1 ||
    frames < 1 ||
    pages > budget.maxFrames ||
    frames > budget.maxFrames
  ) {
    throw new MediaBudgetError("Animated or multi-page images are not supported");
  }

  return { frames: Math.max(pages, frames), height, pixels, width };
}

export async function readAndValidateMediaMetadata(
  readMetadata: () => Promise<MediaMetadataLike>,
  budget: MediaBudget = MEDIA_BUDGET_V1,
) {
  try {
    return validateMediaMetadata(await readMetadata(), budget);
  } catch (error) {
    if (error instanceof MediaBudgetError) throw error;
    throw new MediaBudgetError("Image data is invalid or unsupported");
  }
}
