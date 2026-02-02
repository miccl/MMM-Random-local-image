export type ImageChunk = {
  images: Image[];
  isFirstChunk: boolean;
  isLastChunk: boolean;
  isUsingBackup?: boolean;
};

export type Image = {
  fullPath: string;
  relativePath: string;
  mimeType: string;
  creationDate: string;
};
