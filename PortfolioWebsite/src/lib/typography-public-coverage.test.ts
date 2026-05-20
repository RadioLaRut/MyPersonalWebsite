import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  type ComponentDesignComponentKey,
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  type ComponentDesignDocument,
} from "./component-design-schema.ts";
import {
  getDefaultTypographySemanticWeight,
  isTypographyFontLabSizeSupported,
  type TypographySize,
} from "./typography-tokens.ts";
import { isTypographyPreset, isTypographySize } from "./typography.ts";

const TYPOGRAPHY_BLOCK_REGEX = /<Typography\b([\s\S]{0,500}?)>/g;
const PRESET_REGEX = /preset="([^"]+)"/;
const SIZE_REGEX = /size="([^"]+)"/;
const DESIGN_HOOK_REGEX = /const\s+design\s*=\s*useComponentDesign\("([^"]+)"\)/;
const DESIGN_SIZE_REGEX = /size=\{design\.([A-Za-z0-9_]+)\}/;
const LOCAL_SIZE_REGEX = /size=\{([A-Za-z0-9_]+)\}/;
const WEIGHT_REGEX = /weight="([^"]+)"/;
const STRING_LITERAL_REGEX = /"([^"]+)"/g;

function loadComponentDesignDocument(): ComponentDesignDocument {
  const designPath = path.resolve(
    process.cwd(),
    "content/component-design/component-design.json",
  );

  if (!fs.existsSync(designPath)) {
    return createDefaultComponentDesignDocument();
  }

  return normalizeComponentDesignDocument(
    JSON.parse(fs.readFileSync(designPath, "utf8")),
  );
}

const COMPONENT_DESIGN_DOCUMENT = loadComponentDesignDocument();

function collectPublicTsxFiles() {
  const roots = [
    path.resolve(process.cwd(), "src/components"),
    path.resolve(process.cwd(), "src/app"),
  ];
  const result: string[] = [];

  function walk(directory: string) {
    if (!fs.existsSync(directory)) {
      return;
    }

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (
          fullPath.includes(`${path.sep}playground`) ||
          fullPath.includes(`${path.sep}admin`) ||
          fullPath.includes(`${path.sep}api`)
        ) {
          continue;
        }

        walk(fullPath);
        continue;
      }

      if (entry.isFile() && fullPath.endsWith(".tsx")) {
        result.push(fullPath);
      }
    }
  }

  roots.forEach(walk);
  return result;
}

function resolveDesignKey(content: string): ComponentDesignComponentKey | null {
  const designKey = DESIGN_HOOK_REGEX.exec(content)?.[1];

  return designKey && designKey in COMPONENT_DESIGN_DOCUMENT.components
    ? (designKey as ComponentDesignComponentKey)
    : null;
}

function resolveLocalSizeCandidates(
  content: string,
  localName: string,
): TypographySize[] {
  const declarationRegex = new RegExp(
    `const\\s+${localName}\\s*=\\s*([\\s\\S]*?);`,
  );
  const initializer = declarationRegex.exec(content)?.[1] ?? "";
  const candidates = new Set<TypographySize>();

  let match: RegExpExecArray | null;
  while ((match = STRING_LITERAL_REGEX.exec(initializer))) {
    const value = match[1];

    if (isTypographySize(value)) {
      candidates.add(value);
    }
  }

  return [...candidates];
}

function resolveTypographySizes(
  block: string,
  content: string,
): TypographySize[] {
  const literalSize = SIZE_REGEX.exec(block)?.[1];

  if (literalSize && isTypographySize(literalSize)) {
    return [literalSize];
  }

  const designField = DESIGN_SIZE_REGEX.exec(block)?.[1];
  const designKey = designField ? resolveDesignKey(content) : null;

  if (designKey) {
    const value =
      COMPONENT_DESIGN_DOCUMENT.components[designKey][
        designField as keyof (typeof COMPONENT_DESIGN_DOCUMENT.components)[typeof designKey]
      ];

    if (typeof value === "string" && isTypographySize(value)) {
      return [value];
    }
  }

  const localName = LOCAL_SIZE_REGEX.exec(block)?.[1];

  return localName ? resolveLocalSizeCandidates(content, localName) : [];
}

test("public typography usage stays inside the FontLab coverage matrix", () => {
  const files = collectPublicTsxFiles();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(process.cwd(), file);

    let match: RegExpExecArray | null;
    while ((match = TYPOGRAPHY_BLOCK_REGEX.exec(content))) {
      const block = match[1] ?? "";
      const presetValue = PRESET_REGEX.exec(block)?.[1];
      const sizeValues = resolveTypographySizes(block, content);

      assert.ok(presetValue, `${relativePath} 存在缺少 preset 的 Typography`);
      assert.ok(sizeValues.length > 0, `${relativePath} 存在缺少 size 的 Typography`);
      assert.ok(isTypographyPreset(presetValue!), `${relativePath} 使用了未知 preset: ${presetValue}`);

      for (const sizeValue of sizeValues) {
        assert.equal(
          isTypographyFontLabSizeSupported(presetValue!, sizeValue),
          true,
          `${relativePath} 的 Typography 组合 ${presetValue}/${sizeValue} 不在 FontLab 可配置矩阵内`,
        );
      }
    }
  }
});

test("public typography uses semantic weight whenever it matches the default semantic slot", () => {
  const files = collectPublicTsxFiles();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(process.cwd(), file);

    let match: RegExpExecArray | null;
    while ((match = TYPOGRAPHY_BLOCK_REGEX.exec(content))) {
      const block = match[1] ?? "";
      const sizeValues = resolveTypographySizes(block, content);
      const weightValue = WEIGHT_REGEX.exec(block)?.[1];

      if (sizeValues.length === 0 || !weightValue || weightValue === "semantic") {
        continue;
      }

      for (const sizeValue of sizeValues) {
        const expectedSemanticWeight = getDefaultTypographySemanticWeight(sizeValue);

        assert.notEqual(
          weightValue,
          expectedSemanticWeight,
          `${relativePath} 的 Typography 使用了 ${sizeValue}/${weightValue}，它应改为 weight="semantic" 以保持配置文件统一驱动`,
        );
      }
    }
  }
});
