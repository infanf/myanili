import { Company, Nsfw, Person, Picture } from './components';

interface ListMediaInterface {
  node: MediaNode;
  list_status: MyMediaStatus;
  my_extension?: MediaExtension;
  busy?: boolean;
}

export type ListMedia = ListMediaInterface;

interface MediaInterface {
  id: number;
  id_mal?: number;
  type: 'anime' | 'manga';
  title: string;
  main_picture?: Picture;
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  start_date?: Date;
  end_date?: Date;
  synopsis?: string;
  mean: number;
  rank?: number;
  popularity?: number;
  num_list_users: number;
  num_scoring_users: number;
  nsfw?: Nsfw;
  created_at: Date;
  updated_at: Date;
  media_type: MediaType;
  status: MediaStatus;
  genres: string[];
  my_list_status?: MyMediaStatus;
  /**
   * Episodes for Anime or Chapters for Manga
   */
  num_parts: number;
  num_volumes?: number;
  start_season?: MalSeason;
  broadcast?: {
    day_of_the_week: string;
    start_time?: string;
  };
  source?: string;
  average_episode_duration?: number;
  rating?: string;
  pictures: Picture[];
  background?: string;
  related: RelatedMedia[];
  recommendations: MediaRecommendations;
  /**
   * Studios for Anime or Magazines for Manga
   */
  companies: Company[];
  statistics?: {
    status: {
      current: number;
      completed: number;
      on_hold: number;
      dropped: number;
      planning: number;
    };
    num_list_users: number;
  };
  opening_themes?: MediaTheme[];
  ending_themes?: MediaTheme[];
  busy?: boolean;
  authors?: Array<{ role: string; node: Person }>;
  my_extension?: MediaExtension;
}

export type Media = MediaInterface;

type MangaType =
  | 'unknown'
  | 'manga'
  | 'novel'
  | 'one_shot'
  | 'doujinshi'
  | 'manhwa'
  | 'manhua'
  | 'oel';

type AnimeType = 'unknown' | 'tv' | 'ova' | 'movie' | 'special' | 'ona' | 'music';

export type MediaType = AnimeType | MangaType;
export type MediaStatus = 'finished' | 'current' | 'not_yet_released' | 'cancelled' | 'hiatus';

interface MyStatus {
  status?: PersonalStatus;
  /**
   * normalized to 0-10
   */
  score: number;
  progress: number;
  progress_volumes?: number;
  repeating: boolean;
  repeats: number;
  start_date?: Date;
  finish_date?: Date;
  priority: number;
  repeat_value: number;
  tags: string[];
  updated_at: Date;
  comments: string;
}

export type MyMediaStatus = MyStatus;
export type PersonalStatus = 'current' | 'completed' | 'on_hold' | 'dropped' | 'planning';

interface MyUpdate {
  status: PersonalStatus;
  repeating: boolean;
  score: number;
  progress: number;
  progress_volumes?: number;
  priority: number;
  repeats: number;
  repeat_value: number;
  tags: string;
  comments: string;
}

export type MyMediaUpdate = MyUpdate;

interface SeasonInterface {
  year: number;
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

export type MalSeason = SeasonInterface;

interface Theme {
  id: number;
  anime_id: number;
  text: string;
  spotify?: string;
}

export type MediaTheme = Theme;

export interface MediaNode {
  id: number;
  id_mal?: number;
  title: string;
  main_picture?: Picture;
  /**
   * Episodes for Anime or Chapters for Manga
   */
  num_parts: number;
  num_volumes?: number;
  start_date?: Date;
  end_date?: Date;
  my_list_status?: MyMediaStatus;
  media_type?: MediaType;
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  start_season?: MalSeason;
}

interface RelatedMediaInterface {
  node: MediaNode;
  type: 'anime' | 'manga';
  relation_type: string;
  relation_type_formatted: string;
}

export type RelatedMedia = RelatedMediaInterface;

interface MediaExtensionInterface {
  series?: string;
  seasonNumber?: number;
  episodeCorOffset?: number;
  externalStreaming?: string;
  externalStreamingId?: string;
  simulDay?: number;
  simulTime?: string;
  simulCountry?: string;
  trakt?: string;
  anilistId?: number;
  malId?: number;
  kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  simklId?: number;
  annictId?: number;
  livechartId?: number;
  bakaId?: number;
  fandomSlug?: string;
  displayName?: string;
}

export type MediaExtension = MediaExtensionInterface;

interface Character {
  mal_id: number;
  url: string;
  image_url: string;
  name: string;
  role: string;
  voice_actors: VoiceActor[];
}

interface VoiceActor {
  mal_id: number;
  name: string;
  url: string;
  image_url: string;
  language: string;
}

interface Staff {
  mal_id: number;
  url: string;
  image_url: string;
  name: string;
  positions: string[];
}

export type MediaCharacter = Character;

export type MediaStaff = Staff;

export type MediaRecommendations = Array<{ node: MediaNode; num_recommendations: number }>;

interface BakaMangaInterface {
  votes?: number;
  score?: number;
}

export type BakaManga = BakaMangaInterface;
