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
  dateFormat: DateFormat;
};

export type DateFormat = "MM/DD/YYYY" | "DD.MM.YYYY" | "YYYY-MM-DD";

// TODO: validate these keys when loading the config
export type PlaceholderKey = "date" | "currentCount" | "totalCount";

export type ImageInfoConfig = Pick<ModulConfig, "infoTemplate" | "dateFormat">;
