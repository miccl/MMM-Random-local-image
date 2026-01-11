import { describe, expect, it } from "vitest";
import type { ImageInfoConfig } from "../types/config";
import { formatDate, processInfoTemplate } from "./info-template";

describe("processInfoTemplate", () => {
  it("replaces date, currentCount and totalCount placeholders", () => {
    const config: ImageInfoConfig = {
      infoTemplate: "Image {{currentCount}}/{{totalCount}} - {{date}}",
      dateFormat: "YYYY-MM-DD",
    };

    const result = processInfoTemplate(
      { creationDate: "2023-07-15" },
      { totalImagesCount: 10, currentImagesCount: 10 },
      config,
    );

    expect(result).toBe("Image 1/10 - 2023-07-15");
  });

  it.each([
    // [currentImagesCount, expectedCurrentCount]
    [5, "#1 of 5"],
    [4, "#2 of 5"],
    [3, "#3 of 5"],
    [2, "#4 of 5"],
    [1, "#5 of 5"],
  ])("computes currentCount correctly for currentImagesCount=%s", (currentImagesCount, expected) => {
    const infoTemplate: ImageInfoConfig = {
      infoTemplate: "#{{currentCount}} of {{totalCount}}",
      dateFormat: "YYYY-MM-DD",
    };

    expect(
      processInfoTemplate(
        { creationDate: "2023-06-15" },
        { totalImagesCount: 5, currentImagesCount },
        infoTemplate,
      ),
    ).toBe(expected);
  });

  it("replaces repeated placeholders globally", () => {
    const infoTemplate: ImageInfoConfig = {
      infoTemplate: "D: {{date}} | Again: {{date}}",
      dateFormat: "YYYY-MM-DD",
    };
    const result = processInfoTemplate(
      { creationDate: "2023-01-02" },
      { totalImagesCount: 3, currentImagesCount: 3 },
      infoTemplate,
    );

    expect(result).toBe("D: 2023-01-02 | Again: 2023-01-02");
  });

  it("returns template unchanged when it contains no placeholders", () => {
    const infoTemplate: ImageInfoConfig = {
      infoTemplate: "No placeholders here",
      dateFormat: "YYYY-MM-DD",
    };
    const result = processInfoTemplate(
      { creationDate: "2023-06-15" },
      { totalImagesCount: 10, currentImagesCount: 10 },
      infoTemplate,
    );

    expect(result).toBe("No placeholders here");
  });

  it("leaves unknown placeholders intact", () => {
    const result = processInfoTemplate(
      { creationDate: "2023-07-15" },
      { totalImagesCount: 2, currentImagesCount: 2 },
      { infoTemplate: "{{unknown}} - {{date}}", dateFormat: "YYYY-MM-DD" },
    );

    expect(result).toBe("{{unknown}} - 2023-07-15");
  });
});

describe("formatDate", () => {
  // Use a fixed date to avoid timezone surprises
  const date = new Date(2023, 6, 15);

  it("formats date as MM/DD/YYYY", () => {
    const result = formatDate(date, "MM/DD/YYYY");
    expect(result).toBe("07/15/2023");
  });

  it("formats date as DD.MM.YYYY", () => {
    const result = formatDate(date, "DD.MM.YYYY");
    expect(result).toBe("15.07.2023");
  });

  it("formats date as YYYY-MM-DD", () => {
    const result = formatDate(date, "YYYY-MM-DD");
    expect(result).toBe("2023-07-15");
  });

  it("defaults to YYYY-MM-DD for unknown format", () => {
    const result = formatDate(date, "SOME_UNKNOWN_FORMAT");
    expect(result).toBe("2023-07-15");
  });

  it("defaults to YYYY-MM-DD when format is omitted", () => {
    // @ts-expect-error testing runtime behavior when format is undefined
    const result = formatDate(date);
    expect(result).toBe("2023-07-15");
  });
});
