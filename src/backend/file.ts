import type fs from "node:fs";
import mime from "mime-types";
import type { ModulConfig } from "../types/config";

export function isImageOrVideo(
  fileName: string,
  options: Pick<ModulConfig, "ignoreVideos">,
): boolean {
  const mimeType = mime.lookup(fileName);
  if (!mimeType) {
    return false;
  }
  const fileType = mimeType.split("/")[0];
  return (
    fileType === "image" || (!options.ignoreVideos && fileType === "video")
  );
}

/**
 * Gets date for a file.
 * Uses birthtime (creation date) if available and valid,
 * otherwise falls back to mtime (modification time).
 * This handles filesystems like ext4 that don't support birthtime.
 *
 * @param stats File stats object
 * @returns The most appropriate date for the file
 */
export function getFileDate(stats: fs.Stats): Date {
  let fileDate = stats.birthtime;

  if (fileDate.getTime() === 0 || fileDate.getFullYear() === 1970) {
    fileDate = stats.mtime;
  }

  return fileDate;
}
