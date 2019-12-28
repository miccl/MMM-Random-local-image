# MagicMirror Module: MMM-Random-local-image
A MagicMirror Module to show random images from a local folder on the Mirror.

I for example mounted the images from a private cloud (which could be accessed as NFS).

## Screenshots

Displaying image with additional information (path to the file)

![Module example with additional information](demo-screenshot.png)

## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
git clone https://github.com/miccl/MMM-Random-localimage.git
cd MMM-Random-local-image
npm ci
````

Configure the module in the `config.js` file.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module : 'MMM-Random-local-image',
		position : 'fullscreen_below', 
		config : {
			// see config below
		}
	}
]
````

## Configuration options
The following properties can be configured:


| Option | Description |
|--------|-------------|
| `photoUpdateInterval` | How often a new photo is displayed <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 1 * 60 * 1000 (1 minute)|
| `photoLoadInitialDelay` | Initial delay of the image loading <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 1 * 1000 (1 second)|
| `photoLoadUpdateInterval` | Time between loading images <br><br> **Possible Values:** A positive number of milliseconds <br> **Default value:** 12 &* 60 * 60 * 1000 (every 12 hours)|
| `randomOrder` | Display images in random order <br><br> **Possible Values:** `true` or `false` <br> **Default value:** `true` |
| `opacity` | Opacity of the image <br><br> **Possible Values:** 0.0 to 1.0 <br> **Default value:** 1.0 |
| `photoDir` | Local path to your photos. root dir is Magic-Mirror root directory. <br><br> **Possible Values:** Local path <br> **Default value:** ./modules/MMM-Random-local-image/photos/ |
| `showAdditionalInfo` | Show image meta info. <br><br> **Possible Values:** `true` or `false` <br> **Default value:** `false` |
