import fs from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_UPLOAD_PUBLIC_DIRECTORY,
  getImageLibraryParentDirectory,
  getImageLibraryRelativeSegments,
  getMediaAssetKind,
  IMAGE_LIBRARY_PUBLIC_ROOT,
  isSafePublicPathSegment,
  joinImageLibraryPath,
  tryNormalizeImageLibraryDirectory,
  type ImageLibraryEntry,
  type ImageLibraryResponse,
} from "./media-library-paths.ts";

export type ImageLibraryErrorCode =
  | "BAD_REQUEST"
  | "INTERNAL_ERROR"
  | "NOT_FOUND";

export class ImageLibraryError extends Error {
  readonly code: ImageLibraryErrorCode;
  readonly status: number;

  constructor(message: string, status: number, code: ImageLibraryErrorCode) {
    super(message);
    this.name = "ImageLibraryError";
    this.status = status;
    this.code = code;
  }
}

export type ResolvedImageLibraryDirectory = {
  absolutePath: string;
  publicPath: string;
  rootPath: string;
};

function isMissingPathError(error: unknown) {
  return (error as NodeJS.ErrnoException).code === "ENOENT";
}

function isWithinRoot(rootPath: string, candidatePath: string) {
  const relativePath = path.relative(rootPath, candidatePath);
  return (
    relativePath === "" ||
    (!path.isAbsolute(relativePath) &&
      relativePath !== ".." &&
      !relativePath.startsWith(`..${path.sep}`))
  );
}

async function readDirectory(directory: string) {
  try {
    return await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new ImageLibraryError("Image directory does not exist", 404, "NOT_FOUND");
    }
    throw error;
  }
}

export function getImageLibraryRoot() {
  return path.resolve(process.cwd(), "public/images");
}

export async function resolveImageLibraryDirectory(
  rootDirectory: string,
  requestedDirectory: unknown,
): Promise<ResolvedImageLibraryDirectory> {
  const publicPath = tryNormalizeImageLibraryDirectory(requestedDirectory);
  if (!publicPath) {
    throw new ImageLibraryError("Invalid image directory", 400, "BAD_REQUEST");
  }

  const relativeSegments = getImageLibraryRelativeSegments(publicPath);
  if (!relativeSegments) {
    throw new ImageLibraryError("Invalid image directory", 400, "BAD_REQUEST");
  }

  let rootPath: string;
  const configuredRootPath = path.resolve(rootDirectory);
  try {
    const rootStats = await fs.lstat(configuredRootPath);
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
      throw new ImageLibraryError(
        "Image library root must be a real directory",
        400,
        "BAD_REQUEST",
      );
    }
    rootPath = await fs.realpath(configuredRootPath);
  } catch (error) {
    if (error instanceof ImageLibraryError) throw error;
    if (isMissingPathError(error)) {
      throw new ImageLibraryError("Image library does not exist", 404, "NOT_FOUND");
    }
    throw error;
  }

  let currentPath = rootPath;
  for (const segment of relativeSegments) {
    const entries = await readDirectory(currentPath);
    const exactDirectory = entries.find(
      (entry) =>
        entry.name === segment &&
        entry.isDirectory() &&
        !entry.isSymbolicLink(),
    );
    if (!exactDirectory) {
      throw new ImageLibraryError(
        "Image directory does not exist or has different casing",
        404,
        "NOT_FOUND",
      );
    }
    currentPath = path.join(currentPath, exactDirectory.name);
  }

  let absolutePath: string;
  try {
    absolutePath = await fs.realpath(currentPath);
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new ImageLibraryError("Image directory does not exist", 404, "NOT_FOUND");
    }
    throw error;
  }

  if (!isWithinRoot(rootPath, absolutePath)) {
    throw new ImageLibraryError("Image directory escapes the library root", 400, "BAD_REQUEST");
  }

  const stats = await fs.stat(absolutePath);
  if (!stats.isDirectory()) {
    throw new ImageLibraryError("Image directory does not exist", 404, "NOT_FOUND");
  }

  return {
    absolutePath,
    publicPath,
    rootPath,
  };
}

function compareEntries(left: ImageLibraryEntry, right: ImageLibraryEntry) {
  if (left.kind === "directory" && right.kind !== "directory") return -1;
  if (left.kind !== "directory" && right.kind === "directory") return 1;
  return left.name.localeCompare(right.name, "zh-CN", {
    numeric: true,
    sensitivity: "base",
  });
}

export async function listImageLibraryDirectory(
  rootDirectory: string,
  requestedDirectory: unknown = IMAGE_LIBRARY_PUBLIC_ROOT,
): Promise<ImageLibraryResponse> {
  const resolved = await resolveImageLibraryDirectory(
    rootDirectory,
    requestedDirectory,
  );
  const directoryEntries = await readDirectory(resolved.absolutePath);
  const entries: ImageLibraryEntry[] = [];

  for (const entry of directoryEntries) {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;

    const publicPath = joinImageLibraryPath(resolved.publicPath, entry.name);
    if (!publicPath) continue;

    if (entry.isDirectory()) {
      if (tryNormalizeImageLibraryDirectory(publicPath)) {
        entries.push({
          kind: "directory",
          name: entry.name,
          path: publicPath,
        });
      }
      continue;
    }

    if (!entry.isFile()) continue;
    const kind = getMediaAssetKind(publicPath);
    if (!kind) continue;
    entries.push({
      kind,
      name: entry.name,
      path: publicPath,
    });
  }

  return {
    directory: resolved.publicPath,
    entries: entries.sort(compareEntries),
    parent: getImageLibraryParentDirectory(resolved.publicPath),
  };
}

export async function ensureDefaultUploadDirectory(rootDirectory: string) {
  const rootPath = path.resolve(rootDirectory);
  const defaultDirectoryName = DEFAULT_UPLOAD_PUBLIC_DIRECTORY.slice(
    `${IMAGE_LIBRARY_PUBLIC_ROOT}/`.length,
  );
  if (!isSafePublicPathSegment(defaultDirectoryName)) {
    throw new ImageLibraryError("Invalid default upload directory", 500, "INTERNAL_ERROR");
  }

  try {
    try {
      const rootStats = await fs.lstat(rootPath);
      if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
        throw new ImageLibraryError(
          "Image library root must be a real directory",
          400,
          "BAD_REQUEST",
        );
      }
    } catch (error) {
      if (error instanceof ImageLibraryError) throw error;
      if (!isMissingPathError(error)) throw error;
      await fs.mkdir(rootPath, { recursive: true });
    }
    await fs.mkdir(path.join(rootPath, defaultDirectoryName), { recursive: true });
  } catch (error) {
    if (error instanceof ImageLibraryError) throw error;
    throw new ImageLibraryError(
      "Failed to prepare the default upload directory",
      500,
      "INTERNAL_ERROR",
    );
  }
}

export function resolveUploadDestination(
  directory: ResolvedImageLibraryDirectory,
  outputName: string,
) {
  if (!isSafePublicPathSegment(outputName)) {
    throw new ImageLibraryError("Invalid upload file name", 400, "BAD_REQUEST");
  }

  const absolutePath = path.resolve(directory.absolutePath, outputName);
  if (!isWithinRoot(directory.absolutePath, absolutePath)) {
    throw new ImageLibraryError("Upload destination escapes its directory", 400, "BAD_REQUEST");
  }

  const publicPath = joinImageLibraryPath(directory.publicPath, outputName);
  if (!publicPath) {
    throw new ImageLibraryError("Invalid upload destination", 400, "BAD_REQUEST");
  }

  return { absolutePath, publicPath };
}

export async function collectImageLibraryUsage(rootDirectory: string) {
  const directories = [path.resolve(rootDirectory)];
  let bytes = 0;
  let files = 0;

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) break;

    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (isMissingPathError(error)) continue;
      throw error;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        directories.push(absolutePath);
      } else if (entry.isFile()) {
        files += 1;
        bytes += (await fs.stat(absolutePath)).size;
      }
    }
  }

  return { bytes, files };
}
