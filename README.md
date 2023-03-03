# MagicMirror Module: MMM-Random-local-image

A MagicMirror Module to show random images from a local folder on the Mirror.

![Screenshot](.github/mmm-random-local-image.gif)

## Installation

In your terminal, go to your MagicMirror's Module folder:

```
cd ~/MagicMirror/modules
git clone https://github.com/miccl/MMM-Random-local-image.git
cd MMM-Random-local-image
npm ci
```

Configure the module in the `config.js` file (see ).

## Update

In your tmerinal go into the module, pull the newest changes and install them:

```
cd ~/MagicMirror/modules/MMM-Random-local-image
git pull
npm ci 
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
  {
    module: "MMM-Random-local-image",
    position: "fullscreen_below",
    config: {
      // see default values below
    },
  },
];
```

## Configuration options

The following properties can be configured:

| Option                      | Description                                                                                                    | Possible Values                   | Default Value                                   |
|-----------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------|-------------------------------------------------|
| `photoDir`                  | Local path to your photos. root dir is Magic-Mirror root directory                                             | Local file path                   | ./modules/MMM-Random-local-image/exampleImages/ |
| `photoUpdateInterval`       | How often a new photo is displayed                                                                             | A positive number of milliseconds | 30.000 (every 30 seconds)                       | |
| `photoLoadInitialDelay`     | Initial delay of the image loading                                                                             | A positive number of milliseconds | 1000 (1 second)                                 |
| `photoLoadUpdateInterval`   | Time between loading images                                                                                    | A positive number of milliseconds | 43200000 (every 12 hours)                       |
| `randomOrder`               | Display images in random order                                                                                 | `true`or `false`                  | `true`                                          |
| `ignoreDirRegex`            | Regex for ignoring specifc subdirectories. Only in combination with selectFromSubdirectories = `true`          | Regex expression                  | "a^" (No ignored directories)                   |
| `selectFromSubdirectories`  | Wether images are not selected from `photoDir`, but from a random subdirectory inside the `photoDir` directory | `true` or `false`                 | `false`                                         |
| `opacity`                   | Opacity of the image                                                                                           | 0.0 to 1.0                        | 1.0                                             |
| `showAdditionalInformation` | Show image directory path                                                                                      | `true` or `false`                 | `false                                          |
| `maxWidth`                  | Maximal width of picture container                                                                             | css values, e.g. 100%, 30px, 15em | 100%                                            |
| `maxHeight`                 | Maximal height of picture container                                                                            | css values, e.g. 100%, 30px, 15em | 100%                                            |

**Hint**: The more images are in the `photoDir`, the longer the initial loading of the images takes. 
As a workaround, you could use the `selectFromSubdirectories` setting, which selects a random folder in the `photoDir` and displays the images from the folder instead of loading all images from the `photoDir`. 
This way you have the possibility to structure the images as well. I myself divide the pictures then in years.
With the property `showAdditionalInformation` you can also show directly from which folder they originate.

## Get images on your magic mirror

There are several ways to get the files on your magic mirror.

### A) Copy files

Copy the files directly on the magic mirror e.g. connect a usb, download from the web.

### B) NFS

Use NSF to sync the files to your mirror. You need to configure a mounting point to your server/cloud in `/etc/fstab`.
My entry looks like the following:

```
192.xxx.2.xxx:/nfs/Public /home/pi/cloud/modules/MMM-Random-local-image/nfs_image_cloud nfs ro,soft,bg,intr,x-systemd.automount 0   0
```

There are a lot of [sources](https://pimylifeup.com/raspberry-pi-nfs-client/) which describe the process.
