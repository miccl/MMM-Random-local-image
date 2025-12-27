import mime from "mime-types";
import { ModulConfig } from "../types/config";

export function isImageOrVideo(
  fileName: string,
  options: Pick<ModulConfig, "ignoreVideos">,
): boolean {
  const mimeType = mime.lookup(fileName);
  if (!mimeType) {
    return false;
  }
  const fileType = mimeType.split("/")[0];
  return (
    fileType === "image" || (!options.ignoreVideos && fileType === "video")
  );
}
