import { describe, expect, it } from "vitest";
import { FileProcessingError } from "./file-processing-error";

describe("FileProcessingError", () => {
  it("should create error with file path and reason", () => {
    const error = new FileProcessingError(
      "/path/to/file.jpg",
      "Invalid MIME type",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("FileProcessingError");
    expect(error.title).toBe("File Processing Failed");
    expect(error.filePath).toBe("/path/to/file.jpg");
    expect(error.message).toContain("/path/to/file.jpg");
    expect(error.message).toContain("Invalid MIME type");
  });

  it("should include file path in context", () => {
    const error = new FileProcessingError("/file.jpg", "Corrupted");

    expect(error.context?.filePath).toBe("/file.jpg");
  });

  it("should generate error image", async () => {
    const error = new FileProcessingError("/file.jpg", "Test reason");

    const image = await error.generateErrorImage();
    expect(image).toMatch(/^data:image\/png;base64,/);
  });

  it("should provide appropriate display message", () => {
    const error = new FileProcessingError("/path/to/file.jpg", "Some reason");
    const displayMessage = error["getDisplayMessage"]();

    expect(displayMessage).toBe("Failed to process file");
  });

  it("should include error details with file path", () => {
    const error = new FileProcessingError(
      "/very/long/path/to/some/file.jpg",
      "Reason",
    );
    const details = error.getErrorDetails();

    expect(details).toHaveLength(1);
    expect(details[0]).toContain("File:");
  });

  it("should have proper stack trace", () => {
    const error = new FileProcessingError("/file.jpg", "Test");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("FileProcessingError");
  });
});
