# MagicMirror Module: MMM-Random-local-image

A MagicMirror Module to show random images from a local folder on the Mirror.

## Screenshots

Displaying image with additional information (path to the file)

https://user-images.githubusercontent.com/12208766/201987800-9412e06d-5ef3-457e-be18-cb3d728b2f73.mov


## Installation

In your terminal, go to your MagicMirror's Module folder:

```
cd ~/MagicMirror/modules
git clone https://github.com/miccl/MMM-Random-local-image.git
cd MMM-Random-local-image
npm ci
```

Configure the module in the `config.js` file.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
  {
    module: "MMM-Random-local-image",
    position: "fullscreen_below",
    config: {
      // these are the default values
      photoDir: "./modules/MMM-Random-local-image/exampleImages/",
      photoUpdateInterval: 30 * 1000,
      photoLoadInitialDelay: 1000,
      photoLoadUpdateInterval: 12 * 60 * 60 * 1000,
      randomOrder: true,
      selectFromSubdirectories: false,
      ignoreDirRegex: "a^",
      opacity: 1.0,
      showAdditionalInformation: false,
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
];
```

## Configuration options

The following properties can be configured:

| Option                     | Description                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `photoDir`                 | Local path to your photos. root dir is Magic-Mirror root directory. <br><br>**Possible Values:** Local path <br> **Default value:** ./modules/MMM-Random-local-image/exampleImages/                                                                                         |
| `photoUpdateInterval`      | How often a new photo is displayed <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 30.000 (every 30 seconds)                                                |
| `photoLoadInitialDelay`    | Initial delay of the image loading <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 1000 (1 second)                                                            |
| `photoLoadUpdateInterval`  | Time between loading images <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 43200000 (every 12 hours)                                                  |
| `randomOrder`              | Display images in random order <br><br> **Possible Values:** `true` or `false` <br> **Default value:** `true`                                                                                              |
| `ignoreDirRegex` | Regex for ignoring specifc subdirectories. Only in combination with selectFromSubdirectories = `true` <br><br> **Possible Values:** Regex expression <br> **Default value:** "a^" (No ignored directories) |
| `selectFromSubdirectories` | The images are not selected from root dir (all possible images), but from a random subdirectory inside the root directory <br><br> **Possible Values:** `true` or `false` <br> **Default value:** `false` |
| `opacity`                  | Opacity of the image <br><br> **Possible Values:** 0.0 to 1.0 <br> **Default value:** 1.0                                                                                                                  |
| `showAdditionalInformation`       | Show image directory path <br><br> **Possible Values:** `true` or `false` <br> **Default value:** `false                                                                                                      |
| `maxWidth`       | Maximal width of picture container <br><br> **Possible Values:** css values, e.g. 100%, 30px, 15em <br> **Default value:** 100%                                                                                                       |
| `maxHeight`       | Maximal height of picture container <br><br> **Possible Values:** css values, e.g. 100%, 30px, 15em <br> **Default value:** 100%                                                                                                       
