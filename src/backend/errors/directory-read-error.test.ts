import { describe, expect, it } from "vitest";
import type { NodeJsError } from "../../frontend/node-js-error";
import { DirectoryReadError } from "./directory-read-error";

describe("DirectoryReadError", () => {
  it("should create error with directory and original error", () => {
    const originalError = new Error("ENOENT: no such file or directory");
    (originalError as NodeJsError).code = "ENOENT";
    const error = new DirectoryReadError("/path/to/dir", originalError);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("DirectoryReadError");
    expect(error.title).toBe("Directory Read Failed");
    expect(error.directory).toBe("/path/to/dir");
    expect(error.originalError).toBe(originalError);
    expect(error.message).toContain("/path/to/dir");
  });

  it("should provide helpful text for ENOENT error", () => {
    const originalError = new Error("ENOENT");
    (originalError as NodeJsError).code = "ENOENT";
    const error = new DirectoryReadError("/path", originalError);

    const helpText = error.getHelpText();
    expect(helpText).toBe("Directory does not exist");
  });

  it("should provide helpful text for EACCES error", () => {
    const originalError = new Error("EACCES");
    (originalError as NodeJsError).code = "EACCES";
    const error = new DirectoryReadError("/path", originalError);

    const helpText = error.getHelpText();
    expect(helpText).toBe("Permission denied - check directory permissions");
  });

  it("should provide generic help text for unknown error codes", () => {
    const originalError = new Error("Unknown error");
    const error = new DirectoryReadError("/path", originalError);

    const helpText = error.getHelpText();
    expect(helpText).toBe("Please check directory path and permissions");
  });

  it("should include error code in context", () => {
    const originalError = new Error("Test");
    (originalError as NodeJsError).code = "EACCES";
    const error = new DirectoryReadError("/path", originalError);

    expect(error.context?.errorCode).toBe("EACCES");
  });

  it("should generate error image", async () => {
    const originalError = new Error("ENOENT");
    (originalError as NodeJsError).code = "ENOENT";
    const error = new DirectoryReadError("/path/to/dir", originalError);

    const image = await error.generateErrorImage();
    expect(image).toMatch(/^data:image\/png;base64,/);
  });

  it("should provide appropriate display message for ENOENT", () => {
    const originalError = new Error("ENOENT");
    (originalError as NodeJsError).code = "ENOENT";
    const error = new DirectoryReadError("/path", originalError);

    const displayMessage = error.getDisplayMessage();
    expect(displayMessage).toBe("Directory does not exist");
  });

  it("should provide appropriate display message for EACCES", () => {
    const originalError = new Error("EACCES");
    (originalError as NodeJsError).code = "EACCES";
    const error = new DirectoryReadError("/path", originalError);

    const displayMessage = error.getDisplayMessage();
    expect(displayMessage).toBe("Permission denied");
  });

  it("should provide generic display message for unknown errors", () => {
    const originalError = new Error("Unknown");
    const error = new DirectoryReadError("/path", originalError);

    const displayMessage = error.getDisplayMessage();
    expect(displayMessage).toBe("Failed to read directory");
  });

  it("should include error details with directory and error code", () => {
    const originalError = new Error("Test");
    (originalError as NodeJsError).code = "ENOENT";
    const error = new DirectoryReadError(
      "/very/long/path/to/dir",
      originalError,
    );

    const details = error.getErrorDetails();
    expect(details).toHaveLength(2);
    expect(details[0]).toContain("Directory:");
    expect(details[1]).toContain("Error Code: ENOENT");
  });

  it("should show error message when no error code is available", () => {
    const originalError = new Error("Some filesystem error");
    const error = new DirectoryReadError("/path", originalError);

    const details = error.getErrorDetails();
    expect(details[1]).toContain("Error:");
    expect(details[1]).toContain("Some filesystem error");
  });
});
