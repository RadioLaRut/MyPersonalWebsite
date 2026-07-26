import manifestData from "@/generated/public-font-subsets.json";
import {
  getPublicFontHints,
  type PublicFontSubsetManifestV1,
} from "@/lib/public-font-delivery";
import type { PageDocument } from "@/lib/page-document-contract";

const manifest = manifestData as PublicFontSubsetManifestV1;

export default function PublicFontPreloads({
  document,
}: {
  document: PageDocument;
}) {
  return getPublicFontHints(document, manifest).map((hint) => (
    <link
      key={hint.href}
      rel="preload"
      as={hint.as}
      crossOrigin={hint.crossOrigin}
      href={hint.href}
      type={hint.type}
    />
  ));
}
