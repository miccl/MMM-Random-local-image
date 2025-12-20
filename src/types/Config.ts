export type ModulConfig = {
  photoDir: string;
  backupDir?: string;
  errorDir: string; // TODO: remove
  photoUpdateInterval: number;
  photoLoadInitialDelay: number;
  photoLoadUpdateInterval: number;
  randomOrder: boolean;
  selectFromSubdirectories: boolean;
  ignoreVideos: boolean;
  ignoreDirRegex: string;
  opacity: number;
  maxWidth: string;
  maxHeight: string;
  showAdditionalInformation: boolean;
  infoTemplate: string;
  dateFormat: string;
};
