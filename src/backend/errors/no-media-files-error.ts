import { BackendError } from "../backend-error";
import { truncatePath } from "../path";

/**
 * Error thrown when a directory exists but contains no media files.
 */
export class NoMediaFilesError extends BackendError {
  public readonly directory: string;
  public readonly ignoreVideos: boolean;

  constructor(directory: string, ignoreVideos: boolean) {
    super(
      "No Media Files Found",
      `Directory ${directory} contains no ${ignoreVideos ? "images" : "images or videos"}`,
      { directory, ignoreVideos },
    );
    this.directory = directory;
    this.ignoreVideos = ignoreVideos;
  }

  getDisplayMessage(): string {
    return this.ignoreVideos
      ? "No image files found in directory"
      : "No media files found in directory";
  }

  getErrorDetails(): string[] {
    return [
      `Directory: ${truncatePath(this.directory)}`,
      `Looking for: ${this.ignoreVideos ? "Images only" : "Images and Videos"}`,
    ];
  }

  getHelpText(): string {
    return this.ignoreVideos
      ? "No image files found. Try setting ignoreVideos: false"
      : "No media files found. Check directory contents";
  }
}
