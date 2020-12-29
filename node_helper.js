var NodeHelper = require('node_helper');
var recursive = require('recursive-readdir');
var isImage = require('is-image');

const path = require('path');
const fs = require('fs');

module.exports = NodeHelper.create({

	init: function () {
		console.log('Initializing module helper ...');
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === 'RANDOM_IMAGES_GET') {
			var self = this;
			self.getImages(self, payload.photoDir, payload.selectFromSubdirectories);
		}
	},

	getImages: function (self, baseDir, selectFromSubdirectories) {
		var images = {}
		images = new Array();
<<<<<<< HEAD
		console.log('Loading images...');

		const photoDir = getPhotoDir(self, baseDir, selectFromSubdirectories);
=======
		const photoDir = self.getPhotoDir(self, baseDir, selectFromSubdirectories);
>>>>>>> ac52277... more advances

		recursive(photoDir, function (err, data) {
			if (data !== undefined && data.length > 0) {
				for (i = 0; i < data.length; i++) {
					var photoFullPath = data[i];
					// only show directory if a subdirectory is selected
					var parentDirectory = path.basename(photoDir);
					var photoRelativePath = parentDirectory + photoFullPath.substr(photoDir.length - 2);
					
					if (isImage(photoFullPath)) {
						images.push({
							'fullPath': photoFullPath,
							'relativePath': photoRelativePath
						});
					}
				}
			} else {
				console.log(`No files found in ${photoDir}`);
				return;
			}

<<<<<<< HEAD
			console.log(`Loading ${images.length} images from dir ${photoDir}...`);
=======
			console.log(`Loaded ${images.length} images from dir '${photoDir}' ...`);
>>>>>>> ac52277... more advances
			self.sendSocketNotification('RANDOM_IMAGE_LIST', images);
		});

	},

	getPhotoDir(self, baseDir, selectFromSubdirectories) {
		// if subdirectories enbabled, pick a random subdirectory inside the photoDir instead the photoDir
		if (selectFromSubdirectories) {
			const subDirectories = self.getSubDirectories(baseDir);
			const randomSubDirectory = subDirectories[Math.floor(Math.random() * subDirectories.length)];
			return `${baseDir}/${randomSubDirectory}`;
		}
		return baseDir;
	},

	getSubDirectories(sourcePath) {
		return fs.readdirSync(sourcePath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
	}

});
