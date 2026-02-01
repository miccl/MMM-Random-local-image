export type ModulConfig = {
  photoDir: string;
  backupDir?: string;
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
  transition: TransitionEffect[];
  transitionDuration: number;
};

export type DateFormat = "MM/DD/YYYY" | "DD.MM.YYYY" | "YYYY-MM-DD";

export type TransitionEffect =
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "zoom";

// TODO: validate these keys when loading the config
export type PlaceholderKey = "date" | "currentCount" | "totalCount";

export type ImageInfoConfig = Pick<ModulConfig, "infoTemplate" | "dateFormat">;
