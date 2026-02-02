import fs, { type Dirent } from "node:fs";
import path from "node:path";
import type { ModulConfig } from "../types/config";
import { isImageOrVideo } from "./file";

export function getDirByPath(
  config: Pick<
    ModulConfig,
    "photoDir" | "selectFromSubdirectories" | "ignoreDirRegex" | "ignoreVideos"
  >,
): string | null {
  const baseDir = config.photoDir;

  if (!config.selectFromSubdirectories) {
    const hasFiles = hasMediaFilesInDirectory(baseDir, config);
    if (!hasFiles) {
      console.log(
        `[getDirByPath] No media files found in base directory: ${baseDir}`,
      );
    } else {
      console.log(`[getDirByPath] Using base directory: ${baseDir}`);
    }
    return hasFiles ? baseDir : null;
  }

  // selectFromSubdirectories is enabled
  console.log(
    `[getDirByPath] Looking for subdirectories in ${baseDir} (ignoreDirRegex: ${config.ignoreDirRegex})`,
  );

  let subDirectories = [];
  try {
    subDirectories = getSubDirectories(baseDir, config.ignoreDirRegex);
  } catch (err) {
    console.error(
      `[getDirByPath] Error reading subdirectories in ${baseDir}:`,
      err,
    );
    return null;
  }

  if (subDirectories.length === 0) {
    console.warn(
      `[getDirByPath] No subdirectories found in ${baseDir} (ignoreDirRegex: ${config.ignoreDirRegex})`,
    );
    return null;
  }

  console.log(
    `[getDirByPath] Found ${subDirectories.length} subdirectories in ${baseDir}`,
  );

  const selectedDir = selectRandomSubdirectoryPath(
    subDirectories,
    baseDir,
    config,
  );

  if (!selectedDir) {
    console.warn(
      `[getDirByPath] No non-empty subdirectories found (checked ${subDirectories.length} directories)`,
    );
  } else {
    console.log(`[getDirByPath] Selected subdirectory: ${selectedDir}`);
  }

  return selectedDir;
}

export function getSubDirectories(
  sourcePath: string,
  ignoreDirRegex: string,
): string[] {
  return fs
    .readdirSync(sourcePath, { withFileTypes: true })
    .filter((dirent: Dirent) => dirent.isDirectory())
    .map((dirent: Dirent) => dirent.name)
    .filter((dirName: string) => !dirName.match(ignoreDirRegex));
}

export function hasMediaFilesInDirectory(
  dirPath: string,
  options: Pick<ModulConfig, "ignoreVideos">,
): boolean {
  try {
    const dir = fs.opendirSync(dirPath);
    let dirent: Dirent | null = dir.readSync();
    while (dirent !== null) {
      if (dirent.isFile() && isImageOrVideo(dirent.name, options)) {
        dir.closeSync();
        return true; // Found one, exit immediately
      }
      dirent = dir.readSync();
    }

    dir.closeSync();
    return false;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error?.code !== "ENOENT") {
      // if the error exists, but it still throws an error
      console.error("Error reading directory:", error);
    }
    return false;
  }
}

/**
 * Gets all subdirectories that contain media files.
 * @param subDirectories Array of subdirectory names
 * @param baseDir Base directory path
 * @param payload Configuration options
 * @returns Array of full paths to non-empty subdirectories
 */
function getAllNonEmptySubdirectories(
  subDirectories: string[],
  baseDir: string,
  payload: Pick<ModulConfig, "ignoreVideos">,
): string[] {
  const nonEmptyDirs: string[] = [];

  for (const subDir of subDirectories) {
    const subDirPath = path.join(baseDir, subDir);
    if (hasMediaFilesInDirectory(subDirPath, payload)) {
      nonEmptyDirs.push(subDirPath);
    }
  }

  return nonEmptyDirs;
}

/**
 * Picks a random non-empty subdirectory.
 * First finds all non-empty directories, then selects one randomly.
 * Returns the path of the subdirectory, otherwise null.
 */
function selectRandomSubdirectoryPath(
  subDirectories: string[],
  baseDir: string,
  payload: Pick<ModulConfig, "ignoreVideos">,
): string | null {
  // Get all non-empty subdirectories
  const nonEmptyDirs = getAllNonEmptySubdirectories(
    subDirectories,
    baseDir,
    payload,
  );

  if (nonEmptyDirs.length === 0) {
    console.log(
      `[selectRandomSubdirectoryPath] No non-empty subdirectories found in ${baseDir} (checked ${subDirectories.length} directories)`,
    );
    return null;
  }

  console.log(
    `[selectRandomSubdirectoryPath] Found ${nonEmptyDirs.length} non-empty subdirectories out of ${subDirectories.length} total`,
  );

  // Pick a random directory from the non-empty ones
  const randomIndex = Math.floor(Math.random() * nonEmptyDirs.length);
  const selectedDir = nonEmptyDirs[randomIndex];

  console.log(`[selectRandomSubdirectoryPath] Selected: ${selectedDir}`);

  return selectedDir;
}
