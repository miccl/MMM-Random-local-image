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
    return hasMediaFilesInDirectory(baseDir, config) ? baseDir : null;
  }

  let subDirectories = [];
  try {
    subDirectories = getSubDirectories(baseDir, config.ignoreDirRegex);
  } catch (err) {
    console.log(`Error processing subdirectories for ${baseDir}`, err);
    return null;
  }

  if (subDirectories.length === 0) {
    console.error(
      `no subdirectories found (ignoreDirRegex: ${config.ignoreDirRegex}). falling back to base directory.`,
    );
    return null;
  }

  return selectRandomSubdirectoryPath(subDirectories, baseDir, config);
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
 * Picks a random non-empty subdirectory.
 * Returns the path of the subdirectory, otherwise null.
 */
function selectRandomSubdirectoryPath(
  subDirectories: string[],
  baseDir: string,
  payload: Pick<ModulConfig, "ignoreVideos">,
): string | null {
  let tries = 3;
  while (tries > 0) {
    const randomSubDirectory =
      subDirectories[Math.floor(Math.random() * subDirectories.length)];
    const subDirectoryPath = path.join(baseDir, randomSubDirectory);
    if (hasMediaFilesInDirectory(subDirectoryPath, payload)) {
      return subDirectoryPath;
    }
    tries--;
  }

  return null; // TOOD: throw error
}
