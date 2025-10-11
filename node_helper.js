const NodeHelper = require("node_helper");
const recursive = require("recursive-readdir");

const mime = require("mime-types");
const path = require("path");
const fs = require("fs");

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

  getImages: function (self, options) {
    const photoDir = self.getPhotoDir(self, options);

    let currentChunk = [];
    let isFirstChunk = true;

    recursive(photoDir, function (err, data) {
      if (data === undefined || data.length === 0) {
        console.log(`No files found in ${photoDir}`);
        return;
      }

      for (const fileFullPath of data) {
        const file = processFilePath(photoDir, fileFullPath, options);
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

      self.sendSocketNotification(NOTIFICATION_TYPE.IMAGES_CHUNK, {
        images: currentChunk,
        isFirstChunk,
        isLastChunk: true,
      });
      currentChunk = [];

      console.log(
        `Processing complete for ${data.length} files in dir '${photoDir}'`,
      );
    });
  },

  getPhotoDir(self, payload) {
    const baseDir = payload.photoDir;
    // if subdirectories enbabled, pick a random subdirectory inside the photoDir instead of the fileDir
    if (payload.selectFromSubdirectories) {
      const subDirectories = self.getSubDirectories(
        baseDir,
        payload.ignoreDirRegex,
      );
      if (subDirectories.length === 0) {
        console.error(
          `no subdirectories found (ignoreDirRegex: ${payload.ignoreDirRegex})`,
        );
        return baseDir;
      }
      const randomSubDirectory =
        subDirectories[Math.floor(Math.random() * subDirectories.length)];
      return `${baseDir}/${randomSubDirectory}`;
    }
    return baseDir;
  },

  getSubDirectories(sourcePath, ignoreDirRegex) {
    return fs
      .readdirSync(sourcePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((dirName) => !dirName.match(ignoreDirRegex));
  },
});

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
