/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/exampleImages/",
    photoUpdateInterval: 30 * 1000,
    photoLoadInitialDelay: 1000,
    photoLoadUpdateInterval: 12 * 60 * 60 * 1000,
    randomOrder: true,
    selectFromSubdirectories: false,
    ignoreVideos: false,
    ignoreDirRegex: "a^", // default matching nothing
    opacity: 1.0,
    showAdditionalInformation: false,
    maxWidth: "100%",
    maxHeight: "100%",
  },

  initialImageLoadingFinished: false,
  images: [],
  imageIndex: 0,
  error: null,

  start: function () {
    Log.info(`Module ${this.name} started...`);
    Log.debug("Configuration: : " + this.config);

    // TODO: check it for all configs and check type
    if (!this.config.photoDir) {
      this.error = "Missing required parameter 'photoDir'";
    }

    setTimeout(() => this.loadImages(), this.config.photoLoadInitialDelay);
  },

  /**
   * Triggers node_helper.js to load the images from the disk
   */
  loadImages: function () {
    Log.info("Retrieving images...");
    this.sendSocketNotification("RANDOM_IMAGES_GET", this.config);
  },

  /**
   * Receives images from node_helper.js
   * @param notification type of the notification
   * @param payload images
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "RANDOM_IMAGE_LIST") {
      // init
      this.images = payload;
      this.imageIndex = -1;
      if (this.config.randomOrder) {
        shuffle(this.images);
      }
      Log.info(`Received ${this.images.length} images`);

      const isFirstTime = !this.initialImageLoadingFinished;

      this.initialImageLoadingFinished = true;
      this.loadNextImage();

      if (isFirstTime) {
        setInterval(
          () => this.loadNextImage(),
          this.config.photoUpdateInterval,
        );
        setInterval(
          () => this.loadImages(),
          this.config.photoLoadUpdateInterval,
        );
      }
    }
  },

  loadNextImage: function () {
    const allImagesShown = this.setNextImage();
    if (allImagesShown) {
      // this.loadImages(); // TODO: add option to add this code line (load new images when all pictures where shown)
    }
    this.updateDom(); // built-in function
  },

  setNextImage: function () {
    const nextIndex = this.imageIndex + 1;
    this.imageIndex = this.imageIndex + 1;
    // all images shown? --> reset counter
    if (this.imageIndex > this.images.length - 1) {
      this.imageIndex = 0;
      return true;
    }
    this.imageIndex = nextIndex;
    return false;
  },

  getDom: function () {
    const wrapper = document.createElement("div");

    if (this.error) {
      wrapper.innerHTML = this.translate(this.error);
      return wrapper;
    }

    if (!this.initialImageLoadingFinished) {
      wrapper.innerHTML = this.translate("LOADING");
      return wrapper;
    }

    const image = this.images[this.imageIndex];
    if (!image) {
      Log.error(`Could not load image (index: ${this.imageIndex})`);
      wrapper.innerHTML = this.translate("ERROR LOADING");
      return wrapper;
    }

    wrapper.appendChild(this.createImageElement(image));
    if (this.config.showAdditionalInformation) {
      wrapper.appendChild(this.createFilePathElement(image));
    }

    return wrapper;
  },

  createImageElement: function (image) {
    const mediaType = image.mimeType.split("/")[0];
    let element = document.createElement("img");
    if (mediaType === "video") {
      element = document.createElement("video");
      element.type = image.mime;
    }

    element.src = image.fullPath;
    element.style.maxWidth = this.config.maxWidth;
    element.style.maxHeight = this.config.maxHeight;
    element.style.opacity = this.config.opacity;
    return element;
  },

  createFilePathElement: function (image) {
    const element = document.createElement("div");
    element.className = "dimmed small regular"; // use styles from magic mirrors main.css
    const node = document.createTextNode(image.relativePath);
    element.appendChild(node);
    return element;
  },
});

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
