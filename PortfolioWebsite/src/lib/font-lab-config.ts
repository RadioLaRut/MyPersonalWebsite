import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  createDefaultFontLabDocument,
  normalizeFontLabDocument,
  parseFontLabDocument,
  type FontLabDocument,
  type FontLabPresetConfig,
  type FontLabSavePayload,
} from "./font-lab-config-schema.ts";
import { resolveTypographyFontLabSize } from "./typography-tokens.ts";

export const FONT_LAB_CONFIG_ROOT = path.resolve(process.cwd(), "content/font-lab");
export const FONT_LAB_CONFIG_FILE = path.join(FONT_LAB_CONFIG_ROOT, "font-presets.json");

async function writeJsonAtomically(filePath: string, json: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const baseName = path.basename(filePath, ".json");
  const tempFilePath = path.join(
    path.dirname(filePath),
    `${baseName}.${Date.now()}.${randomUUID()}.tmp.json`,
  );

  try {
    await fs.writeFile(tempFilePath, json, "utf8");
    await fs.rename(tempFilePath, filePath);
  } finally {
    await fs.unlink(tempFilePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }
}

export async function hasFontLabConfig(
  filePath = FONT_LAB_CONFIG_FILE,
): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFontLabConfig(
  filePath = FONT_LAB_CONFIG_FILE,
): Promise<FontLabDocument> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseFontLabDocument(JSON.parse(raw));

    if (!parsed) {
      throw new TypeError("Invalid Font Lab config file");
    }

    return normalizeFontLabDocument(parsed);
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return createDefaultFontLabDocument();
    }

    throw error;
  }
}

export function mergeFontLabPresetConfig(
  document: FontLabDocument,
  payload: FontLabSavePayload,
): FontLabDocument {
  const activeSize = resolveTypographyFontLabSize(
    payload.activePreset,
    payload.activeSize,
  );
  const previousPreset = document.presets[payload.activePreset];
  const nextPreset: FontLabPresetConfig = {
    labelZh: payload.labelZh,
    latinFontScale: payload.latinFontScale,
    latinWeightOffsetSteps: payload.latinWeightOffsetSteps,
    sizes: {
      ...previousPreset.sizes,
      [activeSize]: payload.sizeConfig,
    },
  };

  return normalizeFontLabDocument({
    ...document,
    activePreset: payload.activePreset,
    activeSize,
    presets: {
      ...document.presets,
      [payload.activePreset]: nextPreset,
    },
  });
}

export async function writeFontLabConfig(
  document: FontLabDocument,
  filePath = FONT_LAB_CONFIG_FILE,
) {
  await writeJsonAtomically(
    filePath,
    `${JSON.stringify(normalizeFontLabDocument(document), null, 2)}\n`,
  );
}
