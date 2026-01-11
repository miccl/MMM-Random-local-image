import type { ImageInfoConfig, PlaceholderKey } from "../types/config";
import type { Image } from "../types/image";

export function processInfoTemplate(
  image: Pick<Image, "creationDate">,
  stats: { totalImagesCount: number; currentImagesCount: number },
  config: ImageInfoConfig,
): string {
  // Lazily compute values only when their placeholder is used
  const valueGetters: Record<PlaceholderKey, () => string> = {
    date: () => formatDate(new Date(image.creationDate), config.dateFormat),
    currentCount: () =>
      String(stats.totalImagesCount - stats.currentImagesCount + 1),
    totalCount: () => String(stats.totalImagesCount),
  };

  // One pass over the template, replace all {{key}} occurrences
  return config.infoTemplate.replace(/{{(\w+)}}/g, (_, key: string) => {
    if (!(key in valueGetters)) {
      // Unknown placeholder: keep as-is
      return `{{${key}}}`;
    }

    return valueGetters[key as PlaceholderKey]();
  });
}

export function formatDate(creationDate: Date, format: string) {
  // Simple date formatter
  const year = creationDate.getFullYear();
  const month = String(creationDate.getMonth() + 1).padStart(2, "0");
  const day = String(creationDate.getDate()).padStart(2, "0");

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD.MM.YYYY":
      return `${day}.${month}.${year}`;
    // TOOD: throw error?
    default:
      return `${year}-${month}-${day}`;
  }
}
