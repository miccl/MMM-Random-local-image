# Changelog

All notable changes to MMM-Random-local-image module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.4.0] - Unreleased

### Added

- Add option for a backup dir to display media when `photoDir` has no files or is unreadable.
- Will show error images directly on the mirror when the app runs into an error.
- Added tests
- Replaced ESLint + Prettier with Biome

### Changed

- Using more sensitive default values
  - `showAdditionalInformations` to false (in regards to issue #10)
  - `ignoreVideos` to true (prevents unintented huge videos to be loaded)
- Improve filtering of files which should improve performance
- Rewrote code to typescript using Rollup (following the [guide from Matt Gerega](https://www.mattgerega.com/2023/08/23/taking-my-magicmirror-modules-to-typescript/))

### Fixed

- Prevent crash when enumerating subdirectories in getPhotoDir
- Improve hasFilesInDirectory robustness by handling ENOENT gracefully and logging other filesystem errors

## [1.3.0] - 2025-10-23

### Added

- Display file creation date with configurable format
- New template-based approach for displaying additional information
  - Added `infoTemplate` option with support for placeholders:
    - `{{date}}` - The creation date of the media file (formatted according to `dateFormat`)
    - `{{currentCount}}` - The current position in the media sequence
    - `{{totalCount}}` - The total number of media files
  - Configurable date format with `dateFormat` option (YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY)

### Fixed

- ignore files with unknown mime type (previously threw an error)

## [1.2.0] - 2025-05-31

### Added

- Display of the number of files already shown and the total number of files in the directory

### Changed

- Improve loading files (loading and sending files in chunk to decrease initial loading delay, especially for many files)
- Set the default value of `showAdditionalInformation` to true
- Moved changelog from README.md into CHANGELOG.md

## [1.1.0] - 2025-02-07

### Added

- Support for video files alongside images
- New `ignoreVideos` configuration option to disable video support
- MIME type detection for media files

## [1.0.1] - 2024-12-15

### Fixed

- Fix initial loading bug (PR https://github.com/miccl/MMM-Random-local-image/pull/9)
- Improve directory traversal stability

## [1.0.0] - Initial Release

### Added

- Basic image display functionality
- Random image selection from specified directory
- Configurable photo update interval
- Support for subdirectories
- Random order option
- Directory filtering with regex
- Initial delay configuration
- Automatic image reload functionality
- Additional information display option with `showAdditionalInformation` config
