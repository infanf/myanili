export interface User {
  id: number;
  name: string;
  avatar: {
    medium: string;
  };
}

export type AnilistUser = User;

interface SaveMedialistEntry {
  id: number;
  mediaId: number;
  status: AnilistMediaListStatus;
  score: number;
  scoreRaw: number;
  progress: number;
  progressVolumes: number;
  repeat: number;
  priority: number;
  private: boolean;
  notes: string;
  hiddenFromStatusLists: boolean;
  customLists: [string];
  advancedScores: [number];
  startedAt: FuzzyDate;
  completedAt: FuzzyDate;
}

interface FuzzyDate {
  year: number;
  month: number;
  day: number;
}

export type AnilistSaveMedialistEntry = SaveMedialistEntry;

export type AnilistMediaListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';
