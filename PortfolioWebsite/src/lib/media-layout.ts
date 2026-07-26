import type { PageDocument } from "./page-document-contract.ts";

export type MediaLayoutProfileKey =
  | "full-bleed"
  | "grid-12"
  | "grid-10"
  | "grid-8"
  | "grid-6"
  | "grid-5"
  | "grid-4"
  | "thumbnail";

export type MediaLayoutProfile = {
  key: MediaLayoutProfileKey;
  sizes: string;
  fullBleed: boolean;
};

export type PublicMediaHint = {
  height: number;
  preload: boolean;
  profile: MediaLayoutProfileKey;
  sizes: string;
  src: string;
  width: number;
};

export type PublicMediaSelection = {
  componentId: string;
  src: string;
};

export type PublicMediaEligibility = (
  component: PageDocument["content"][number],
) => boolean;

export const MEDIA_LAYOUT_PROFILES: Record<
  MediaLayoutProfileKey,
  MediaLayoutProfile
> = {
  "full-bleed": {
    key: "full-bleed",
    sizes: "100vw",
    fullBleed: true,
  },
  "grid-12": {
    key: "grid-12",
    sizes: "(min-width: 768px) calc(100vw - 4rem), calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  "grid-10": {
    key: "grid-10",
    sizes: "(min-width: 1024px) 83vw, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  "grid-8": {
    key: "grid-8",
    sizes: "(min-width: 1024px) 66vw, (min-width: 768px) 75vw, calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  "grid-6": {
    key: "grid-6",
    sizes: "(min-width: 1024px) 50vw, (min-width: 768px) 66vw, calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  "grid-5": {
    key: "grid-5",
    sizes: "(min-width: 1024px) 42vw, (min-width: 768px) 58vw, calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  "grid-4": {
    key: "grid-4",
    sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 2.5rem)",
    fullBleed: false,
  },
  thumbnail: {
    key: "thumbnail",
    sizes: "(min-width: 768px) 180px, 45vw",
    fullBleed: false,
  },
};

export function getMediaLayoutProfile(
  key: MediaLayoutProfileKey = "grid-12",
): MediaLayoutProfile {
  return MEDIA_LAYOUT_PROFILES[key];
}

const PUBLIC_IMAGE_PATTERN =
  /^\/(?:images|assets\/images)\/.+\.(?:avif|gif|jpe?g|png|webp)$/iu;

export function findFirstPublicImagePath(value: unknown): string | null {
  if (typeof value === "string") {
    return PUBLIC_IMAGE_PATTERN.test(value) ? value : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findFirstPublicImagePath(item);
      if (result) return result;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const result = findFirstPublicImagePath(item);
      if (result) return result;
    }
  }
  return null;
}

export function findFirstPublicMediaComponentId(
  document: PageDocument,
): string | null {
  return findFirstPublicMedia(document)?.componentId ?? null;
}

function findComponentPublicImage(
  type: unknown,
  props: Record<string, unknown>,
): string | null {
  if (type === "ThreeColumnSection" && props.variant !== "triptych") {
    return findFirstPublicImagePath(props.col3MediaSrc);
  }
  if (type === "ImageSlider") {
    return (
      findFirstPublicImagePath(props.unlitSrc) ??
      findFirstPublicImagePath(props.litSrc)
    );
  }
  return findFirstPublicImagePath(props);
}

function selectComponentPublicMedia(
  component: PageDocument["content"][number] | undefined,
): PublicMediaSelection | null {
  if (!component || typeof component.props.id !== "string") return null;

  const src = findComponentPublicImage(component.type, component.props);
  return src ? { componentId: component.props.id, src } : null;
}

export function findFirstPublicMedia(
  document: PageDocument,
): PublicMediaSelection | null {
  for (const component of document.content) {
    const selection = selectComponentPublicMedia(component);
    if (selection) return selection;
  }
  return null;
}

export function findPublicMediaPreloadCandidate(
  document: PageDocument,
  isEligible: PublicMediaEligibility,
): PublicMediaSelection | null {
  const firstComponent = document.content[0];
  if (!firstComponent || !isEligible(firstComponent)) return null;
  return selectComponentPublicMedia(firstComponent);
}
