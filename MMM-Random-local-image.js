/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/exampleImages/",
    photoUpdateInterval: 30 * 1000, // 30 seconds
    photoLoadInitialDelay: 1000, // 1 second
    photoLoadUpdateInterval: 12 * 60 * 60 * 1000, // 12 hours
    randomOrder: true,
    selectFromSubdirectories: false,
    ignoreVideos: false,
    ignoreDirRegex: "a^", // default matching nothing
    opacity: 1.0,
    showAdditionalInformation: true,
    maxWidth: "100%",
    maxHeight: "100%",
    // Template for additional information display
    infoTemplate: "{{date}}", // Template for additional information
    dateFormat: "DD.MM.YYYY", // Format options: YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY, etc.
  },

  initialImageLoadingFinished: false,
  images: [],
  totalImages: 0,
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
    if (notification === "RANDOM_IMAGES_CHUNK") {
      this.images = payload.isFirstChunk
        ? payload.images
        : this.images.concat(payload.images);

      if (payload.isFirstChunk) {
        this.totalImages = payload.images.length;
        this.imageIndex = -1;
        if (this.config.randomOrder) {
          this.images = shuffle(this.images);
        }

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
        return;
      }

      // Add to totalImages for subsequent chunks
      this.totalImages += payload.images.length;

      // If this is the last chunk, shuffle the images if random order is enable
      if (payload.isLastChunk && this.config.randomOrder) {
        this.images = shuffle(this.images);
      }
    }
  },

  loadNextImage: function () {
    const allImagesShown = this.setNextImage();
    if (allImagesShown) {
      this.loadImages(); // Automatically reload images when all have been shown
      return;
    }
    this.updateDom(); // built-in function
  },

  setNextImage: function () {
    // Remove the current image from the list after showing
    if (this.images.length > 0 && this.imageIndex >= 0) {
      this.images.splice(this.imageIndex, 1);
    }
    // If no images left, reset
    if (this.images.length === 0) {
      this.imageIndex = 0;
      return true;
    }
    // Always show the next image at index 0
    this.imageIndex = 0;
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
      wrapper.appendChild(this.createInfoElement(image));
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

  createInfoElement: function (image) {
    const element = document.createElement("div");
    element.className = "dimmed small regular"; // use styles from magic mirrors main.css

    const infoText = this.processInfoTemplate(image);

    const node = document.createTextNode(infoText);
    element.appendChild(node);
    return element;
  },

  processInfoTemplate: function (image) {
    const dateObj = new Date(image.creationDate);
    const values = {
      date: this.formatDate(dateObj, this.config.dateFormat),
      currentCount: this.totalImages - this.images.length + 1,
      totalCount: this.totalImages,
    };

    let result = this.config.infoTemplate;

    // Replace each placeholder with its corresponding value
    Object.keys(values).forEach((key) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      result = result.replace(placeholder, values[key]);
    });

    return result;
  },

  formatDate: function (date, format) {
    // Simple date formatter
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    switch (format) {
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD.MM.YYYY":
        return `${day}.${month}.${year}`;
      case "YYYY-MM-DD":
      default:
        return `${year}-${month}-${day}`;
    }
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
