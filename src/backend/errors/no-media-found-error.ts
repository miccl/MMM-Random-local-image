import { BackendError } from "../backend-error";
import { truncatePath } from "../path";

/**
 * Error thrown when no media files are found in any configured directories.
 */
export class NoMediaFoundError extends BackendError {
  public readonly photoDir: string;
  public readonly backupDir?: string;

  constructor(photoDir: string, backupDir?: string) {
    super(
      backupDir ? "Backup Directory Not Found" : "No Media Found",
      backupDir
        ? `No media files found in photoDir (${photoDir}) and backupDir (${backupDir})`
        : `No media files found in photoDir (${photoDir})`,
      { photoDir, backupDir },
    );
    this.photoDir = photoDir;
    this.backupDir = backupDir;
  }

  getDisplayMessage(): string {
    return "No media files found in configured directories";
  }

  getErrorDetails(): string[] {
    return [
      `Photo Dir: ${truncatePath(this.photoDir)}`,
      this.backupDir
        ? `Backup Dir: ${truncatePath(this.backupDir)}`
        : "Backup Dir: Not configured",
    ];
  }

  getHelpText(): string {
    return this.backupDir
      ? "Add media files to the photo directory or backup directory"
      : "Add media files to the photo directory or configure a backup directory";
  }
}
