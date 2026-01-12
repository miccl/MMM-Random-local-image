/**
 * Truncates a path intelligently, preserving start and end
 * @param path - Full file path
 * @param maxLength - Maximum length (default 60)
 * @returns Truncated path with ellipsis in middle
 *
 * @example
 * truncatePath('/home/pi/cloud/modules/MMM-Random-local-image/photos', 50)
 * → '/home/pi/.../MMM-Random-local-image/photos'
 */
export function truncatePath(path: string, maxLength = 60): string {
  if (path.length <= maxLength) return path;

  // Normalize path separators
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/").filter((p) => p);

  // Keep first 2 parts and last 2 parts
  if (parts.length <= 4) {
    // Not enough parts to truncate meaningfully, just truncate middle
    const start = path.slice(0, Math.floor(maxLength / 2) - 2);
    const end = path.slice(-(Math.floor(maxLength / 2) - 2));
    return `${start}...${end}`;
  }

  // Build path with start and end parts
  const startParts = parts.slice(0, 2);
  const endParts = parts.slice(-2);
  const separator = normalized.startsWith("/") ? "/" : "";
  const reconstructed = `${separator}${startParts.join("/")}/.../${endParts.join("/")}`;

  // If still too long, truncate more aggressively
  if (reconstructed.length > maxLength) {
    const start = path.slice(0, Math.floor(maxLength / 2) - 2);
    const end = path.slice(-(Math.floor(maxLength / 2) - 2));
    return `${start}...${end}`;
  }

  return reconstructed;
}
