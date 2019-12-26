/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

Module.register("MMM-Random-local-image", {
  defaults: {
    photoUpdateInterval: 5 * 60 * 1000, // Update every 5 minutes.
    randomOrder: true,
    opacity: 1.0,
    photoDir: "./modules/MMM-Random-local-image/photos/",
    maxWidth: "100%",
    maxHeight: "100%"
  },

  loaded: false,

  start: function() {
    Log.info("Module started!");
    Log.info("Display in order: " + (this.config.randomOrder ? "Yes" : "No"));
    this.imageIndex = 0;
    this.images = {};

    this.sendSocketNotification("RANDOM_IMAGES_GET", {
      photoDir: this.config.photoDir,
      reloadUpdateInterval: this.config.reloadUpdateInterval
    });
  },

  getDom: function() {
    var wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");

      return wrapper;
    }

    var image = this.images.photo[this.imageIndex];
    Log.log(`Image loaded: ${image.photoLink}`);
    var img = document.createElement("img");
    img.src = image.photolink;
    img.id = "mmm-random-local-image";
    img.style.maxWidth = this.config.maxWidth;
    img.style.maxHeight = this.config.maxHeight;
    img.style.opacity = this.config.opacity;
    wrapper.appendChild(img);

    return wrapper;
  },


  schedulePhotoUpdateInterval: function() {
    var self = this;

    Log.info("Scheduled update interval set up...");

    setInterval(function() {
      // Get random photo from array
      self.nextImageIndex();

      self.updateDom();
    }, this.config.photoUpdateInterval);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "RANDOM_IMAGE_LIST") {
      this.images = payload;

      if (!this.loaded) {
        this.schedulePhotoUpdateInterval();
      }

      this.loaded = true;
      this.updateDom();
    }
  },

  nextImageIndex: function() {
    var self = this;
    var imageCount = self.images.photo.length;

    if (this.config.randomOrder) {
      // get random number between 0 and (imageCount - 1)
      this.imageIndex = Math.floor(Math.random() * imageCount);
    } else {
      this.imageIndex++;
      if (this.imageIndex == imageCount) {
        // last image, reset counter
        this.imageIndex = 0;
      }
    }
  },

  getScripts: function() {
    return [this.file("node_modules/jquery/dist/jquery.min.js")];
  }
});
