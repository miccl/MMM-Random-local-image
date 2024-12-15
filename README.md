# MagicMirror Module: MMM-Random-local-image

A [MagicMirror](https://github.com/MagicMirrorOrg/MagicMirror) module that displays random images from a local folder on your mirror.

![Screenshot](.github/mmm-random-local-image.gif)

## Installing the module

To install the module, clone the repo and install dependencies:

```shell
cd ~/MagicMirror/modules
git clone https://github.com/miccl/MMM-Random-local-image.git
cd MMM-Random-local-image
npm ci
```

Finally, configure the module in the config.js file (instructions below).

## Updating the module

To update the module to the latest version, pull the latest changes and reinstall the dependencies:

```shell
cd ~/MagicMirror/modules/MMM-Random-local-image
git pull
npm ci
```

## Using the module

To use this module,
add the following configuration to the modules array in your `config/config.js`:

```javascript
modules: [
  {
    module: "MMM-Random-local-image",
    position: "bottom_right",
    config: {
      // See configuration options below
    },
  },
];
```

## Configuration options

The following properties can be configured:

<!-- prettier-ignore -->
| Option                      | Description                                                                                          | Possible Values              | Default Value                                   |
|-----------------------------|------------------------------------------------------------------------------------------------------|------------------------------|-------------------------------------------------|
| `photoDir`                  | Path to the folder containing your photos (relative to the MagicMirror root directory)               | Local file path              | ./modules/MMM-Random-local-image/exampleImages/ |
| `photoUpdateInterval`       | Time interval between displayed photos                                                               | Positive integer (ms)        | 30.000 (every 30 seconds)                       |
| `photoLoadInitialDelay`     | Initial delay before loading the first image                                                         | Positive integer (ms)        | 1000 (1 second)                                 |
| `photoLoadUpdateInterval`   | Interval for refreshing the photo directory                                                          | Positive integer (ms)        | 43200000 (every 12 hours)                       |
| `randomOrder`               | Whether to display images in random order                                                            | `true`or `false`             | `true`                                          |
| `selectFromSubdirectories`  | Whether to select images from random subdirectories inside photoDir.                                | `true` or `false`            | `false`                                         |
| `ignoreDirRegex`            | Regular expression for ignoring specific subdirectories (requires selectFromSubdirectories = `true`) | Regex string                 | "a^" (No ignored directories)                   |
| `opacity`                   | Opacity of the displayed image                                                                       | 0.0 to 1.0                   | 1.0                                             |
| `showAdditionalInformation` | Show the image’s directory path                                                                      | `true` or `false`            | `false`                                         |
| `maxWidth`                  | Maximum width of image container                                                                     | css values (e.g. 100%, 30px) | 100%                                            |
| `maxHeight`                 | Maximum height of image container                                                                    | css values (e.g. 100%, 30px) | 100%                                            |

<!-- prettier-ignore-end -->

**Notes**:

- _Large photo directories_:
  If your photoDir contains many images, the initial load time might increase.
  To address this, use selectFromSubdirectories to load images from a randomly selected subdirectory.
  You can organize images in folders (e.g., by year) for better structure and display the origin using the property `showAdditionalInformation`.

## Transferring Images to Your MagicMirror

Here are a few ways to upload photos to your MagicMirror:

### A) Direct copy

Copy files directly to your MagicMirror system, for example, using a USB drive or downloading files from the web.

### B) NFS

Sync files using NFS. Configure a mounting point in /etc/fstab:

```
192.xxx.2.xxx:/nfs/Public /home/pi/cloud/modules/MMM-Random-local-image/nfs_image_cloud nfs ro,soft,bg,intr,x-systemd.automount 0   0
```

For detailed instructions, refer to the [Raspberry Pi NFS Client guide](https://pimylifeup.com/raspberry-pi-nfs-client/).
