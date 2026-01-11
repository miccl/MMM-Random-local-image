import fs from "node:fs";
import path from "node:path";
import mime from "mime-types";
import * as NodeHelper from "node_helper";
import recursive from "recursive-readdir";
import { getDirByPath, hasMediaFilesInDirectory } from "./backend/directory";
import { isImageOrVideo } from "./backend/file";
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

  getImages: (self: NodeHelperContext, payload: ModulConfig): void => {
    const photoDir = getMediaDir(payload, self);
    if (!photoDir) {
      // TOOD: log error
      return;
    }

    recursive(
      photoDir,
      [ignoreFiles(payload)],
      (err: Error | null, data: string[] | undefined) => {
        if (err) {
          console.error("Error reading directory recursively:", err);
          return;
        }

        if (data === undefined || data.length === 0) {
          console.log(`No files found in ${photoDir}`);
          return; // TOOO: return error file
        }

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
      },
    );
  },

  sendImages: function (chunk: ImageChunk) {
    this.sendSocketNotification(SocketNotification.MediaChunk, chunk);
  },
});

function ignoreFiles(config: ModulConfig) {
  return (filePath: string, stats: fs.Stats) =>
    stats.isFile() && !isImageOrVideo(path.basename(filePath), config);
}

function getMediaDir(
  payload: ModulConfig,
  self: NodeHelperContext,
): string | null {
  let photoDir = getDirByPath(payload);

  if (!photoDir) {
    console.log(
      `Nothing found in photoDir: ${payload.photoDir}, trying backupDir...`,
    );
    if (payload.backupDir) {
      photoDir = hasMediaFilesInDirectory(payload.backupDir, payload)
        ? payload.backupDir
        : payload.errorDir;
      setTimeout(() => self.getImages(self, payload), 60 * 1000);
    }
  }
  return photoDir;
}

function processFilePath(photoDir: string, fullPath: string): Image | null {
  const mimeType = mime.lookup(fullPath);
  if (!mimeType) {
    return null;
  }

  return {
    fullPath,
    mimeType,
    relativePath: `${path.basename(photoDir)}/${fullPath.slice(photoDir.length - 2)}`,
    creationDate: fs.statSync(fullPath).birthtime.toDateString(), // TODO: can i parse this one?
  };
}
