import { Genre, Nsfw, Picture, Studio } from './components';
import { RelatedManga } from './mal-manga';

interface ListAnimeInterface {
  node: AnimeNode;
  list_status: MyAnimeStatus;
  my_extension?: AnimeExtension;
  busy?: boolean;
}

export type ListAnime = ListAnimeInterface;

interface AnimeInterface {
  id: number;
  id_mal?: number;
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
  media_type: AnimeType;
  status: AnimeStatus;
  genres: Genre[];
  my_list_status?: MyAnimeStatus;
  num_episodes: number;
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
  related_anime: RelatedAnime[];
  related_manga: RelatedManga[];
  related_manga_promise: Promise<RelatedManga[]>;
  recommendations: Array<{ node: AnimeNode; num_recommendations: number }>;
  studios: Studio[];
  statistics?: {
    status: {
      watching: number;
      completed: number;
      on_hold: number;
      dropped: number;
      plan_to_watch: number;
    };
    num_list_users: number;
  };
  opening_themes: AnimeTheme[];
  ending_themes: AnimeTheme[];
  my_extension?: AnimeExtension;
  busy?: boolean;
}

export type Anime = AnimeInterface;

export type AnimeType = 'unknown' | 'tv' | 'ova' | 'movie' | 'special' | 'ona' | 'music';
export type AnimeStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';

interface MyStatus {
  status?: WatchStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  num_times_rewatched: number;
  start_date?: Date;
  finish_date?: Date;
  priority: number;
  rewatch_value: number;
  tags: string[];
  updated_at: Date;
  comments: string;
}

export type MyAnimeStatus = MyStatus;
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

interface MyUpdate {
  status: WatchStatus;
  is_rewatching: boolean;
  score: number;
  num_watched_episodes: number;
  priority: number;
  num_times_rewatched: number;
  rewatch_value: number;
  tags: string;
  comments: string;
}

export type MyAnimeUpdate = MyUpdate;

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

export type AnimeTheme = Theme;

export interface AnimeNode {
  id: number;
  id_mal?: number;
  title: string;
  main_picture?: Picture;
  num_episodes?: number;
  start_date?: Date;
  end_date?: Date;
  my_list_status?: MyAnimeStatus;
  media_type?: AnimeType;
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  start_season?: MalSeason;
}

interface RelatedAnimeInterface {
  node: AnimeNode;
  relation_type: string;
  relation_type_formatted: string;
}

export type RelatedAnime = RelatedAnimeInterface;

interface AnimeExtensionInterface {
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
  anisearchId?: number;
  fandomSlug?: string;
  displayName?: string;
}

export type AnimeExtension = AnimeExtensionInterface;

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

export type AnimeCharacter = Character;

export type AnimeStaff = Staff;

export type AnimeRecommendations = Array<{ node: AnimeNode; num_recommendations: number }>;
