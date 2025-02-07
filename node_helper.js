var NodeHelper = require("node_helper");
var recursive = require("recursive-readdir");
var isImage = require("is-image");

const path = require("path");
const fs = require("fs");

module.exports = NodeHelper.create({
  init: function () {
    console.log("Initializing Random-local-image module helper ...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RANDOM_IMAGES_GET") {
      var self = this;
      const photoDir = self.getPhotoDir(self, payload);
      self.getImages(self, photoDir);
    }
  },

  getImages: function (self, photoDir) {
    var images = new Array();
    recursive(photoDir, function (err, data) {
      if (data !== undefined && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          var photoFullPath = data[i];
          // only show directory if a subdirectory is selected
          var parentDirectory = path.basename(photoDir);
          var photoRelativePath =
            parentDirectory + "/" + photoFullPath.substr(photoDir.length - 2);

          if (isImage(photoFullPath)) {
            images.push({
              fullPath: photoFullPath,
              relativePath: photoRelativePath,
            });
          }
        }
      } else {
        console.log(`No files found in ${photoDir}`);
        return;
      }

      console.log(`Loaded ${images.length} images from dir '${photoDir}' ...`);
      self.sendSocketNotification("RANDOM_IMAGE_LIST", images);
    });
  },

  getPhotoDir(self, payload) {
    const baseDir = payload.photoDir;
    // if subdirectories enbabled, pick a random subdirectory inside the photoDir instead the photoDir
    if (payload.selectFromSubdirectories) {
      const subDirectories = self.getSubDirectories(
        baseDir,
        payload.ignoreDirRegex,
      );
      if (subDirectories.length == 0) {
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
