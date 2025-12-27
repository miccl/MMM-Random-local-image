export const SocketNotification = {
  MediaChunk: "MEDIA_CHUNK",
  GetImages: "RANDOM_IMAGES_GET",
} as const;

export type SocketNotification =
  (typeof SocketNotification)[keyof typeof SocketNotification];
