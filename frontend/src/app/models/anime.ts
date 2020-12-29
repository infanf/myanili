import { Genre, Nsfw, Picture, Studio } from './components';

export type ListStatus = 'watching' | 'completed' | 'on_hold' | 'droppped' | 'plan_to_watch';

interface ListAnimeInterface {
  node: AnimeNode;
  list_status: MyAnimeStatus;
}

export type ListAnime = ListAnimeInterface;

interface AnimeInterface {
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
  mean?: number;
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
  start_season?: Season;
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
  //   related_manga: [];
  //   recommendations: [];
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
}

export type Anime = AnimeInterface;

export type AnimeType = 'unknown' | 'tv' | 'ova' | 'movie' | 'special' | 'ona' | 'music';
export type AnimeStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';

interface MyStatus {
  status?: WatchStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
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

interface SeasonInterface {
  year: number;
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

export type Season = SeasonInterface;

interface Theme {
  id: number;
  anime_id: number;
  text: string;
}

export type AnimeTheme = Theme;

interface AnimeNode {
  id: number;
  title: string;
  main_picture?: Picture;
}

interface RelatedAnimeInterface {
  node: AnimeNode;
  relation_type: string;
  relation_type_formatted: string;
}

export type RelatedAnime = RelatedAnimeInterface;
