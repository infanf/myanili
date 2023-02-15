import Timezone from 'timezone-enum';

import { Genre, Nsfw, Picture, Studio } from './components';
import { RelatedManga } from './manga';

export interface ListAnime {
  node: AnimeNode;
  list_status: MyAnimeStatus;
  my_extension?: AnimeExtension;
  busy?: boolean;
}

export interface Anime {
  id: number;
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
    weekday?: number;
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
  website?: string;
  website_promise?: Promise<string | undefined>;
}

export type AnimeType = 'unknown' | 'tv' | 'ova' | 'movie' | 'special' | 'ona' | 'music';
export type AnimeStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';

export interface MyAnimeStatus {
  status?: WatchStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  num_times_rewatched: number;
  start_date?: string;
  finish_date?: string;
  priority: number;
  rewatch_value: number;
  tags: string[];
  updated_at: Date;
  comments: string;
}
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

export interface MyAnimeUpdate {
  status: WatchStatus;
  is_rewatching: boolean;
  score: number;
  num_watched_episodes: number;
  priority: number;
  num_times_rewatched: number;
  rewatch_value: number;
  start_date: string;
  finish_date: string;
  tags: string;
  comments: string;
}

export interface MalSeason {
  year: number;
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

export interface AnimeTheme {
  id: number;
  anime_id: number;
  text: string;
  spotify?: string;
}

export interface AnimeNode {
  id: number;
  title: string;
  main_picture?: Picture;
  num_episodes?: number;
  start_date?: Date;
  end_date?: Date;
  my_list_status?: MyAnimeStatus;
  media_type?: AnimeType;
  rating?: string;
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
  broadcast?: {
    weekday?: number;
    day_of_the_week: string;
    start_time?: string;
  };
  start_season?: MalSeason;
  genres?: Genre[];
  popularity?: number;
  num_list_users?: number;
}

export interface RelatedAnime {
  node: AnimeNode;
  relation_type: string;
  relation_type_formatted: string;
}

interface SimulcastData {
  day?: number[];
  time?: string;
  tz?: Timezone;
  country?: string;
}

export interface AnimeExtension {
  series?: string;
  seasonNumber?: number;
  episodeCorOffset?: number;
  externalStreaming?: string;
  externalStreamingId?: string;
  simulcast: SimulcastData;
  /**
   * @deprecated use simulcast.day instead
   */
  simulDay?: number | number[];
  /**
   * @deprecated use simulcast.time instead
   */
  simulTime?: string;
  /**
   * @deprecated use simulcast.country instead
   */
  simulCountry?: string;
  trakt?: string;
  anilistId?: number;
  malId?: number;
  kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  simklId?: number;
  annictId?: number;
  livechartId?: number;
  anisearchId?: number;
  annId?: number;
  anidbId?: number;
  fandomSlug?: string;
  displayName?: string;
  episodeRule?: number;
  lastWatchedAt?: Date;
}

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

export enum AnimeEpisodeRule {
  DROP = 0,
  CONTINUE = 1,
  ASK_AGAIN = 2,
}

export function migrateSimulcasts(extension: Partial<AnimeExtension>): AnimeExtension {
  if (!extension.simulcast) {
    extension.simulcast = {};
  }
  const simulDay = extension.simulDay;
  const simulDays = [];
  if (simulDay && typeof simulDay === 'number') {
    simulDays.push(simulDay);
  } else if (simulDay && Array.isArray(simulDay)) {
    simulDays.push(...simulDay);
  }
  extension.simulcast.time ||= extension.simulTime;
  extension.simulcast.country ||= extension.simulCountry;
  extension.simulcast.tz ||= Timezone.UTC;
  extension.simulcast.day ||= simulDays;
  delete extension.simulDay;
  delete extension.simulTime;
  delete extension.simulCountry;
  return extension as AnimeExtension;
}

export function parseExtension(comments: string): AnimeExtension {
  const { Base64 } = require('js-base64');
  try {
    const extension = JSON.parse(Base64.decode(comments)) as unknown as Partial<AnimeExtension>;
    return migrateSimulcasts(extension);
  } catch (e) {
    return {
      simulcast: {},
    } as AnimeExtension;
  }
}

export function daysToLocal(simulcast?: SimulcastData): number[] {
  if (!simulcast) return [];
  const [hour, minute] = simulcast?.time?.split(':').map(Number) || [0, 0];
  const { DateTime } = require('luxon') as typeof import('luxon');
  return (
    simulcast?.day?.map(
      weekday =>
        DateTime.local()
          .setZone(simulcast.tz || 'UTC')
          .set({
            hour,
            minute,
            weekday,
          })
          .toLocal().weekday,
    ) || []
  );
}
