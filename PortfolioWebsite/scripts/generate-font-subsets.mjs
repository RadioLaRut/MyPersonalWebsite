import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  compactUnicodeRanges,
  createFontSubsetInputState,
  createPublicFontCss,
  FONT_SUBSET_GENERATOR_VERSION,
  FONT_TOOLS_VERSION,
  sha256,
  SUBSET_FONT_SOURCES,
  verifyGeneratedFontArtifacts,
} from "./font-subset-lib.mjs";

const projectRoot = process.cwd();
const checkOnly = process.argv.includes("--check");
const force = process.argv.includes("--force");
const generatedRoot = path.join(projectRoot, "src/generated");
const generatedCssRoot = path.join(projectRoot, "src/app/fonts/generated");
const outputRoot = path.join(projectRoot, "public/fonts/generated");
const cacheRoot = path.join(projectRoot, ".cache/font-subsets");
const environmentRoot = path.join(projectRoot, ".cache/font-tools");
const pythonPath = process.platform === "win32"
  ? path.join(environmentRoot, "Scripts/python.exe")
  : path.join(environmentRoot, "bin/python");
const toolPath = path.join(projectRoot, "scripts/font-subset-tool.py");
const characterSetPath = path.join(generatedRoot, "public-character-set.json");
const manifestPath = path.join(generatedRoot, "public-font-subsets.json");
const cssPath = path.join(generatedCssRoot, "public-fonts.css");

const TYPOGRAPHY_FONT_STACKS = {
  "sans-body": {
    cjk: "hanyi-qihei",
    latin: "futura",
  },
  "luna-editorial": {
    cjk: "source-han-serif-sc",
    latin: "luna-itc",
  },
  "gothic-editorial": {
    cjk: "source-han-serif-sc",
    latin: "itc-serif-gothic",
  },
  "classical-display": {
    cjk: "source-han-serif-sc",
    latin: "dm-serif-display",
  },
};

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0) {
    const message = result.stderr?.trim() || result.stdout?.trim() || "未知错误";
    throw new Error(`${path.basename(command)} 执行失败：${message}`);
  }
  return result.stdout?.trim() ?? "";
}

function ensureFontTools() {
  const versionCheck = fs.existsSync(pythonPath)
    ? spawnSync(
      pythonPath,
      ["-c", "import fontTools; print(fontTools.__version__)"],
      { cwd: projectRoot, encoding: "utf8" },
    )
    : null;
  if (
    versionCheck?.status === 0 &&
    versionCheck.stdout.trim() === FONT_TOOLS_VERSION
  ) {
    return;
  }

  if (process.env.CI || process.env.VERCEL) {
    throw new Error(
      "字体产物已过期且 CI 不允许联网安装 FontTools；请先在本地运行 npm run fonts:sync 并提交生成文件。",
    );
  }

  run(process.execPath, [path.join(projectRoot, "scripts/setup-font-tools.mjs")], {
    stdio: "inherit",
  });
}

function generateFace(source, inputState, outputPath, instanceWeight) {
  const output = run(pythonPath, [
    toolPath,
    "--source",
    path.join(projectRoot, source.source),
    "--output",
    outputPath,
    "--charset",
    characterSetPath,
    ...(instanceWeight === undefined
      ? []
      : ["--instance-weight", String(instanceWeight)]),
  ]);
  return JSON.parse(output);
}

function writeIfChanged(filePath, content) {
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (current === content) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const inputState = createFontSubsetInputState(projectRoot);
const verification = verifyGeneratedFontArtifacts(projectRoot, inputState);

if (checkOnly) {
  if (!verification.fresh) {
    console.error(`公开字体子集已过期：${verification.reason}`);
    console.error("请运行 npm run fonts:sync 更新生成文件。");
    process.exitCode = 1;
  }
} else if (!verification.fresh || force) {
  ensureFontTools();
  fs.mkdirSync(cacheRoot, { recursive: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.mkdirSync(generatedRoot, { recursive: true });
  writeIfChanged(characterSetPath, stableJson(inputState.characterSet));

  const faces = [];
  const previousManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : null;
  let sourceHanComparison = {
    selected: "variable",
    variableBytes: 0,
    staticInstanceBytes: null,
    staticVisualParityApproved: false,
  };

  for (const source of SUBSET_FONT_SOURCES) {
    const temporaryOutput = path.join(cacheRoot, `${source.id}.woff2`);
    const result = generateFace(source, inputState, temporaryOutput);
    const output = fs.readFileSync(temporaryOutput);
    const outputHash = sha256(output);
    const fileName = `${source.id}.${outputHash.slice(0, 12)}.woff2`;
    const finalPath = path.join(outputRoot, fileName);
    fs.copyFileSync(temporaryOutput, finalPath);

    if (source.variable) {
      const previousSource = previousManifest?.faces?.find(
        (face) => face.id === source.id,
      );
      const canReuseComparison =
        previousSource?.sourceHash === inputState.sourceHashes[source.id] &&
        Number.isInteger(
          previousManifest?.sourceHanComparison?.staticInstanceBytes,
        );
      let staticInstanceBytes =
        previousManifest?.sourceHanComparison?.staticInstanceBytes ?? 0;
      let measuredCharsetHash =
        previousManifest?.sourceHanComparison?.measuredCharsetHash ??
        previousManifest?.charsetHash ??
        inputState.characterSet.charsetHash;
      if (!canReuseComparison) {
        const staticWeights = [300, 400, 500, 700, 900];
        staticInstanceBytes = 0;
        measuredCharsetHash = inputState.characterSet.charsetHash;
        for (const weight of staticWeights) {
          const candidatePath = path.join(cacheRoot, `${source.id}-${weight}.woff2`);
          generateFace(source, inputState, candidatePath, weight);
          staticInstanceBytes += fs.statSync(candidatePath).size;
        }
      }
      sourceHanComparison = {
        selected: "variable",
        variableBytes: output.length,
        staticInstanceBytes,
        staticVisualParityApproved: false,
        measuredCharsetHash,
        sourceHash: inputState.sourceHashes[source.id],
      };
    }

    faces.push({
      id: source.id,
      family: source.family,
      familyId: source.familyId,
      source: source.source,
      sourceHash: inputState.sourceHashes[source.id],
      style: source.style,
      weight: source.weight,
      strategy: source.strategy,
      url: `/fonts/generated/${fileName}`,
      outputHash,
      bytes: output.length,
      sourceSupportedCodepoints: result.sourceSupportedCodepoints,
      supportedCodepoints: result.supportedCodepoints,
      unicodeRange: compactUnicodeRanges(result.supportedCodepoints),
    });
  }

  const expectedFileNames = new Set(faces.map((face) => path.basename(face.url)));
  for (const entry of fs.readdirSync(outputRoot, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      entry.name.endsWith(".woff2") &&
      !expectedFileNames.has(entry.name)
    ) {
      fs.unlinkSync(path.join(outputRoot, entry.name));
    }
  }

  const blockedFamilies = Object.entries(inputState.inventory.families)
    .filter(([, value]) => value.delivery !== "subset")
    .map(([id, value]) => ({
      id,
      reason: value.note,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const facesByFamilyId = new Map();
  for (const face of faces) {
    const familyFaces = facesByFamilyId.get(face.familyId) ?? [];
    familyFaces.push(face);
    facesByFamilyId.set(face.familyId, familyFaces);
  }
  const typographyCoverage = Object.fromEntries(
    Object.entries(TYPOGRAPHY_FONT_STACKS).map(([preset, scripts]) => [
      preset,
      Object.fromEntries(
        Object.entries(scripts).map(([script, fontId]) => {
          const familyFaces = facesByFamilyId.get(fontId) ?? [];
          return [
            script,
            familyFaces.length > 0
              ? {
                  delivery: "subset",
                  faceIds: familyFaces.map((face) => face.id),
                  fontId,
                  preservedSourceCodepoints:
                    familyFaces.every((face) => {
                      const supported = new Set(face.supportedCodepoints);
                      return face.sourceSupportedCodepoints.every((codepoint) =>
                        supported.has(codepoint));
                    }),
                  status: "verified",
                }
              : {
                  delivery: "on-demand-full",
                  faceIds: [],
                  fontId,
                  preservedSourceCodepoints: null,
                  status: "license-blocked",
                },
          ];
        }),
      ),
    ]),
  );
  const manifest = {
    version: 1,
    generatorVersion: FONT_SUBSET_GENERATOR_VERSION,
    inputHash: inputState.inputHash,
    charsetHash: inputState.characterSet.charsetHash,
    tool: {
      name: "fonttools",
      version: FONT_TOOLS_VERSION,
    },
    faces,
    blockedFamilies,
    sourceHanComparison,
    typographyCoverage,
  };

  writeIfChanged(manifestPath, stableJson(manifest));
  writeIfChanged(cssPath, createPublicFontCss(manifest));
  console.log(
    `已生成 ${faces.length} 个公开字体子集，共 ${faces.reduce((sum, face) => sum + face.bytes, 0)} 字节，字符 ${inputState.characterSet.characterCount} 个。`,
  );
}
