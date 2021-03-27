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
  progressVolumes?: number;
  score: number;
  notes: string;
  updatedAt: number;
  comletedAt?: FuzzyDate;
  media: Media;
}

export type AnilistMediaList = MediaList;

interface Media {
  id: number;
  idMal?: number;
  title: MediaTitle;
  staff: StaffConnection;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  coverImage: MediaCoverImage;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  season: Season;
  seasonYear: number;
  mediaListEntry?: MediaList;
}

export type AnilistMedia = Media;

interface StaffConnection {
  edges: StaffEdge[];
}

interface StaffEdge {
  node: Staff;
  role: string;
}

interface Staff {
  id: number;
  name: StaffName;
}

interface StaffName {
  first: string;
  last: string;
  full: string;
  native: string;
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
