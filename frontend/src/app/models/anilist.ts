export interface User {
  id: number;
  name: string;
  avatar: {
    medium: string;
  };
}

export type AnilistUser = User;

interface SaveMediaListEntry {
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

export type AnilistSaveMediaListEntry = SaveMediaListEntry;

export type AnilistMediaListStatus =
  | 'CURRENT'
  | 'PLANNING'
  | 'COMPLETED'
  | 'DROPPED'
  | 'PAUSED'
  | 'REPEATING';

export type AnilistMediaStatus =
  | 'FINISHED'
  | 'RELEASING'
  | 'NOT_YET_RELEASED'
  | 'CANCELLED'
  | 'HIATUS';

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
  repeat: number;
}

export type AnilistMediaList = MediaList;

interface Media {
  id: number;
  idMal?: number;
  type: 'ANIME' | 'MANGA';
  title: MediaTitle;
  synonyms?: string[];
  description?: string;
  duration?: number;
  staff: Edges<StaffEdge>;
  studios?: Edges<StudioEdge>;

  genres: string[];
  episodes?: number;
  chapters?: number;
  volumes?: number;
  coverImage: MediaCoverImage;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  meanScore: number;
  source?: string;
  popularity: number;
  status: AnilistMediaStatus;
  season: Season;
  seasonYear: number;
  mediaListEntry?: MediaList;
  relations: { edges: RelatedMedia[] };
}

export type AnilistMedia = Media;

interface RelatedMedia {
  relationType: string;
  node: {
    id: number;
    type: 'ANIME' | 'MANGA';
    title: MediaTitle;
    episodes?: number;
    chapters?: number;
    volumes?: number;
  };
  id: number;
}

interface Edges<T> {
  edges: T[];
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

interface StudioEdge {
  node: Studio;
  isMain: boolean;
}

interface Studio {
  id: number;
  name: string;
}

interface CharacterEdge {
  role: string;
  node: BasicPerson;
  voiceActors: BasicPerson[];
}

export type AnilistCharacters = Edges<CharacterEdge>;

interface BasicPerson {
  id: number;
  name: StaffName;
  image: Image;
}

interface MediaTitle {
  romaji: string;
  english: string;
  native: string;
  userPreferred: string;
}

interface Image {
  medium: string;
  large: string;
}

interface MediaCoverImage extends Image {
  extraLarge?: string;
  color: string;
}

interface FuzzyDate {
  year: number;
  month: number;
  day: number;
}

type Season = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
