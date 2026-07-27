import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  normalizeComponentDesignDocument as normalizeComponentDesignDocumentV2,
  type ComponentDesignDocumentV2,
} from "./component-design-v2.ts";
import {
  createDefaultComponentDesignDocument,
  normalizeComponentDesignDocument as normalizeComponentDesignDocumentV3,
  parseComponentDesignDocument,
  parseCurrentComponentDesignDocument,
  resolveComponentDesignRuntimeDocument,
  type ComponentDesignDocumentV3,
} from "./component-design-v3.ts";

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

export async function readComponentDesignSourceConfig(
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
): Promise<ComponentDesignDocumentV3> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseComponentDesignDocument(JSON.parse(raw));

    if (!parsed) {
      throw new TypeError("Invalid component design config file");
    }

    return parsed;
  } catch (error) {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "ENOENT") {
      return createDefaultComponentDesignDocument();
    }

    throw error;
  }
}

export async function readComponentDesignConfig(
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
): Promise<ComponentDesignDocumentV2> {
  return resolveComponentDesignRuntimeDocument(
    await readComponentDesignSourceConfig(filePath),
  );
}

export async function writeComponentDesignSourceConfig(
  document: ComponentDesignDocumentV3,
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
) {
  const strictDocument = parseCurrentComponentDesignDocument(document);
  if (!strictDocument) {
    throw new TypeError("Invalid current component design document");
  }

  const lineEnding = await resolvePreferredLineEnding(filePath);
  await writeJsonAtomically(
    filePath,
    `${JSON.stringify(strictDocument, null, 2).replace(/\n/g, lineEnding)}${lineEnding}`,
  );
}

export async function writeComponentDesignConfig(
  document: ComponentDesignDocumentV2 | ComponentDesignDocumentV3,
  filePath = COMPONENT_DESIGN_CONFIG_FILE,
) {
  const sourceDocument = parseComponentDesignDocument(document);
  if (!sourceDocument) {
    throw new TypeError("Invalid component design document");
  }
  await writeComponentDesignSourceConfig(sourceDocument, filePath);
}

export function getComponentDesignRevision(
  document: ComponentDesignDocumentV2 | ComponentDesignDocumentV3,
): string {
  const normalized = document.version === 3
    ? normalizeComponentDesignDocumentV3(document)
    : normalizeComponentDesignDocumentV2(document);
  return createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}
