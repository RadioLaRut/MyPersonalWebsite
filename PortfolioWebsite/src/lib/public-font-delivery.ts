import type { PageDocument } from "./page-document-contract.ts";
import { segmentTypographyText } from "./typography.ts";
import {
  isKnownPuckComponentType,
  PUCK_COMPONENT_DESCRIPTOR_BY_TYPE,
} from "../puck/component-manifest.ts";

export type PublicCharacterSetV1 = {
  version: 1;
  characters: string;
  codepoints: number[];
  characterCount: number;
  charsetHash: string;
  sourceHashes: Record<string, string>;
};

export type PublicFontSubsetFaceV1 = {
  id: string;
  family: string;
  source: string;
  sourceHash: string;
  style: "normal";
  weight: string;
  strategy: "static" | "variable";
  url: string;
  outputHash: string;
  bytes: number;
  sourceSupportedCodepoints: number[];
  supportedCodepoints: number[];
  unicodeRange: string;
};

export type PublicFontSubsetManifestV1 = {
  version: 1;
  generatorVersion: number;
  inputHash: string;
  charsetHash: string;
  tool: {
    name: "fonttools";
    version: string;
  };
  faces: PublicFontSubsetFaceV1[];
  blockedFamilies: Array<{
    id: string;
    reason: string;
  }>;
  sourceHanComparison: {
    selected: "variable";
    variableBytes: number;
    staticInstanceBytes: number | null;
    staticVisualParityApproved: false;
    measuredCharsetHash: string;
    sourceHash: string;
  };
  typographyCoverage: Record<string, Record<string, {
    delivery: "subset" | "on-demand-full";
    fontId: string;
    preservedSourceCodepoints: boolean | null;
    status: "verified" | "license-blocked";
  }>>;
};

export type PublicFontHint = {
  as: "font";
  crossOrigin: "anonymous";
  href: string;
  type: "font/woff2";
};

function collectStrings(value: unknown, target: string[]) {
  if (typeof value === "string") {
    target.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, target));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, target));
  }
}

function readPropPath(
  props: Record<string, unknown>,
  propPath: string,
): unknown {
  return propPath.split(".").reduce<unknown>((value, segment) => {
    if (Array.isArray(value)) {
      const index = Number(segment);
      return Number.isInteger(index) ? value[index] : undefined;
    }
    if (value && typeof value === "object") {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, props);
}

export function getFirstViewportFontFaceIds(
  document: PageDocument,
  manifest: PublicFontSubsetManifestV1,
): string[] {
  const firstComponent = document.content[0];
  if (
    !firstComponent ||
    !isKnownPuckComponentType(firstComponent.type)
  ) {
    return [];
  }

  const descriptor = PUCK_COMPONENT_DESCRIPTOR_BY_TYPE[firstComponent.type];
  if (!("firstViewportTypography" in descriptor)) return [];

  const faceIds = new Set<string>();
  for (const usage of descriptor.firstViewportTypography) {
    const strings: string[] = [];
    usage.propPaths.forEach((propPath) => {
      collectStrings(readPropPath(firstComponent.props, propPath), strings);
    });

    const scripts = new Set(
      strings.flatMap((value) =>
        segmentTypographyText(value)
          .filter((run) => run.type === "text")
          .map((run) => run.script),
      ),
    );
    for (const script of scripts) {
      const coverage = manifest.typographyCoverage[usage.preset]?.[script];
      if (coverage?.delivery === "subset") {
        faceIds.add(coverage.fontId);
      }
    }
  }

  return [...faceIds];
}

export function getPublicFontHints(
  document: PageDocument,
  manifest: PublicFontSubsetManifestV1,
): PublicFontHint[] {
  const faceIds = getFirstViewportFontFaceIds(document, manifest);

  return faceIds
    .map((id) => manifest.faces.find((face) => face.id === id))
    .filter((face): face is PublicFontSubsetFaceV1 => Boolean(face))
    .slice(0, 4)
    .map((face) => ({
      as: "font",
      crossOrigin: "anonymous",
      href: face.url,
      type: "font/woff2",
    }));
}
