import { describe, expect, it } from "vitest";
import {
  escapeXml,
  generateErrorImage,
  generateFallbackErrorImage,
} from "./error-image-generator";

describe("escapeXml", () => {
  it("should escape XML special characters", () => {
    expect(escapeXml("&")).toBe("&amp;");
    expect(escapeXml("<")).toBe("&lt;");
    expect(escapeXml(">")).toBe("&gt;");
    expect(escapeXml('"')).toBe("&quot;");
    expect(escapeXml("'")).toBe("&apos;");
  });

  it("should handle multiple special characters", () => {
    expect(escapeXml("<script>alert('x')</script>")).toBe(
      "&lt;script&gt;alert(&apos;x&apos;)&lt;/script&gt;",
    );
  });

  it("should not modify safe characters", () => {
    expect(escapeXml("safe text")).toBe("safe text");
    expect(escapeXml("123")).toBe("123");
    expect(escapeXml("path/to/file.jpg")).toBe("path/to/file.jpg");
  });
});

describe("generateFallbackErrorImage", () => {
  it("should generate a valid fallback error image", async () => {
    const image = await generateFallbackErrorImage();

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });
});

describe("generateErrorImage", () => {
  it("should generate a valid error image", async () => {
    const image = await generateErrorImage(
      "Test Error",
      "Test message",
      "Test help",
      ["Detail 1", "Detail 2"],
    );

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should escape XML in all text fields", async () => {
    const image = await generateErrorImage(
      "Error with <special> & chars",
      'Message with "quotes"',
      "Help with 'apostrophes'",
      ["Detail with <tag>", "Detail with &amp;"],
    );

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should handle empty details array", async () => {
    const image = await generateErrorImage(
      "Simple Error",
      "Simple message",
      "Simple help",
      [],
    );

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should handle many details", async () => {
    const manyDetails = Array.from({ length: 10 }, (_, i) => `Detail ${i + 1}`);
    const image = await generateErrorImage(
      "Complex Error",
      "Complex message",
      "Complex help",
      manyDetails,
    );

    expect(image).toMatch(/^data:image\/png;base64,/);
    expect(image.length).toBeGreaterThan(100);
  });

  it("should generate different images for different inputs", async () => {
    const image1 = await generateErrorImage("Error 1", "Message 1", "Help 1", [
      "Detail 1",
    ]);
    const image2 = await generateErrorImage("Error 2", "Message 2", "Help 2", [
      "Detail 2",
    ]);

    expect(image1).toMatch(/^data:image\/png;base64,/);
    expect(image2).toMatch(/^data:image\/png;base64,/);
    expect(image1).not.toBe(image2);
  });
});
