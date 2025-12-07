const NodeHelper = require("node_helper");
const recursive = require("recursive-readdir");

const mime = require("mime-types");
const path = require("node:path");
const fs = require("node:fs");

const NOTIFICATION_TYPE = {
  GET_IMAGES: "RANDOM_IMAGES_GET",
  IMAGES_CHUNK: "RANDOM_IMAGES_CHUNK",
};

const CHUNK_SIZE = 50;

module.exports = NodeHelper.create({
  init: function () {
    console.log("Initializing Random-local-image module helper ...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === NOTIFICATION_TYPE.GET_IMAGES) {
      var self = this;
      self.getImages(self, payload);
    }
  },

  getImages: function (self, payload) {
    let photoDir = getMediaDir(payload, self);

    recursive(
      photoDir,
      [(file, dirent) => dirent.isFile() && isImageOrVideo(dirent.name)],
      function (err, data) {
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
            self.sendSocketNotification(NOTIFICATION_TYPE.IMAGES_CHUNK, {
              images: currentChunk,
              isFirstChunk,
              isLastChunk: false,
            });
            isFirstChunk = false;
            currentChunk = [];
          }
        }

        if (currentChunk.length > 0 || isFirstChunk) {
          self.sendSocketNotification(NOTIFICATION_TYPE.IMAGES_CHUNK, {
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
});

function getMediaDir(payload, self) {
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

function getDirByPath(payload) {
  const baseDir = payload.photoDir;

  if (!payload.selectFromSubdirectories) {
    return hasMediaFilesInDirectory(baseDir, payload) ? baseDir : null;
  }

  let subDirectories = [];
  try {
    subDirectories = getSubDirectories(baseDir, payload.ignoreDirRegex);
  } catch (err) {
    console.log(`Error processing subdirectories for ${baseDir}`, err);
    return null;
  }

  if (subDirectories.length === 0) {
    console.error(
      `no subdirectories found (ignoreDirRegex: ${payload.ignoreDirRegex}). falling back to base directory.`,
    );
    return null;
  }

  return selectRandomSubdirectoryPath(subDirectories, baseDir, payload);
}

function getSubDirectories(sourcePath, ignoreDirRegex) {
  return fs
    .readdirSync(sourcePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((dirName) => !dirName.match(ignoreDirRegex));
}

function processFilePath(photoDir, fullPath) {
  const mimeType = mime.lookup(fullPath);
  if (!mimeType) {
    return null;
  }

  const parentDirectory = path.basename(photoDir);

  // Get file stats to extract creation date
  const stats = fs.statSync(fullPath);
  const creationDate = stats.birthtime;

  return {
    fullPath,
    relativePath: `${parentDirectory}/${fullPath.slice(photoDir.length - 2)}`,
    mimeType,
    creationDate,
  };
}

function hasMediaFilesInDirectory(dirPath, options) {
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
  } catch (err) {
    if (err.code !== "ENOENT") {
      // if the error exists, but it still throws an error
      console.error("Error reading directory:", err);
    }
    return false;
  }
}

function isImageOrVideo(fileName, options) {
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
 * Picks a random non-empty subdirectory.
 * Returns the path of the subdirectory, otherwise null.
 */
function selectRandomSubdirectoryPath(subDirectories, baseDir, payload) {
  let subDirectoryPath = null;
  let tries = 5;
  do {
    const randomSubDirectory =
      subDirectories[Math.floor(Math.random() * subDirectories.length)];
    subDirectoryPath = path.join(baseDir, randomSubDirectory);
    if (hasMediaFilesInDirectory(subDirectoryPath, payload)) {
      return subDirectoryPath;
    }
    tries--;
  } while (subDirectoryPath === null && tries > 0);

  return null;
}
