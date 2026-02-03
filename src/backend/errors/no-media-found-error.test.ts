import { describe, expect, it } from "vitest";
import { NoMediaFoundError } from "./no-media-found-error";

describe("NoMediaFoundError", () => {
  describe("when backupDir is NOT configured", () => {
    it("should create error with only photoDir", () => {
      const error = new NoMediaFoundError("/path/to/photos");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("NoMediaFoundError");
      expect(error.photoDir).toBe("/path/to/photos");
      expect(error.backupDir).toBeUndefined();
      expect(error.message).toContain("/path/to/photos");
      expect(error.message).not.toContain("backupDir");
    });

    it("should use 'No Media Found' title", () => {
      const error = new NoMediaFoundError("/photos");

      expect(error.title).toBe("No Media Found");
    });

    it("should have proper stack trace", () => {
      const error = new NoMediaFoundError("/path/to/photos");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("NoMediaFoundError");
    });

    it("should generate error image", async () => {
      const error = new NoMediaFoundError("/path/to/photos");
      const image = await error.generateErrorImage();

      expect(image).toMatch(/^data:image\/png;base64,/);
      expect(image.length).toBeGreaterThan(100);
    });

    it("should include context information", () => {
      const error = new NoMediaFoundError("/photos");

      expect(error.context).toBeDefined();
      expect(error.context?.photoDir).toBe("/photos");
      expect(error.context?.backupDir).toBeUndefined();
    });

    it("should provide proper display message", () => {
      const error = new NoMediaFoundError("/photos");
      const displayMessage = error.getDisplayMessage();

      expect(displayMessage).toBe("No media files found in configured directories");
    });

    it("should show only photoDir in error details", () => {
      const error = new NoMediaFoundError("/photos");
      const details = error.getErrorDetails();

      expect(details).toHaveLength(2);
      expect(details[0]).toContain("Photo Dir:");
      expect(details[1]).toBe("Backup Dir: Not configured");
    });

    it("should provide helpful text about configuring backup", () => {
      const error = new NoMediaFoundError("/photos");
      const helpText = error.getHelpText();

      expect(helpText).toContain("configure a backup directory");
    });
  });

  describe("when backupDir is configured", () => {
    it("should create error with photoDir and backupDir", () => {
      const error = new NoMediaFoundError("/path/to/photos", "/path/to/backup");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("NoMediaFoundError");
      expect(error.title).toBe("Backup Directory Not Found");
      expect(error.photoDir).toBe("/path/to/photos");
      expect(error.backupDir).toBe("/path/to/backup");
      expect(error.message).toContain("/path/to/photos");
      expect(error.message).toContain("/path/to/backup");
    });

    it("should have proper stack trace", () => {
      const error = new NoMediaFoundError("/path/to/photos", "/backup");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("NoMediaFoundError");
    });

    it("should generate error image", async () => {
      const error = new NoMediaFoundError("/path/to/photos", "/path/to/backup");
      const image = await error.generateErrorImage();

      expect(image).toMatch(/^data:image\/png;base64,/);
      expect(image.length).toBeGreaterThan(100);
    });

    it("should include context information", () => {
      const error = new NoMediaFoundError("/photos", "/backup");

      expect(error.context).toBeDefined();
      expect(error.context?.photoDir).toBe("/photos");
      expect(error.context?.backupDir).toBe("/backup");
    });

    it("should provide proper display message", () => {
      const error = new NoMediaFoundError("/photos", "/backup");
      const displayMessage = error.getDisplayMessage();

      expect(displayMessage).toBe("No media files found in configured directories");
    });

    it("should provide error details with both directories", () => {
      const error = new NoMediaFoundError("/photos", "/backup");
      const details = error.getErrorDetails();

      expect(details).toHaveLength(2);
      expect(details[0]).toContain("Photo Dir:");
      expect(details[1]).toContain("Backup Dir:");
    });

    it("should provide helpful text", () => {
      const error = new NoMediaFoundError("/photos", "/backup");
      const helpText = error.getHelpText();

      expect(helpText).toContain("photo directory or backup directory");
      expect(helpText).not.toContain("configure");
    });
  });
});
