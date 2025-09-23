/** @jest-environment node */

// Mock node_helper for MagicMirror compatibility
jest.mock("node_helper", () => ({
  create: (obj) => obj,
}));

const path = require("path");
const mime = require("mime-types");
const nodeHelper = require("./node_helper.js");

// Mock dependencies
jest.mock("recursive-readdir", () => jest.fn());
const recursive = require("recursive-readdir");

describe("node_helper.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getPhotoDir returns baseDir if selectFromSubdirectories is false", () => {
    const payload = { photoDir: "/foo/bar", selectFromSubdirectories: false };
    const result = nodeHelper.getPhotoDir(nodeHelper, payload);
    expect(result).toBe("/foo/bar");
  });

  test("getPhotoDir returns random subdirectory if selectFromSubdirectories is true", () => {
    const payload = {
      photoDir: "/foo/bar",
      selectFromSubdirectories: true,
      ignoreDirRegex: "a^",
    };
    // Mock getSubDirectories
    const subdirs = ["sub1", "sub2", "sub3"];
    nodeHelper.getSubDirectories = jest.fn(() => subdirs);
    const result = nodeHelper.getPhotoDir(nodeHelper, payload);
    expect(result.startsWith("/foo/bar/")).toBe(true);
    expect(subdirs.some((d) => result.endsWith(d))).toBe(true);
  });

  test("getSubDirectories filters directories by ignoreDirRegex", () => {
    // Setup test directory
    const testDir = path.join(__dirname, "exampleImages");
    const dirs = nodeHelper.getSubDirectories(testDir, "^hacker");
    expect(Array.isArray(dirs)).toBe(true);
    expect(dirs.every((d) => !/^hacker/.test(d))).toBe(true);
  });

  test("detectMediaFile returns image mime type", () => {
    const filePath = path.join(__dirname, "exampleImages/code_quality.jpg");
    const options = { ignoreVideos: false };
    const result = require("./node_helper.js").__get__("detectMediaFile")(filePath, options);
    expect(result).toBe(mime.lookup(filePath));
  });

  test("detectMediaFile returns video mime type if ignoreVideos is false", () => {
    const filePath = path.join(__dirname, "exampleImages/demo.mp4");
    const options = { ignoreVideos: false };
    const result = require("./node_helper.js").__get__("detectMediaFile")(filePath, options);
    expect(result).toBe(mime.lookup(filePath));
  });

  test("detectMediaFile returns null for video if ignoreVideos is true", () => {
    const filePath = path.join(__dirname, "exampleImages/demo.mp4");
    const options = { ignoreVideos: true };
    const result = require("./node_helper.js").__get__("detectMediaFile")(filePath, options);
    expect(result).toBeNull();
  });

  test("getImages sends correct notifications in chunks", (done) => {
    const fakeFiles = ["/foo/bar/img1.jpg", "/foo/bar/img2.jpg", "/foo/bar/img3.jpg"];
    recursive.mockImplementation((dir, cb) => cb(null, fakeFiles));
    const mockSelf = {
      getPhotoDir: jest.fn(() => "/foo/bar"),
      sendSocketNotification: jest.fn(),
    };
    const options = {};
    nodeHelper.getImages(mockSelf, options);
    setTimeout(() => {
      expect(mockSelf.sendSocketNotification).toHaveBeenCalled();
      expect(mockSelf.sendSocketNotification.mock.calls[0][0]).toBe("RANDOM_IMAGES_CHUNK");
      done();
    }, 10);
  });
});
