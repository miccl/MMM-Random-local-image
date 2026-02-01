# MagicMirror Module: MMM-Random-local-image

A [MagicMirror](https://github.com/MagicMirrorOrg/MagicMirror) module that displays random images and videos from a local folder on your mirror.

![Screenshot](.github/demo.gif)

## Features

* **Image & Video Support** - Display both photos and videos seamlessly
* **Handles Large Collections** - Optimized chunking for hundreds of media files without freezing
* **Visual error images** - Displays error messages as images on the mirror (no need to check logs)
* **Subdirectory selection** - Can randomly pick from subdirectories to avoid scanning entire collections
* **Backup Directory Fallback** - Auto-switches to backup if primary directory unavailable (perfect for NFS)
* **Customizable Info Display** - Flexible templates showing date, position, custom text
* **Transition Effects** - Smooth animations between images with 6 different effects (fade, slide, zoom)

## Installing the module

To install the module, clone the repo and install dependencies:

```shell
cd ~/MagicMirror/modules
git clone https://github.com/miccl/MMM-Random-local-image.git
cd MMM-Random-local-image
npm ci
npm run build
```

Finally, configure the module in the config.js file (instructions below).

## Updating the module

To update the module to the latest version, pull the latest changes and reinstall the dependencies:

```shell
cd ~/MagicMirror/modules/MMM-Random-local-image
git pull
npm ci
npm run build
```

Check the [Changelog](CHANGELOG.md) for all updates.

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

### General

| Option                  | Description                                                   | Possible Values      | Default Value                                   |
|-------------------------|---------------------------------------------------------------|----------------------|-------------------------------------------------|
| `photoDir`              | Folder containing your media (relative to MM root directory)  | Local file path      | ./modules/MMM-Random-local-image/exampleImages/ |
| `randomOrder`           | Whether to display medias in random order                     | `true` or `false`    | `true`                                          |
| `ignoreVideos`          | Wether to ignore videos                                       | `true` or `false`    | `true`                                          |
| `photoUpdateInterval`   | Time interval between displayed media                         | Positive number (ms) | 30.000 (every 30 seconds)                       |
| `photoLoadInitialDelay` | Initial delay before loading the first media                  | Positive number (ms) | 0 (0 seconds)                                   |

### Backup

The media files are loaded from `photoDir`. If there are no files in `photoDir` the files in `backupDir` are used (e.g. when the nfs connection could not be established). If both directories are empty or not found, an error message will be displayed. The program will retry to load the files in `photoDir` every minute.

| Option      | Description                                                   | Possible Values | Default Value                                |
|-------------|---------------------------------------------------------------|-----------------|----------------------------------------------|
| `backupDir` | Media folder acting as backup (relative to MM root directory) | Local file path | ./modules/MMM-Random-local-image/backupFiles |

### Media from Subdirectories

If your `photoDir` contains many images and videos, loading may take minutes instead of seconds.
To speed this up, organize your media files into folders (e.g., by year) and enable `selectFromSubdirectories` to load files from a random subdirectory.

| Option                     | Description                                                          | Possible Values      | Default Value                 |
|----------------------------|----------------------------------------------------------------------|----------------------|-------------------------------|
| `selectFromSubdirectories` | Whether to select medias from random subdirectories inside photoDir. | `true` or `false`    | `false`                       |
| `ignoreDirRegex`           | Regular expression for ignoring specific subdirectories              | Regex string         | "a^" (No ignored directories) |
| `photoLoadUpdateInterval`  | Interval for changing the subdirectory                               | Positive number (ms) | 43200000 (every 12 hours)     |

### Media subcaption

Add a subcaption to each media (see the example video above)

| Option                      | Description                                                       | Possible Values                          | Default Value |
|-----------------------------|-------------------------------------------------------------------|------------------------------------------|---------------|
| `showAdditionalInformation` | Show additional information about the media                       | `true` or `false`                        | `false`       |
| `infoTemplate`              | Template string for formatting the additional information display | String with placeholders                 | "{{date}}"    |
| `dateFormat`                | Format for displaying the date                                    | `YYYY-MM-DD`, `MM/DD/YYYY`, `DD.MM.YYYY` | `DD.MM.YYYY`  |

The `infoTemplate` option supports the following placeholders:

| Placeholder        | Description                                                               |
|--------------------|---------------------------------------------------------------------------|
| `{{date}}`         | The creation date of the media file (formatted according to `dateFormat`) |
| `{{currentCount}}` | The current position in the media sequence                                |
| `{{totalCount}}`   | The total number of media files                                           |

Example templates:

- `"Created on {{date}}"` - Shows only the date
- `"Image {{currentCount}} of {{totalCount}}"` - Shows position
- `"{{date}} ({{currentCount}} of {{totalCount}})"` - Shows date and position (used in the video above)

If you have ideas for more useful templates, just create an issue with a suggestion.

### Styling

Style the media container using CSS.

| Option               | Description                       | Possible Values                                                                 | Default Value                                                  |
|----------------------|-----------------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------|
| `opacity`            | Opacity of the displayed media    | 0.0 to 1.0                                                                      | 1.0                                                            |
| `maxWidth`           | Maximum width of media container  | css values (e.g. 100%, 30px)                                                    | 100%                                                           |
| `maxHeight`          | Maximum height of media container | css values (e.g. 100%, 30px)                                                    | 100%                                                           |
| `transition`         | Array of transition effects       | Array of: `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `zoom` | `["fade"]` |
| `transitionDuration` | Duration of transition effect     | Positive number (ms)                                                            | 1000                                                           |

#### Transition Effects

The `transition` option accepts an array of transition effects. For each image change, a random transition will be selected from the array.

**No Transition**: Use no transition
```javascript
transition: []
```

**Single Transition**: Use the same transition for every image change
```javascript
transition: ["fade"]
```

**Multiple Transitions**: A random transition will be selected for each image change
```javascript
transition: ["fade", "slide-left", "slide-right", "zoom"]
```

**All Transitions**: Maximum variety
```javascript
transition: ["fade", "slide-left", "slide-right", "slide-up", "slide-down", "zoom"]
```

Available transition effects:
- `fade` - Smooth fade-in effect
- `slide-left` - Slides in from the right side
- `slide-right` - Slides in from the left side
- `slide-up` - Slides in from the bottom
- `slide-down` - Slides in from the top
- `zoom` - Zooms in from a smaller size

## Notes

### Transferring files to your MagicMirror

Here are a few ways to upload photos to your MagicMirror:

#### A) Direct copy

Copy files directly to your MagicMirror system, for example, using a USB drive or downloading files from the web.

#### B) NFS

Sync files using NFS. Configure a mounting point in /etc/fstab:

```
192.xxx.2.xxx:/nfs/Public /home/pi/cloud/modules/MMM-Random-local-image/nfs_image_cloud nfs ro,soft,bg,intr,x-systemd.automount 0   0
```

For detailed instructions, refer to the [Raspberry Pi NFS Client guide](https://pimylifeup.com/raspberry-pi-nfs-client/).
