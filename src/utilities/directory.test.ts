import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import { vol } from "memfs";
import {
  getDirByPath,
  getSubDirectories,
  hasMediaFilesInDirectory,
} from "./directory";
import { ModulConfig } from "../types/config";

const baseConfig = {
  photoDir: "/base",
  selectFromSubdirectories: false,
  ignoreVideos: true,
  ignoreDirRegex: "",
} as ModulConfig;

describe("directory utilities (memfs)", () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getDirByPath", () => {
    describe("given selectFromSubdirectories=false", () => {
      it("returns baseDir when directory has media", () => {
        createFiles("/base/photo.jpg");
        const config = { ...baseConfig, selectFromSubdirectories: false };

        const result = getDirByPath(config);
        expect(result).toBe(config.photoDir);
      });

      it("returns null when directory has no media", () => {
        createFiles("/base/notes.txt");
        const config = { ...baseConfig, selectFromSubdirectories: false };

        const result = getDirByPath(config);
        expect(result).toBeNull();
      });
    });

    describe("given selectFromSubdirectories=true", () => {
      it("returns null when subdirectories array is empty and logs an error", () => {
        createFiles("/base/file.txt");
        const config = {
          ...baseConfig,
          selectFromSubdirectories: true,
          ignoreDirRegex: "^$",
        };

        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        const result = getDirByPath(config);
        expect(result).toBeNull();
        expect(spy).toHaveBeenCalled();
      });

      it("returns null when getting subdirectories throws and logs a message", () => {
        const config = {
          ...baseConfig,
          selectFromSubdirectories: true,
          ignoreDirRegex: "^$",
        };

        const spy = vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(fs, "readdirSync").mockImplementation(() => {
          throw new Error("boom");
        });

        const result = getDirByPath(config);
        expect(result).toBeNull();
        expect(spy).toHaveBeenCalled();
      });

      it("selects a random subdirectory that contains media", () => {
        createFiles("/base/dir1/notes.txt", "/base/dir2/photo.jpg");
        const config = {
          ...baseConfig,
          selectFromSubdirectories: true,
          ignoreDirRegex: "^$",
        };

        const mathSpy = vi.spyOn(Math, "random");
        mathSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);

        const result = getDirByPath(config);
        expect(result === "/base/dir2").toBe(true);
      });

      it("returns null when no non-empty subdirectory is found after retries", () => {
        createFiles("/base/dir1/notes.txt", "/base/dir2/notes.txt");
        const config = {
          ...baseConfig,
          selectFromSubdirectories: true,
          ignoreDirRegex: "^$",
        };

        const result = getDirByPath(config);
        expect(result).toBeNull();
      });
    });
  });

  describe("getSubDirectories", () => {
    it("returns only directories and filters those matching ignoreDirRegex", () => {
      createFiles(
        "/base/dirA/file.jpg",
        "/base/ignoreMe/file.jpg",
        "/base/file.txt",
      );

      const dirs = getSubDirectories("/base", /ignore/);
      expect(dirs).toEqual(["dirA"]);
    });
  });

  describe("hasMediaFilesInDirectory", () => {
    it("returns true when a media file is found", () => {
      createFiles("/some/dir/notes.txt", "/some/dir/photo.jpg");

      const result = hasMediaFilesInDirectory("/some/dir", baseConfig);
      expect(result).toBe(true);
    });

    it("returns false when no media files are present", () => {
      createFiles("/empty/dir/notes.txt", "/empty/dir/doc.pdf");

      const result = hasMediaFilesInDirectory("/empty/dir", baseConfig);
      expect(result).toBe(false);
    });

    it("returns false and does not log error for ENOENT", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = hasMediaFilesInDirectory("/missing/dir", baseConfig);
      expect(result).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    });

    it("returns false and logs error for unexpected errors", () => {
      const spy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mock = vi.spyOn(fs, "opendirSync").mockImplementation(() => {
        const err: any = new Error("EACCESS example message");
        err.code = "EACCES";
        throw err;
      });

      const result = hasMediaFilesInDirectory("/restricted/dir", baseConfig);
      expect(result).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });
});

function createFiles(...files: string[]) {
  const structure: Record<string, string> = {};
  for (const file of files) {
    structure[file] = "x";
  }
  vol.fromJSON(structure, "/");
}
