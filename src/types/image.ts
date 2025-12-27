export type ImageChunk = {
  images: Image[];
  isFirstChunk: boolean;
  isLastChunk: boolean;
};

export type Image = {
  fullPath: string;
  relativePath: string;
  mimeType: string;
  creationDate: string;
}
