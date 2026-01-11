/* global Module */

/* Magic Mirror
 * Module: MMM-Random-local-image
 */

import * as Log from "logger";
import { shuffle } from "./utilities/shuffle";
import { Image, ImageChunk } from "./types/image";
import { processInfoTemplate } from "./frontend/info-template";
import { ImageInfoConfig } from "./types/config";
import { SocketNotification } from "./types/socket-notification";

Module.register("MMM-Random-local-image", {
  defaults: {
    photoDir: "./modules/MMM-Random-local-image/exampleImages/",
    backupDir: "./modules/MMM-Random-local/image/backupFiles",
    errorDir: "./modules/MMM-Random-local-image/errorImages/",
    photoUpdateInterval: 30 * 1000, // 30 seconds
    photoLoadInitialDelay: 1000, // 1 second
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

    setTimeout(() => {
      Log.info("Retrieving first images...");
      this.sendSocketNotification(SocketNotification.GetImages, this.config);
    }, this.config.photoLoadInitialDelay);

    setInterval(() => this.loadNextImage(), this.config.photoUpdateInterval);

    // only need to refresh when there are subdirectories
    if (this.config.selectFromSubdirectories) {
      setInterval(() => this.loadImages(), this.config.photoLoadUpdateInterval);
    }
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
  socketNotificationReceived: function (notification, payload: ImageChunk) {
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

      this.initialImageLoadingFinished = true;
    }

    // Add to totalImages for subsequent chunks
    this.totalImages += payload.images.length;

    // If this is the last chunk, shuffle the images if random order is enable
    if (payload.isLastChunk && this.config.randomOrder) {
      this.images = shuffle(this.images);
    }
  },

  loadNextImage: function () {
    if (!this.initialImageLoadingFinished) {
      return;
    }

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

  createImageElement: function (image: Image) {
    const mediaType = image.mimeType.split("/")[0];
    let element = document.createElement("img") as any;
    if (mediaType === "video") {
      element = document.createElement("video");
      element.type = image.mimeType;
    }

    element.src = image.fullPath;
    element.style.maxWidth = this.config.maxWidth;
    element.style.maxHeight = this.config.maxHeight;
    element.style.opacity = this.config.opacity;
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
});
