import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getDefaultTypographySemanticWeight,
  isTypographyFontLabSizeSupported,
} from "./typography-tokens.ts";
import { isTypographyPreset, isTypographySize } from "./typography.ts";

const TYPOGRAPHY_BLOCK_REGEX = /<Typography\b([\s\S]{0,500}?)>/g;
const PRESET_REGEX = /preset="([^"]+)"/;
const SIZE_REGEX = /size="([^"]+)"/;
const WEIGHT_REGEX = /weight="([^"]+)"/;

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

test("public typography usage stays inside the FontLab coverage matrix", () => {
  const files = collectPublicTsxFiles();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(process.cwd(), file);

    let match: RegExpExecArray | null;
    while ((match = TYPOGRAPHY_BLOCK_REGEX.exec(content))) {
      const block = match[1] ?? "";
      const presetValue = PRESET_REGEX.exec(block)?.[1];
      const sizeValue = SIZE_REGEX.exec(block)?.[1];

      assert.ok(presetValue, `${relativePath} 存在缺少 preset 的 Typography`);
      assert.ok(sizeValue, `${relativePath} 存在缺少 size 的 Typography`);
      assert.ok(isTypographyPreset(presetValue!), `${relativePath} 使用了未知 preset: ${presetValue}`);
      assert.ok(isTypographySize(sizeValue!), `${relativePath} 使用了未知 size: ${sizeValue}`);

      assert.equal(
        isTypographyFontLabSizeSupported(presetValue!, sizeValue!),
        true,
        `${relativePath} 的 Typography 组合 ${presetValue}/${sizeValue} 不在 FontLab 可配置矩阵内`,
      );
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
      const sizeValue = SIZE_REGEX.exec(block)?.[1];
      const weightValue = WEIGHT_REGEX.exec(block)?.[1];

      if (!sizeValue || !isTypographySize(sizeValue) || !weightValue || weightValue === "semantic") {
        continue;
      }

      const expectedSemanticWeight = getDefaultTypographySemanticWeight(sizeValue);
      assert.notEqual(
        weightValue,
        expectedSemanticWeight,
        `${relativePath} 的 Typography 使用了 ${sizeValue}/${weightValue}，它应改为 weight="semantic" 以保持配置文件统一驱动`,
      );
    }
  }
});
