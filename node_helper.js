var NodeHelper = require('node_helper');
var recursive = require('recursive-readdir');
var isImage = require('is-image');

module.exports = NodeHelper.create({

	init: function () {
		console.log('Initializing module helper ...');
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === 'RANDOM_IMAGES_GET') {
			var self = this;
			photoDir = payload.photoDir;
			self.getImages(self, photoDir);
		}
	},

	getImages: function (self, photoDir) {
		var images = {}
		images = new Array();

		recursive(photoDir, function (err, data) {
			if (data !== undefined && data.length > 0) {
				for (i = 0; i < data.length; i++) {
					var photoLink = data[i];
					if (isImage(photoLink)) {
						images.push({
							'src': photoLink,
						});
					}
				}
			} else {
				console.log(`No photo's found, make sure there is a folder called 'photos' in this directory`);
				return;
			}

			console.log('Loaded ' + images.length + ' images');
			self.sendSocketNotification('RANDOM_IMAGE_LIST', images);
		});

	},

});
