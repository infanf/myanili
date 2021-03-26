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
  startedAt: Date;
  completedAt: Date;
}

export type AnilistSaveMedialistEntry = SaveMedialistEntry;

export type AnilistMediaListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';

interface MediaListCollection {
  lists: MediaListGroup[];
}

export type AnilistMediaListCollection = MediaListCollection;

interface MediaListGroup {
  entries: MediaList[];
}

export type AnilistMediaListGroup = MediaListGroup;

interface MediaList {
  status: AnilistMediaListStatus;
  progress: number;
  score: number;
  notes: string;
  media: Media;
}

interface Media {
  id: number;
  idMal?: number;
  title: MediaTitle;
  episodes: number;
  coverImage: MediaCoverImage;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  season: Season;
  seasonYear: number;
}

interface MediaTitle {
  romaji: string;
  english: string;
  native: string;
  userPreferred: string;
}

interface MediaCoverImage {
  extraLarge?: string;
  large: string;
  medium: string;
  color: string;
}

interface FuzzyDate {
  year: number;
  month: number;
  day: number;
}

type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
