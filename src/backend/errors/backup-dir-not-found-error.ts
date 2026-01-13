import { BackendError } from "../backend-error";
import { truncatePath } from "../path";

/**
 * Error thrown when the backup directory cannot be found or has no media files.
 */
export class BackupDirNotFoundError extends BackendError {
  public readonly photoDir: string;
  public readonly backupDir?: string;

  constructor(photoDir: string, backupDir?: string) {
    super(
      "Backup Directory Not Found",
      backupDir
        ? `No media files found in photoDir (${photoDir}) and backupDir (${backupDir})`
        : `No media files found in photoDir (${photoDir}) and no backupDir configured`,
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
}
