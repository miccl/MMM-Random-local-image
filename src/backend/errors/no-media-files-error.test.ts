import { describe, expect, it } from "vitest";
import { NoMediaFilesError } from "./no-media-files-error";

describe("NoMediaFilesError", () => {
  it("should create error for empty directory", () => {
    const error = new NoMediaFilesError("/path/to/empty", true);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("NoMediaFilesError");
    expect(error.title).toBe("No Media Files Found");
    expect(error.directory).toBe("/path/to/empty");
    expect(error.ignoreVideos).toBe(true);
  });

  it("should customize message based on ignoreVideos setting - images only", () => {
    const error = new NoMediaFilesError("/path", true);

    expect(error.message).toContain("images");
    expect(error.message).not.toContain("videos");
  });

  it("should customize message based on ignoreVideos setting - images and videos", () => {
    const error = new NoMediaFilesError("/path", false);

    expect(error.message).toContain("images or videos");
  });

  it("should provide helpful text when ignoreVideos is true", () => {
    const error = new NoMediaFilesError("/path", true);

    const helpText = error.getHelpText();
    expect(helpText).toContain("ignoreVideos: false");
  });

  it("should provide helpful text when ignoreVideos is false", () => {
    const error = new NoMediaFilesError("/path", false);

    const helpText = error.getHelpText();
    expect(helpText).toBe("No media files found. Check directory contents");
  });

  it("should include context information", () => {
    const error = new NoMediaFilesError("/empty/dir", true);

    expect(error.context?.directory).toBe("/empty/dir");
    expect(error.context?.ignoreVideos).toBe(true);
  });

  it("should generate error image", async () => {
    const error = new NoMediaFilesError("/path/to/empty", false);

    const image = await error.generateErrorImage();
    expect(image).toMatch(/^data:image\/png;base64,/);
  });

  it("should provide appropriate display message when ignoreVideos is true", () => {
    const error = new NoMediaFilesError("/path", true);
    const displayMessage = error.getDisplayMessage();

    expect(displayMessage).toBe("No image files found in directory");
  });

  it("should provide appropriate display message when ignoreVideos is false", () => {
    const error = new NoMediaFilesError("/path", false);
    const displayMessage = error.getDisplayMessage();

    expect(displayMessage).toBe("No media files found in directory");
  });

  it("should include error details with directory and media type", () => {
    const error = new NoMediaFilesError("/some/path", true);
    const details = error.getErrorDetails();

    expect(details).toHaveLength(2);
    expect(details[0]).toContain("Directory:");
    expect(details[1]).toBe("Looking for: Images only");
  });

  it("should show 'Images and Videos' when ignoreVideos is false", () => {
    const error = new NoMediaFilesError("/some/path", false);
    const details = error.getErrorDetails();

    expect(details[1]).toBe("Looking for: Images and Videos");
  });
});
