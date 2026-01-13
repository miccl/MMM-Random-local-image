import { generateErrorImage } from "../utilities/error-image-generator";

/**
 * Base class for all media loading errors.
 * Includes built-in error image generation functionality.
 */
export abstract class BackendError extends Error {
  public readonly title: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    title: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.title = title;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Generates an error image as a base64-encoded PNG data URI
   * to be displayed when media loading fails.
   *
   * @returns Base64-encoded data URI string for the error image
   */
  async generateErrorImage(): Promise<string> {
    return generateErrorImage(
      this.title,
      this.getDisplayMessage(),
      this.getHelpText(),
      this.getErrorDetails(),
    );
  }

  /**
   * Returns an array of detail strings to display in the error image.
   * Subclasses should override to provide specific error context.
   */
  abstract getErrorDetails(): string[];

  /**
   * Returns help text to display at the bottom of the error image.
   * Subclasses can override to provide specific guidance.
   */
  getHelpText(): string {
    return "Please check your configuration";
  }

  /**
   * Returns a simplified message for display in error images.
   * This message should be concise and not include file paths.
   */
  abstract getDisplayMessage(): string;
}

/**
 * Type guard to check if an error is a MediaLoadError
 */
export function isBackendError(err: unknown): err is BackendError {
  return err instanceof BackendError;
}
