/**
 * Barrel export file for all error types.
 * This allows importing all errors from a single location.
 */

export {
  BackendError,
  isBackendError,
  truncatePath,
} from "../backend-error";
export { BackupDirNotFoundError } from "./backup-dir-not-found-error";
export { DirectoryReadError } from "./directory-read-error";
export { FileProcessingError } from "./file-processing-error";
export { NoMediaFilesError } from "./no-media-files-error";
export type { NodeJsError } from "../../frontend/node-js-error";
