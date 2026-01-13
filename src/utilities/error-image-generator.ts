import sharp from "sharp";

/**
 * Escapes XML special characters to prevent SVG injection
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates a minimal fallback error image if the main generation fails
 */
export async function generateFallbackErrorImage(): Promise<string> {
  const width = 800;
  const height = 600;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="50%" y="50%"
            font-family="Arial, sans-serif"
            font-size="28"
            fill="#ffffff"
            text-anchor="middle"
            dominant-baseline="middle">
        Error Loading Media
      </text>
    </svg>
  `;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const base64 = pngBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

/**
 * Generates an error image as a base64-encoded PNG data URI
 * to be displayed when media loading fails.
 *
 * @param title - Error title to display
 * @param displayMessage - Error message to display
 * @param helpText - Help text to display at bottom
 * @param details - Array of detail strings to display
 * @returns Base64-encoded data URI string for the error image
 */
export async function generateErrorImage(
  title: string,
  displayMessage: string,
  helpText: string,
  details: string[],
): Promise<string> {
  const width = 800;
  const height = 600;

  // Build detail text elements (always shown for debugging)
  const detailTexts = details
    .map(
      (detail, index) => `
      <text x="50%" y="${420 + index * 25}"
            font-family="monospace"
            font-size="14"
            fill="#999999"
            text-anchor="middle">
        ${escapeXml(detail)}
      </text>
    `,
    )
    .join("");

  const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>

        <!-- Warning Triangle (same for all errors) -->
        <polygon points="400,150 450,250 350,250" fill="none" stroke="#ff6b6b" stroke-width="4"/>
        <circle cx="400" cy="230" r="4" fill="#ff6b6b"/>
        <line x1="400" y1="190" x2="400" y2="220" stroke="#ff6b6b" stroke-width="4"/>

        <!-- Error Title (customized per error type) -->
        <text x="50%" y="320"
              font-family="Arial, sans-serif"
              font-size="32"
              font-weight="bold"
              fill="#ffffff"
              text-anchor="middle">
          ${escapeXml(title)}
        </text>

        <!-- Error Message -->
        <text x="50%" y="370"
              font-family="Arial, sans-serif"
              font-size="18"
              fill="#cccccc"
              text-anchor="middle">
          ${escapeXml(displayMessage)}
        </text>

        <!-- Technical Details (always shown) -->
        ${detailTexts}

        <!-- Help Text -->
        <text x="50%" y="${420 + details.length * 25 + 30}"
              font-family="Arial, sans-serif"
              font-size="16"
              fill="#888888"
              text-anchor="middle">
          ${escapeXml(helpText)}
        </text>
      </svg>
    `;

  try {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const base64 = pngBuffer.toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error("Error generating error image:", err);
    return generateFallbackErrorImage();
  }
}
