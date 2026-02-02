import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";
import * as NodeHelper from "node_helper";
import recursive from "recursive-readdir";
import { isBackendError } from "./backend/backend-error";
import { getDirByPath, hasMediaFilesInDirectory } from "./backend/directory";
import {
  BackupDirNotFoundError,
  DirectoryReadError,
  NoMediaFilesError,
} from "./backend/errors";
import { getFileDate, isImageOrVideo } from "./backend/file";
import type { ModulConfig } from "./types/config";
import type { Image, ImageChunk } from "./types/image";
import { SocketNotification } from "./types/socket-notification";

const CHUNK_SIZE = 50;

// TODO: get rid of this
type NodeHelperContext = {
  sendImages: (chunk: ImageChunk) => void;
  getImages: (self: NodeHelperContext, payload: ModulConfig) => void;
};

module.exports = NodeHelper.create({
  init: () => {
    console.log("Initializing Random-local-image module helper ...");
  },

  socketNotificationReceived: function (
    notification: string,
    payload: ModulConfig,
  ) {
    if (notification === SocketNotification.GetImages) {
      this.getImages(this, payload);
    }
  },

  getImages: async (
    self: NodeHelperContext,
    payload: ModulConfig,
  ): Promise<void> => {
    try {
      // Outer try: catches synchronous errors from getMediaDir()
      const photoDir = getMediaDir(payload, self);

      recursive(
        photoDir,
        [ignoreFiles(payload)],
        async (err: Error | null, data: string[] | undefined) => {
          try {
            // Inner try: catches errors inside recursive callback

            // Handle recursive read errors
            if (err) {
              throw new DirectoryReadError(photoDir, err);
            }

            // Handle empty directory
            if (data === undefined || data.length === 0) {
              throw new NoMediaFilesError(photoDir, payload.ignoreVideos);
            }

            // Process files normally
            let currentChunk = [];
            let isFirstChunk = true;

            for (const fileFullPath of data) {
              const file = processFilePath(photoDir, fileFullPath);
              if (!file) {
                continue;
              }
              currentChunk.push(file);

              if (currentChunk.length === CHUNK_SIZE) {
                self.sendImages({
                  images: currentChunk,
                  isFirstChunk,
                  isLastChunk: false,
                });
                isFirstChunk = false;
                currentChunk = [];
              }
            }

            if (currentChunk.length > 0 || isFirstChunk) {
              self.sendImages({
                images: currentChunk,
                isFirstChunk,
                isLastChunk: true,
              });
            }

            console.log(
              `Processing complete for ${data.length} files in dir '${photoDir}'`,
            );
          } catch (callbackErr) {
            // Handle errors from inside recursive callback
            await handleMediaLoadError(self, callbackErr);
          }
        },
      );
    } catch (err) {
      // Handle errors from getMediaDir (synchronous, before recursive)
      await handleMediaLoadError(self, err);
    }
  },

  sendImages: function (chunk: ImageChunk) {
    this.sendSocketNotification(SocketNotification.MediaChunk, chunk);
  },
});

function ignoreFiles(config: ModulConfig) {
  return (filePath: string, stats: fs.Stats) =>
    stats.isFile() && !isImageOrVideo(path.basename(filePath), config);
}

function getMediaDir(payload: ModulConfig, self: NodeHelperContext): string {
  const photoDir = getDirByPath(payload);

  if (!photoDir) {
    console.log(
      `Nothing found in photoDir: ${payload.photoDir}, trying backupDir...`,
    );

    if (
      payload.backupDir &&
      hasMediaFilesInDirectory(payload.backupDir, payload)
    ) {
      // Setup retry timer ONLY when using backupDir (fallback scenario)
      setTimeout(() => self.getImages(self, payload), 60 * 1000);
      return payload.backupDir;
    }

    // No media found in photoDir or backupDir
    // Setup retry before throwing error
    setTimeout(() => self.getImages(self, payload), 60 * 1000);
    throw new BackupDirNotFoundError(payload.photoDir, payload.backupDir);
  }

  // Happy path - photoDir found successfully, NO retry timeout
  return photoDir;
}

/**
 * Centralized error handler for all MediaLoadError types.
 * Generates and sends error image to frontend.
 */
async function handleMediaLoadError(
  self: NodeHelperContext,
  err: unknown,
): Promise<void> {
  if (!isBackendError(err)) {
    // Re-throw unexpected errors
    console.error("Unexpected error in getImages:", err);
    throw err;
  }

  console.error(`[${err.name}] ${err.message}`);

  try {
    // Call generateErrorImage() on the error instance
    const errorImageDataUri = await err.generateErrorImage();
    const errorImage: Image = {
      fullPath: errorImageDataUri,
      mimeType: "image/png",
      relativePath: `error/${err.name.toLowerCase()}.png`,
      creationDate: new Date().toDateString(),
    };

    // Send single error image chunk
    self.sendImages({
      images: [errorImage],
      isFirstChunk: true,
      isLastChunk: true,
    });

    console.log(`Error image sent to frontend: ${err.title}`);
  } catch (imageGenError) {
    console.error("Failed to generate error image:", imageGenError);
  }
}

function processFilePath(photoDir: string, fullPath: string): Image | null {
  const mimeType = mime.lookup(fullPath);
  if (!mimeType) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  const fileDate = getFileDate(stats);

  return {
    fullPath,
    mimeType,
    relativePath: `${path.basename(photoDir)}/${fullPath.slice(photoDir.length - 2)}`,
    creationDate: fileDate.toDateString(),
  };
}
