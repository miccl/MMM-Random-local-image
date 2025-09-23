/** @jest-environment jsdom */

// Import Jest globals for linting and editor support
/* global beforeAll, describe, test, expect, jest */

global.Module = {
  register: (name, module) => {
    global.MMModule = module;
  },
};

global.Log = {
  info: () => {},
  debug: () => {},
  error: () => {},
};

// Make shuffle globally available for tests
const { shuffle } = require("./MMM-Random-local-image.js");
global.shuffle = shuffle;

describe("MMM-Random-local-image", () => {
  beforeAll(() => {
    delete require.cache[require.resolve("./MMM-Random-local-image.js")];
    require("./MMM-Random-local-image.js");
  });

  test("should set error if photoDir is missing", () => {
    const mod = Object.create(global.MMModule);
    mod.config = {};
    mod.error = null;
    mod.start();
    expect(mod.error).toBe("Missing required parameter 'photoDir'");
  });

  test("should call sendSocketNotification on loadImages", () => {
    const mod = Object.create(global.MMModule);
    mod.config = { photoDir: "foo" };
    const spy = jest.fn();
    mod.sendSocketNotification = spy;
    mod.loadImages();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe("RANDOM_IMAGES_GET");
  });

  test("should shuffle images if randomOrder is true", () => {
    const mod = Object.create(global.MMModule);
    mod.config = { randomOrder: true };
    mod.images = [1, 2, 3];
    const shuffled = global.shuffle([1, 2, 3]);
    expect(shuffled).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  test("should return a wrapper with error if error is set", () => {
    const mod = Object.create(global.MMModule);
    mod.error = "Some error";
    mod.translate = (x) => x;
    const wrapper = mod.getDom();
    expect(wrapper.innerHTML).toBe("Some error");
  });
});
