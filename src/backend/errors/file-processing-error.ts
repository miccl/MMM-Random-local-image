import { BackendError } from "../backend-error";
import { truncatePath } from "../path";

/**
 * Error thrown when a specific file cannot be processed.
 */
export class FileProcessingError extends BackendError {
  public readonly filePath: string;

  constructor(filePath: string, reason: string) {
    super(
      "File Processing Failed",
      `Failed to process file: ${filePath}. ${reason}`,
      { filePath },
    );
    this.filePath = filePath;
  }

  protected getDisplayMessage(): string {
    return "Failed to process file";
  }

  getErrorDetails(): string[] {
    return [`File: ${truncatePath(this.filePath)}`];
  }
}
