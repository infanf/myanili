export interface MangaBakaSeries {
  id: number;
  state: 'active' | 'merged' | 'deleted';
  merged_with: number | null;
  title: string;
  native_title: string | null;
  romanized_title: string | null;
  type: 'manga' | 'novel' | 'manhwa' | 'manhua' | 'oel' | 'other';
  status: 'cancelled' | 'completed' | 'hiatus' | 'releasing' | 'unknown' | 'upcoming';
  description: string | null;
  cover_image: string | null;
  genres: string[];
  rating: number | null;
  source?: {
    anilist?: { id: number | null; rating: number | null; rating_normalized: number | null };
    anime_planet?: { id: number | null; rating: number | null; rating_normalized: number | null };
    anime_news_network?: {
      id: number | null;
      rating: number | null;
      rating_normalized: number | null;
    };
    kitsu?: { id: number | null; rating: number | null; rating_normalized: number | null };
    manga_updates?: { id: string | null; rating: number | null; rating_normalized: number | null };
    my_anime_list?: { id: number | null; rating: number | null; rating_normalized: number | null };
    shikimori?: { id: number | null; rating: number | null; rating_normalized: number | null };
  };
}

export interface MangaBakaLibraryEntry {
  id?: number;
  series_id?: number;
  user_id?: string;
  note: string | null;
  read_link: string | null;
  rating: number | null;
  state:
    | 'considering'
    | 'completed'
    | 'dropped'
    | 'paused'
    | 'plan_to_read'
    | 'reading'
    | 'rereading';
  priority: number;
  is_private: boolean;
  number_of_rereads: number | null;
  progress_chapter: number | null;
  progress_volume: number | null;
  start_date: string | null;
  finish_date: string | null;
}

export interface MangaBakaLibraryEntryWithSeries extends MangaBakaLibraryEntry {
  series: MangaBakaSeries;
}

export interface MangaBakaSearchParams {
  q?: string;
  type?: string[];
  type_not?: string[];
  status?: string[];
  status_not?: string[];
  content_rating?: string[];
}

export interface MangaBakaResponse<T> {
  status: number;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface MangaBakaError {
  status: number;
  message: string;
}

export interface MangaBakaUser {
  sub: string;
  name: string;
  email?: string;
  email_verified?: boolean;
  profile?: string;
}
