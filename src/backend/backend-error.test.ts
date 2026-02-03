import { describe, expect, it } from "vitest";
import { isBackendError } from "./backend-error";
import {
  DirectoryReadError,
  NoMediaFilesError,
  NoMediaFoundError,
} from "./errors";

describe("BackendError Base Class", () => {
  it("should generate error image with consistent format", async () => {
    const error = new NoMediaFoundError("/path/to/photos");
    const image = await error.generateErrorImage();

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should be identifiable via isBackendError", () => {
    const error = new NoMediaFoundError("/path");
    const regularError = new Error("regular error");

    expect(isBackendError(error)).toBe(true);
    expect(isBackendError(regularError)).toBe(false);
    expect(isBackendError(null)).toBe(false);
    expect(isBackendError(undefined)).toBe(false);
  });
});

describe("Error Image Generation", () => {
  it("should escape XML in paths", async () => {
    const error = new NoMediaFoundError(
      "/path/with<special>&chars",
      "/backup/with\"quotes'",
    );

    // Should not throw due to invalid XML
    const image = await error.generateErrorImage();
    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should handle long error messages by truncating", async () => {
    const longPath =
      "/very/long/path/that/exceeds/sixty/characters/and/should/be/truncated/properly";
    const error = new NoMediaFilesError(longPath, false);

    const image = await error.generateErrorImage();
    expect(image).toMatch(/^data:image\/png;base64,/);
  });

  it("should generate different images for different error types", async () => {
    const error1 = new NoMediaFoundError("/path1");
    const error2 = new DirectoryReadError("/path2", new Error("Test"));
    const error3 = new NoMediaFilesError("/path3", true);

    const image1 = await error1.generateErrorImage();
    const image2 = await error2.generateErrorImage();
    const image3 = await error3.generateErrorImage();

    // All should be valid images
    expect(image1).toMatch(/^data:image\/png;base64,/);
    expect(image2).toMatch(/^data:image\/png;base64,/);
    expect(image3).toMatch(/^data:image\/png;base64,/);

    // But they should be different (different titles/details)
    expect(image1).not.toBe(image2);
    expect(image2).not.toBe(image3);
    expect(image1).not.toBe(image3);
  });
});
