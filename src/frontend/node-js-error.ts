/**
 * Extended Error interface for Node.js filesystem errors.
 *
 * Node.js adds additional properties to Error objects for filesystem operations:
 * - code: Error code like 'ENOENT', 'EACCES', 'EISDIR', etc.
 * - errno: Numeric error code
 * - syscall: Name of the system call that failed
 * - path: The file path related to the error
 *
 * @see https://nodejs.org/api/errors.html#class-systemerror
 */
export interface NodeJsError extends Error {
  /**
   * String error code (e.g., 'ENOENT', 'EACCES', 'EISDIR')
   */
  code?: string;

  /**
   * Numeric error code
   */
  errno?: number;

  /**
   * Name of the system call that triggered the error
   */
  syscall?: string;

  /**
   * File path that caused the error (if applicable)
   */
  path?: string;
}
