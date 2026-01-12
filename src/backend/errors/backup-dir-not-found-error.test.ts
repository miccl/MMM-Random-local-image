import { describe, expect, it } from "vitest";
import { BackupDirNotFoundError } from "./backup-dir-not-found-error";

describe("BackupDirNotFoundError", () => {
  it("should create error with photoDir and backupDir", () => {
    const error = new BackupDirNotFoundError(
      "/path/to/photos",
      "/path/to/backup",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("BackupDirNotFoundError");
    expect(error.title).toBe("Backup Directory Not Found");
    expect(error.photoDir).toBe("/path/to/photos");
    expect(error.backupDir).toBe("/path/to/backup");
    expect(error.message).toContain("/path/to/photos");
    expect(error.message).toContain("/path/to/backup");
  });

  it("should create error with only photoDir when backupDir is undefined", () => {
    const error = new BackupDirNotFoundError("/path/to/photos");

    expect(error.photoDir).toBe("/path/to/photos");
    expect(error.backupDir).toBeUndefined();
    expect(error.message).toContain("/path/to/photos");
    expect(error.message).toContain("no backupDir configured");
  });

  it("should have proper stack trace", () => {
    const error = new BackupDirNotFoundError("/path/to/photos");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("BackupDirNotFoundError");
  });

  it("should generate error image", async () => {
    const error = new BackupDirNotFoundError(
      "/path/to/photos",
      "/path/to/backup",
    );
    const image = await error.generateErrorImage();

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should include context information", () => {
    const error = new BackupDirNotFoundError("/photos", "/backup");

    expect(error.context).toBeDefined();
    expect(error.context?.photoDir).toBe("/photos");
    expect(error.context?.backupDir).toBe("/backup");
  });

  it("should provide proper display message", () => {
    const error = new BackupDirNotFoundError("/photos", "/backup");
    const displayMessage = error["getDisplayMessage"]();

    expect(displayMessage).toBe(
      "No media files found in configured directories",
    );
  });

  it("should provide error details with both directories", () => {
    const error = new BackupDirNotFoundError("/photos", "/backup");
    const details = error.getErrorDetails();

    expect(details).toHaveLength(2);
    expect(details[0]).toContain("Photo Dir:");
    expect(details[1]).toContain("Backup Dir:");
  });

  it("should show 'Not configured' when backupDir is undefined", () => {
    const error = new BackupDirNotFoundError("/photos");
    const details = error.getErrorDetails();

    expect(details[1]).toBe("Backup Dir: Not configured");
  });
});
