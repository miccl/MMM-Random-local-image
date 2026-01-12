import { BackendError } from "../backend-error";
import { truncatePath } from "../utils/path";
import type { NodeJsError } from "./node-js-error";

/**
 * Error thrown when directory reading fails (e.g., permissions, doesn't exist).
 */
export class DirectoryReadError extends BackendError {
  public readonly directory: string;
  public readonly originalError: Error;

  constructor(directory: string, originalError: Error) {
    const nodeError = originalError as NodeJsError;
    super(
      "Directory Read Failed",
      `Failed to read directory: ${directory}. ${originalError.message}`,
      { directory, errorCode: nodeError.code },
    );
    this.directory = directory;
    this.originalError = originalError;
  }

  protected getDisplayMessage(): string {
    const code = (this.originalError as NodeJsError).code;
    if (code === "ENOENT") return "Directory does not exist";
    if (code === "EACCES") return "Permission denied";
    return "Failed to read directory";
  }

  getErrorDetails(): string[] {
    const code = (this.originalError as NodeJsError).code;
    return [
      `Directory: ${truncatePath(this.directory)}`,
      code ? `Error Code: ${code}` : `Error: ${this.originalError.message}`,
    ];
  }

  getHelpText(): string {
    const code = (this.originalError as NodeJsError).code;
    if (code === "ENOENT") return "Directory does not exist";
    if (code === "EACCES")
      return "Permission denied - check directory permissions";
    return "Please check directory path and permissions";
  }
}
