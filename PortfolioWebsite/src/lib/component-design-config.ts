import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument,
  parseComponentDesignDocument,
  type ComponentDesignDocument,
} from "./component-design-schema.ts";

export const COMPONENT_DESIGN_CONFIG_ROOT = path.resolve(
  process.cwd(),
  "content/component-design",
);
export const COMPONENT_DESIGN_CONFIG_FILE = path.join(
  COMPONENT_DESIGN_CONFIG_ROOT,
  "component-design.json",
);

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

async function resolvePreferredLineEnding(filePath: string) {
  try {
    const existingContent = await fs.readFile(filePath, "utf8");
    return existingContent.includes("\r\n") ? "\r\n" : "\n";
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return os.EOL;
    }

    throw error;
  }
}

export async function hasComponentDesignConfig(
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readComponentDesignConfig(
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
): Promise<ComponentDesignDocument> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseComponentDesignDocument(JSON.parse(raw));

    if (!parsed) {
      throw new TypeError("Invalid component design config file");
    }

    return normalizeComponentDesignDocument(parsed);
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return createDefaultComponentDesignDocument();
    }

    throw error;
  }
}

export async function writeComponentDesignConfig(
  document: ComponentDesignDocument,
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
) {
  const lineEnding = await resolvePreferredLineEnding(filePath);
  await writeJsonAtomically(
    filePath,
    `${JSON.stringify(normalizeComponentDesignDocument(document), null, 2).replace(/\n/g, lineEnding)}${lineEnding}`,
  );
}
