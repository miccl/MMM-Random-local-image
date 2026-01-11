import { ModulConfig } from "../types/config";

import fs from "fs";
import { isImageOrVideo } from "./file";
import path from "node:path";

export function getDirByPath(
  config: Pick<
    ModulConfig,
    "photoDir" | "selectFromSubdirectories" | "ignoreDirRegex" | "ignoreVideos"
  >,
) {
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
  sourcePath: any,
  ignoreDirRegex: any,
): string[] {
  return fs
    .readdirSync(sourcePath, { withFileTypes: true })
    .filter((dirent: any) => dirent.isDirectory())
    .map((dirent: any) => dirent.name)
    .filter((dirName: any) => !dirName.match(ignoreDirRegex));
}

export function hasMediaFilesInDirectory(
  dirPath: string,
  options: Pick<ModulConfig, "ignoreVideos">,
): boolean {
  try {
    const dir = fs.opendirSync(dirPath);
    let dirent;
    while ((dirent = dir.readSync()) !== null) {
      if (dirent.isFile() && isImageOrVideo(dirent.name, options)) {
        dir.closeSync();
        return true; // Found one, exit immediately
      }
    }

    dir.closeSync();
    return false;
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      // if the error exists, but it still throws an error
      console.error("Error reading directory:", err);
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
