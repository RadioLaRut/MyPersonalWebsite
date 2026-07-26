import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { collectPublicCopyStrings } from "../src/lib/public-copy.ts";

export const FONT_TOOLS_VERSION = "4.63.0";
export const FONT_SUBSET_GENERATOR_VERSION = 2;

export const SUBSET_FONT_SOURCES = Object.freeze([
  {
    family: "Source Han Serif SC Public Subset",
    id: "source-han-serif-sc",
    licenseFamily: "source-han-serif-sc",
    source: "src/app/fonts/SourceHanSerifSC-VF.otf",
    style: "normal",
    strategy: "variable",
    variable: true,
    weight: "200 900",
  },
  {
    family: "DM Serif Display Public Subset",
    id: "dm-serif-display",
    licenseFamily: "dm-serif-display",
    source: "src/app/fonts/DMSerifDisplay-Regular.ttf",
    style: "normal",
    strategy: "static",
    variable: false,
    weight: "400",
  },
]);

const REQUIRED_FIXED_CODEPOINT_RANGES = Object.freeze([
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x2000, 0x206f],
]);

const EXCLUDED_CODEPOINT_PATTERN =
  /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function walkFiles(root, predicate) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const pending = [root];

  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function collectStringValues(value, target) {
  if (typeof value === "string") {
    target.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, target));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStringValues(item, target));
  }
}

function addTextCodepoints(text, codepoints) {
  for (const character of text.normalize("NFC")) {
    if (
      character === "\n" ||
      character === "\r" ||
      character === "\t" ||
      EXCLUDED_CODEPOINT_PATTERN.test(character)
    ) {
      continue;
    }
    codepoints.add(character.codePointAt(0));
  }
}

export function compactUnicodeRanges(codepoints) {
  const sorted = [...new Set(codepoints)].sort((left, right) => left - right);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (const codepoint of sorted.slice(1)) {
    if (codepoint === end + 1) {
      end = codepoint;
      continue;
    }
    ranges.push([start, end]);
    start = codepoint;
    end = codepoint;
  }
  if (start !== undefined) ranges.push([start, end]);

  return ranges
    .map(([rangeStart, rangeEnd]) => (
      rangeStart === rangeEnd
        ? `U+${rangeStart.toString(16).toUpperCase()}`
        : `U+${rangeStart.toString(16).toUpperCase()}-${rangeEnd.toString(16).toUpperCase()}`
    ))
    .join(", ");
}

export function buildPublicCharacterSet(projectRoot) {
  const jsonRoots = [
    path.join(projectRoot, "content/pages"),
    path.join(projectRoot, "content/component-design"),
    path.join(projectRoot, "content/font-lab"),
  ];
  const sourceFiles = jsonRoots.flatMap((root) => (
    fs.statSync(root, { throwIfNoEntry: false })?.isDirectory()
      ? walkFiles(root, (filePath) => filePath.endsWith(".json"))
      : fs.existsSync(root) ? [root] : []
  )).sort((left, right) => left.localeCompare(right));
  const sourceHashes = {};
  const strings = collectPublicCopyStrings();

  for (const filePath of sourceFiles) {
    const raw = fs.readFileSync(filePath);
    const relativePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
    sourceHashes[relativePath] = sha256(raw);
    collectStringValues(JSON.parse(raw.toString("utf8")), strings);
  }

  const codepoints = new Set();
  for (const [start, end] of REQUIRED_FIXED_CODEPOINT_RANGES) {
    for (let codepoint = start; codepoint <= end; codepoint += 1) {
      codepoints.add(codepoint);
    }
  }
  strings.forEach((value) => addTextCodepoints(value, codepoints));

  const orderedCodepoints = [...codepoints].sort((left, right) => left - right);
  const characters = orderedCodepoints.map((codepoint) => String.fromCodePoint(codepoint)).join("");
  const charsetHash = sha256(Buffer.from(characters, "utf8"));

  return {
    version: 1,
    characters,
    codepoints: orderedCodepoints,
    characterCount: orderedCodepoints.length,
    charsetHash,
    sourceHashes,
  };
}

export function readAndValidateLicenseInventory(projectRoot) {
  const filePath = path.join(projectRoot, "content/fonts/font-licenses.json");
  const raw = fs.readFileSync(filePath);
  const inventory = JSON.parse(raw.toString("utf8"));
  if (
    inventory?.version !== 1 ||
    !inventory.families ||
    typeof inventory.families !== "object"
  ) {
    throw new Error("字体许可证清单格式无效");
  }

  for (const source of SUBSET_FONT_SOURCES) {
    const license = inventory.families[source.licenseFamily];
    if (
      license?.status !== "verified" ||
      license?.delivery !== "subset" ||
      license?.license !== "OFL-1.1"
    ) {
      throw new Error(`${source.id} 没有经过验证的子集授权`);
    }
  }

  return {
    inventory,
    inventoryHash: sha256(raw),
  };
}

export function createFontSubsetInputState(projectRoot) {
  const characterSet = buildPublicCharacterSet(projectRoot);
  const { inventory, inventoryHash } = readAndValidateLicenseInventory(projectRoot);
  const sourceHashes = Object.fromEntries(
    SUBSET_FONT_SOURCES.map((source) => {
      const absolutePath = path.join(projectRoot, source.source);
      return [source.id, sha256(fs.readFileSync(absolutePath))];
    }),
  );
  const inputHash = sha256(JSON.stringify({
    characterSetHash: characterSet.charsetHash,
    inventoryHash,
    sourceHashes,
    sources: SUBSET_FONT_SOURCES,
    toolVersion: FONT_TOOLS_VERSION,
    generatorVersion: FONT_SUBSET_GENERATOR_VERSION,
  }));

  return {
    characterSet,
    inputHash,
    inventory,
    sourceHashes,
  };
}

export function createPublicFontCss(manifest) {
  const faces = manifest.faces.flatMap((face) => [
    "@font-face {",
    `  font-family: "${face.family}";`,
    `  src: url("${face.url}") format("woff2");`,
    `  font-style: ${face.style};`,
    `  font-weight: ${face.weight};`,
    "  font-display: swap;",
    "}",
    "",
  ]);

  return [
    "/* 此文件由 scripts/generate-font-subsets.mjs 自动生成，请勿手动修改。 */",
    ...faces,
    ".public-font-scope {",
    '  --font-noto-serif: "Source Han Serif SC Public Subset";',
    '  --font-dm-serif: "DM Serif Display Public Subset";',
    "}",
    "",
  ].join("\n");
}

export function verifyGeneratedFontArtifacts(projectRoot, inputState) {
  const manifestPath = path.join(
    projectRoot,
    "src/generated/public-font-subsets.json",
  );
  const characterSetPath = path.join(
    projectRoot,
    "src/generated/public-character-set.json",
  );
  const cssPath = path.join(
    projectRoot,
    "src/app/fonts/generated/public-fonts.css",
  );
  if (
    !fs.existsSync(manifestPath) ||
    !fs.existsSync(characterSetPath) ||
    !fs.existsSync(cssPath)
  ) {
    return { fresh: false, reason: "缺少字体生成产物" };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const characterSet = JSON.parse(fs.readFileSync(characterSetPath, "utf8"));
  if (
    manifest.version !== 1 ||
    manifest.inputHash !== inputState.inputHash ||
    manifest.charsetHash !== inputState.characterSet.charsetHash
  ) {
    return { fresh: false, reason: "字体 manifest 输入哈希已过期" };
  }
  if (
    characterSet.charsetHash !== inputState.characterSet.charsetHash ||
    characterSet.characters !== inputState.characterSet.characters
  ) {
    return { fresh: false, reason: "公开字符集已过期" };
  }

  for (const face of manifest.faces ?? []) {
    const outputPath = path.join(projectRoot, "public", face.url.replace(/^\//u, ""));
    if (!fs.existsSync(outputPath)) {
      return { fresh: false, reason: `缺少字体文件 ${face.url}` };
    }
    const output = fs.readFileSync(outputPath);
    if (output.length !== face.bytes || sha256(output) !== face.outputHash) {
      return { fresh: false, reason: `字体文件哈希不匹配 ${face.url}` };
    }
  }

  if (fs.readFileSync(cssPath, "utf8") !== createPublicFontCss(manifest)) {
    return { fresh: false, reason: "公开字体 CSS 已过期" };
  }

  return { fresh: true, manifest };
}
