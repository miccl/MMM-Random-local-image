This folder is used to show an error image to the user of this module.
This happens when the photoDir (and backupDir) don't include any  media files.

The image is created with image magick.

```shell
magick -size 600x400 xc:white \
       -font Arial -pointsize 32 -fill black -gravity center \
       -size 600x \
       caption:@errorMessage.txt \
       -composite media_load_error.png
```
