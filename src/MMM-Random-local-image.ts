/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

import * as Log from "logger";
import { processInfoTemplate } from "./frontend/info-template";
import { shuffle } from "./frontend/shuffle";
import type { ImageInfoConfig } from "./types/config";
import type { Image, ImageChunk } from "./types/image";
import { SocketNotification } from "./types/socket-notification";

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/exampleImages/",
    backupDir: undefined,
    photoUpdateInterval: 30 * 1000, // 30 seconds
    photoLoadInitialDelay: 0,
    photoLoadUpdateInterval: 12 * 60 * 60 * 1000, // 12 hours
    randomOrder: true,
    selectFromSubdirectories: false,
    ignoreVideos: true,
    ignoreDirRegex: "a^", // default matching nothing
    opacity: 1,
    showAdditionalInformation: false,
    maxWidth: "100%",
    maxHeight: "100%",
    infoTemplate: "{{date}}",
    dateFormat: "DD.MM.YYYY",
    transition: [
      "fade",
    ],
    transitionDuration: 1500, // 1 second in milliseconds
  },

  initialImageLoadingFinished: false,
  images: [],
  totalImages: 0,
  imageIndex: 0,
  error: null,

  getStyles: () => ["MMM-Random-local-image.css"],

  start: function () {
    Log.info(`Module ${this.name} started...`);
    Log.debug(`Configuration: : ${this.config}`);

    // TODO: check it for all configs and check type
    if (!this.config.photoDir) {
      this.error = "Missing required parameter 'photoDir'";
    }

    setTimeout(() => {
      Log.info("Retrieving first images...");
      this.sendSocketNotification(SocketNotification.GetImages, this.config);
    }, this.config.photoLoadInitialDelay);
  },

  /**
   * Triggers node_helper.js to load the images from the disk
   */
  loadImages: function () {
    if (this.initialImageLoadingFinished) {
      Log.info("Retrieving images...");
      this.sendSocketNotification(SocketNotification.GetImages, this.config);
    }
  },

  /**
   * Receives images from node_helper.js
   * @param notification type of the notification
   * @param payload images
   */
  socketNotificationReceived: function (
    notification: string,
    payload: ImageChunk,
  ) {
    if (notification !== SocketNotification.MediaChunk) {
      return;
    }

    this.images = payload.isFirstChunk
      ? payload.images
      : this.images.concat(payload.images);

    if (payload.isFirstChunk) {
      this.totalImages = payload.images.length;
      this.imageIndex = -1;
      if (this.config.randomOrder) {
        this.images = shuffle(this.images);
      }
    }

    // Add to totalImages for subsequent chunks
    this.totalImages += payload.images.length;

    // If this is the last chunk, shuffle the images if random order is enable
    if (payload.isLastChunk && this.config.randomOrder) {
      this.images = shuffle(this.images);
    }

    // Update DOM to show progress
    if (!this.initialImageLoadingFinished) {
      this.initialImageLoadingFinished = true;
      this.loadNextImage();
      setInterval(() => this.loadNextImage(), this.config.photoUpdateInterval);

      // only need to refresh when there are subdirectories
      if (this.config.selectFromSubdirectories) {
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
    wrapper.className = "mmm-random-image-wrapper";

    if (this.error) {
      wrapper.innerHTML = this.translate(this.error);
      return wrapper;
    }

    if (!this.initialImageLoadingFinished) {
      // Show loading progress if available
      if (this.totalFilesToLoad > 0) {
        wrapper.innerHTML = `Loading ${this.filesProcessed}/${this.totalFilesToLoad} files...`;
      } else {
        wrapper.innerHTML = `Loading...`;
      }
      return wrapper;
    }

    const image = this.images[this.imageIndex];
    if (!image) {
      Log.error(`Could not load image (index: ${this.imageIndex})`);
      return wrapper;
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "mmm-random-image-container";

    const transition = this.getNextTransition();
    if (transition) {
      imageContainer.classList.add(`transition-${transition}`);
      imageContainer.style.animationDuration = `${this.config.transitionDuration}ms`;
    }

    imageContainer.appendChild(this.createImageElement(image));
    wrapper.appendChild(imageContainer);

    if (this.config.showAdditionalInformation) {
      wrapper.appendChild(this.createInfoElement(image));
    }

    return wrapper;
  },

  createImageElement: function (image: Image) {
    const mediaType = image.mimeType.split("/")[0];
    let element: HTMLImageElement | HTMLVideoElement =
      document.createElement("img");
    if (mediaType === "video") {
      element = document.createElement("video");
    }

    element.src = image.fullPath;
    element.style.maxWidth = String(this.config.maxWidth);
    element.style.maxHeight = String(this.config.maxHeight);
    element.style.opacity = String(this.config.opacity);
    return element;
  },

  createInfoElement: function (image: Image) {
    const element = document.createElement("div");
    element.className = "dimmed small regular"; // use styles from magic mirrors main.css

    const infoText = processInfoTemplate(
      image,
      {
        currentImagesCount: this.images.length,
        totalImagesCount: this.totalImages,
      },
      this.config as ImageInfoConfig,
    );

    const node = document.createTextNode(infoText);
    element.appendChild(node);
    return element;
  },

  /**
   * Gets a random transition effect from the config array
   * @returns A single transition effect string
   */
  getNextTransition: function () {
    const transitions = this.config.transition;
    if (transitions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * transitions.length);
    return transitions[randomIndex];
  },
});
