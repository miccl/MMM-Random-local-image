/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/photos/",
    photoUpdateInterval: 30 * 1000,
    photoLoadInitialDelay: 1000,
    photoLoadUpdateInterval: 12 * 60 * 60 * 1000,
    randomOrder: true,
    selectFromSubdirectories: false,
    ignoreDirRegex: "a^", // default matching nothing
    opacity: 1.0,
    showAdditionalInformation: true,
    maxWidth: "100%",
    maxHeight: "100%",
  },

  // image loaded
  imageLoadFinished: false,
  // loaded images
  images: [],
  imageIndex: 0,
  shownImagesCount: 0,
  imageOrder: [],

  start: function () {
    Log.info(`Module ${this.name} started...`);
    Log.info("Configuration: : " + this.config);

    this.error = null;
    if (!this.config.photoDir) {
      this.error = "Missing required parameter 'photoDir'";
    }
    // load images after some delay
    setTimeout(() => this.loadImages(), this.config.photoLoadInitialDelay);
  },

  loadImages: function () {
    this.sendSocketNotification("RANDOM_IMAGES_GET", {
      photoDir: this.config.photoDir,
      reloadUpdateInternval: this.config.reloadUpdateInternval,
      selectFromSubdirectories: this.config.selectFromSubdirectories,
      ignoreDirRegex: this.config.ignoreDirRegex,
    });
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    if (this.error != null) {
      wrapper.innerHTML = this.translate(this.error);
    }
    if (!this.imageLoadFinished) {
      wrapper.innerHTML = this.translate("LOADING");

      return wrapper;
    }

    var image = this.images[this.imageIndex];
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
    var element = document.createElement("img");
    element.src = image.fullPath;
    element.style.maxWidth = this.config.maxWidth;
    element.style.maxHeight = this.config.maxHeight;
    element.style.opacity = this.config.opacity;
    return element;
  },

  createFilePathElement: function (image) {
    var element = document.createElement("div");
    // use styles from magic mirrors main.css
    element.className = "dimm small regular";
    var node = document.createTextNode(image.relativePath);
    element.appendChild(node);
    return element;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RANDOM_IMAGE_LIST") {
      Log.info("Image received...");

      // init
      this.images = payload;
      this.initImageOrder(payload);

      if (!this.imageLoadFinished) {
        this.schedulePhotoUpdateInterval();
        this.schedulePhotoLoadUpdateInterval();
      }

      this.imageLoadFinished = true;
    }
  },

  initImageOrder: function (payload) {
    this.shownImagesCount = 0;
    if (this.config.randomOrder) {
      var orderArray = Array.from(Array(payload.length).keys());
      this.shuffle(orderArray);
      this.imageOrder = orderArray;
      Log.info(`IMAGE ORDER: ${this.imageOrder}`);
    }
  },

  schedulePhotoUpdateInterval: function () {
    Log.info(`Scheduled update interval (${this.config.photoLoadUpdateInterval/1000}s)...`);
    setInterval(() => {
      this.nextImageIndex();
      this.updateDom();
    }, this.config.photoUpdateInterval);
  },

  schedulePhotoLoadUpdateInterval: function () {
    Log.info(`Scheduled photo load update interval (${this.config.photoLoadUpdateInterval/1000}s)...`);

    setInterval(() => this.loadImages(), this.config.photoLoadUpdateInterval);
  },

  nextImageIndex: function () {
    this.imageIndex = this.config.randomOrder
      ? this.imageOrder[this.shownImagesCount]
      : this.shownImagesCount;

    Log.info(`Number of image shown: ${this.shownImagesCount}`);
    Log.info(`Current image index: ${this.imageIndex}`);

    // all images shown? --> reset counter, initial new image load
    if (this.shownImagesCount === this.images.length - 1) {
      this.shownImagesCount = 0;
      this.loadImages();
      return;
    }

    this.shownImagesCount++;
  },

  /**
   * Randomly shuffle an array
   * https://stackoverflow.com/a/2450976/1293256
   * @param  {Array} array The array to shuffle
   * @return {String}      The first item in the shuffled array
   */
  shuffle: function (array) {
    var currentIndex = array.length;
    var temporaryValue, randomIndex;

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
  },
});
