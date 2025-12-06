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
    let photoDir = getPhotoDir(payload);
    if (!photoDir) {
      console.log(
        `Nothing found in photoDir: ${payload.photoDir}, trying backupDir...`,
      );
      if (payload.backupDir) {
        if (hasFilesInDirectory(payload.backupDir)) {
          photoDir = payload.backupDir;
        } else {
          photoDir = payload.errorDir; // TODO: instead of giving the dir, just give a specific photo
        }

        setTimeout(() => self.getImages(self, payload), 60 * 1000);
      }
    }

    recursive(photoDir, function (err, data) {
      if (err) {
        console.error("Error reading directory recursively:", err);
        return;
      }

      if (data === undefined || data.length === 0) {
        console.log(`No files found in ${photoDir}`);
        return;
      }

      let currentChunk = [];
      let isFirstChunk = true;

      for (const fileFullPath of data) {
        const file = processFilePath(photoDir, fileFullPath, payload);
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
    });
  },
});

// TODO: make it using three parameters
function getPhotoDir(payload) {
  const baseDir = payload.photoDir;

  if (!payload.selectFromSubdirectories) {
    return hasFilesInDirectory(baseDir) ? baseDir : null;
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

  return selectRandomSubdirectoryPath(subDirectories, baseDir);
}

function getSubDirectories(sourcePath, ignoreDirRegex) {
  return fs
    .readdirSync(sourcePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((dirName) => !dirName.match(ignoreDirRegex));
}

function processFilePath(photoDir, fullPath, options) {
  const mimeType = detectMediaFile(fullPath, options);
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

function detectMediaFile(filePath, options) {
  const mimeType = mime.lookup(filePath);
  if (!mimeType) {
    return null;
  }
  const fileType = mimeType.split("/")[0];
  if (fileType === "image") {
    return mimeType;
  }
  if (!options.ignoreVideos && fileType === "video") {
    return mimeType;
  }
  return null;
}

function hasFilesInDirectory(dirPath) {
  try {
    const files = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isFile());

    // TODO: filter only relevant files
    return files.length > 0;
  } catch (err) {
    if (err.code !== "ENOENT") {
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
function selectRandomSubdirectoryPath(subDirectories, baseDir) {
  let subDirectoryPath = null;
  let tries = 5;
  do {
    const randomSubDirectory =
      subDirectories[Math.floor(Math.random() * subDirectories.length)];
    subDirectoryPath = path.join(baseDir, randomSubDirectory);
    if (hasFilesInDirectory(subDirectoryPath)) {
      return subDirectoryPath;
    }
    tries--;
  } while (subDirectoryPath === null && tries > 0);

  return null;
}
