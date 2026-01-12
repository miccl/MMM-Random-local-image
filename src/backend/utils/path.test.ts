import { describe, expect, it } from "vitest";
import { truncatePath } from "./path";

describe("truncatePath", () => {
  it("should not truncate short paths", () => {
    expect(truncatePath("/short/path")).toBe("/short/path");
    expect(truncatePath("./modules/photos")).toBe("./modules/photos");
  });

  it("should truncate long paths intelligently", () => {
    const longPath =
      "/home/pi/cloud/modules/MMM-Random-local-image/nfs_image_cloud";
    const result = truncatePath(longPath, 60);

    expect(result).toContain("...");
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toMatch(/^\/home\/pi\/.+cloud$/); // Starts with /home/pi, ends with cloud
  });

  it("should keep first 2 and last 2 path parts", () => {
    const path =
      "/home/pi/cloud/modules/MMM-Random-local-image/some/very/long/subdirectory/path/photos/file.jpg";
    const result = truncatePath(path);

    expect(result).toBe("/home/pi/.../photos/file.jpg");
  });

  it("should handle paths with few segments", () => {
    const path = "/a/b/c";
    const result = truncatePath(path);

    expect(result).toBe("/a/b/c"); // Too short to truncate meaningfully
  });

  it("should handle relative paths", () => {
    const path =
      "./modules/MMM-Random-local-image/very/long/path/structure/photos";
    const result = truncatePath(path);

    expect(result).toContain("...");
    expect(result).toContain("modules");
    expect(result).toContain("photos");
  });

  it("should handle Windows-style paths", () => {
    const path =
      "C:\\Users\\pi\\cloud\\modules\\MMM-Random-local-image\\very\\long\\windows\\path\\photos";
    const result = truncatePath(path);

    expect(result).toContain("...");
    expect(result).toContain("/"); // Should normalize to forward slashes
  });

  it("should truncate very long paths aggressively if needed", () => {
    const veryLongPath = "/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z";
    const result = truncatePath(veryLongPath, 30);

    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toContain("...");
  });
});
