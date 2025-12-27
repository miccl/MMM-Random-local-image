import { describe, expect, it } from "vitest";
import { isImageOrVideo } from "./file";

describe("isImageOrVideo", () => {
  it("returns false when mime type cannot be determined", () => {
    const result = isImageOrVideo("file.unknownext", { ignoreVideos: true });
    expect(result).toEqual(false);
  });

  describe("when ignoreVideos=false", () => {
    const config = { ignoreVideos: false };

    it("returns true for image files", () => {
      const result = isImageOrVideo("photo.jpg", config);
      expect(result).toEqual(true);
    });

    it("returns true for video files when videos are not ignored", () => {
      const result = isImageOrVideo("video.mp4", config);
      expect(result).toEqual(true);
    });
  });

  describe("when ignoreVideos=true", () => {
    const config = { ignoreVideos: true };

    it("returns true for image files even when videos are ignored", () => {
      const result = isImageOrVideo("photo.jpg", config);
      expect(result).toEqual(true);
    });

    it("returns false for video files when videos are ignored", () => {
      const result = isImageOrVideo("video.mp4", config);
      expect(result).toEqual(false);
    });
  });
});
