import type fs from "node:fs";
import { describe, expect, it } from "vitest";
import { getFileDate, isImageOrVideo } from "./file";

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

describe("getFileDate", () => {
  it("returns birthtime when it is valid and not Unix epoch", () => {
    const validBirthtime = new Date("2023-06-15T10:30:00Z");
    const mtime = new Date("2023-12-20T14:45:00Z");

    const mockStats = {
      birthtime: validBirthtime,
      mtime: mtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(validBirthtime);
  });

  it("returns mtime when birthtime is Unix epoch (time 0)", () => {
    const epochBirthtime = new Date(0); // Jan 1, 1970 00:00:00
    const mtime = new Date("2023-12-20T14:45:00Z");

    const mockStats = {
      birthtime: epochBirthtime,
      mtime: mtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(mtime);
  });

  it("returns mtime when birthtime year is 1970", () => {
    const birthtime1970 = new Date("1970-01-01T12:00:00Z");
    const mtime = new Date("2023-12-20T14:45:00Z");

    const mockStats = {
      birthtime: birthtime1970,
      mtime: mtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(mtime);
  });

  it("returns mtime when birthtime is another date in 1970", () => {
    const birthtime1970 = new Date("1970-06-15T08:30:00Z");
    const mtime = new Date("2024-01-10T09:15:00Z");

    const mockStats = {
      birthtime: birthtime1970,
      mtime: mtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(mtime);
  });

  it("returns birthtime for dates close to epoch but not in 1970", () => {
    const validBirthtime = new Date("1971-01-01T00:00:00Z");
    const mtime = new Date("2023-12-20T14:45:00Z");

    const mockStats = {
      birthtime: validBirthtime,
      mtime: mtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(validBirthtime);
  });

  it("handles very recent files with valid birthtime", () => {
    const recentBirthtime = new Date("2025-02-01T18:00:00Z");
    const recentMtime = new Date("2025-02-01T18:05:00Z");

    const mockStats = {
      birthtime: recentBirthtime,
      mtime: recentMtime,
    } as fs.Stats;

    const result = getFileDate(mockStats);

    expect(result).toEqual(recentBirthtime);
  });
});
