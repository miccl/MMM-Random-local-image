/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/exampleImages/",
    photoUpdateInterval: 1 * 1000,
    photoLoadInitialDelay: 1000,
    photoLoadUpdateInterval: 12 * 60 * 60 * 1000,
    randomOrder: true,
    selectFromSubdirectories: false,
    ignoreDirRegex: "a^", // default matching nothing
    opacity: 1.0,
    showAdditionalInformation: false,
    maxWidth: "100%",
    maxHeight: "100%",
  },

  imageLoadFinished: false,
  images: [],
  imageIndex: 0,
  shownImagesCount: 0,
  imageOrder: [],
  error: null,

  start: function () {
    Log.info(`Module ${this.name} started...`);
    Log.debug("Configuration: : " + this.config);

    // TODO: check it for all configs and check type
    if (!this.config.photoDir) {
      this.error = "Missing required parameter 'photoDir'";
    }

    setTimeout(this.loadImages(), this.config.photoLoadInitialDelay);
  },

  loadImages: function () {
    Log.info("Retrieving images...");
    this.sendSocketNotification("RANDOM_IMAGES_GET", this.config);
  },

  getDom: function () {
    const wrapper = document.createElement("div");

    if (this.error) {
      wrapper.innerHTML = this.translate(this.error);
      return wrapper;
    }

    if (!this.imageLoadFinished) {
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
    const element = document.createElement("img");
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

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RANDOM_IMAGE_LIST") {
      Log.debug("Image received...");

      // init
      this.images = payload;
      this.initImageOrder(payload);

      if (!this.imageLoadFinished) {
        this.loadNextImage();
        this.schedulePhotoUpdateInterval();
        this.schedulePhotoLoadUpdateInterval();
      }

      this.imageLoadFinished = true;
    }
  },

  initImageOrder: function (payload) {
    this.shownImagesCount = 0;
    if (this.config.randomOrder) {
      const orderArray = Array.from(Array(payload.length).keys());
      this.shuffle(orderArray);
      this.imageOrder = orderArray;
    }
  },

  schedulePhotoUpdateInterval: function () {
    Log.debug(
      `Scheduled update interval (${this.config.photoLoadUpdateInterval / 1000}s)...`,
    );
    setInterval(() => {
      this.loadNextImage();
    }, this.config.photoUpdateInterval);
  },

  loadNextImage: function () {
    this.nextImageIndex();
    this.updateDom();
  },

  schedulePhotoLoadUpdateInterval: function () {
    Log.debug(
      `Scheduled photo load update interval (${this.config.photoLoadUpdateInterval / 1000}s)...`,
    );

    setInterval(() => this.loadImages(), this.config.photoLoadUpdateInterval);
  },

  nextImageIndex: function () {
    this.imageIndex = this.config.randomOrder
      ? this.imageOrder[this.shownImagesCount]
      : this.shownImagesCount;

    Log.debug(`Number of image shown: ${this.shownImagesCount}`);
    Log.debug(`Current image index: ${this.imageIndex}`);

    // all images shown? --> reset counter, initial new image load
    if (this.shownImagesCount === this.images.length - 1) {
      this.shownImagesCount = 0;
      // this.loadImages(); // TODO: add config that after all photos are run out, it loads another bunch
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
  },
});
