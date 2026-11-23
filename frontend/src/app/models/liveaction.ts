import { WatchStatus } from './anime';

/** Bangumi platform (category) of a live action subject (subject_type 6) */
export type LiveactionPlatform =
  | '日剧'
  | '欧美剧'
  | '华语剧'
  | '电视剧'
  | '电影'
  | '演出'
  | '综艺'
  | '其他';

/** Stage plays and variety shows are no adaptations in the sense of MyAniLi */
export const EXCLUDED_PLATFORMS: string[] = ['演出', '综艺'];

export interface BangumiImages {
  large?: string;
  common?: string;
  medium?: string;
  small?: string;
  grid?: string;
}

export interface BangumiInfoboxItem {
  key: string;
  value: string | Array<{ k?: string; v: string }>;
}

export interface LiveactionSubject {
  id: number;
  type: number;
  name: string;
  name_cn: string;
  summary?: string;
  date?: string;
  platform?: LiveactionPlatform | string;
  images?: BangumiImages;
  infobox?: BangumiInfoboxItem[];
  eps?: number;
  total_episodes?: number;
  rating?: { score: number; total: number; rank?: number };
  tags?: Array<{ name: string; count: number }>;
}

/** English metadata resolved by the backend from TMDB */
export interface LiveactionMeta {
  bangumiId: number;
  mediaType: 'movie' | 'tv';
  season: number;
  source: 'manual' | 'auto' | 'none';
  imdb?: string | null;
  tvdb?: number | null;
  tmdb?: number;
  title?: string | null;
  originalTitle?: string | null;
  overview?: string | null;
  poster?: string | null;
  backdrop?: string | null;
  year?: number | null;
  genres?: string[];
  /** TMDB user score (0–10) and number of votes */
  rating?: number | null;
  votes?: number;
  seasons?: Array<{ number: number; episodes: number; name: string }>;
  /** Trakt slug and SIMKL ID, resolved by the backend with the app's client IDs */
  trakt?: string | null;
  simkl?: number | null;
  /** aniSearch live action ID (manual mapping or aniSearch export) */
  anisearch?: number | null;
  /** MyDramaList slug, e.g. "705723-strange-lawyer-woo-young-woo" */
  mdl?: string | null;
}

export interface TmdbSearchResult {
  tmdb: number;
  mediaType: 'movie' | 'tv';
  title?: string | null;
  originalTitle?: string | null;
  overview?: string | null;
  poster?: string | null;
  year?: number | null;
}

/** Bangumi collection type: 1 wish, 2 collect, 3 do, 4 on_hold, 5 dropped */
export type BangumiCollectionType = 1 | 2 | 3 | 4 | 5;

export interface LiveactionListStatus {
  status: WatchStatus;
  score: number;
  num_watched_episodes: number;
  comment?: string;
  updated_at?: string;
}

export interface LiveactionCollection {
  subject_id: number;
  subject_type: number;
  type: BangumiCollectionType;
  rate: number;
  ep_status: number;
  comment?: string;
  private?: boolean;
  updated_at?: string;
  subject?: LiveactionSubject;
}

export interface ListLiveaction {
  subject: LiveactionSubject;
  list_status?: LiveactionListStatus;
  meta?: LiveactionMeta;
}

export interface Liveaction extends LiveactionSubject {
  meta?: LiveactionMeta;
  my_list_status?: LiveactionListStatus;
}

/** Live action adaptation shown on anime/manga details */
export interface RelatedLiveaction {
  title: string;
  poster?: string;
  mediaType: 'movie' | 'tv';
  year?: string;
  /** Internal route for Bangumi entries, external URL for aniSearch entries */
  route?: string;
  link?: string;
}

export interface LiveactionUpdate {
  status: WatchStatus;
  score?: number;
  num_watched_episodes?: number;
  comment?: string;
}

/** IDs used to identify a live action entry on Trakt and SIMKL */
export interface LiveactionIds {
  tmdb?: number;
  imdb?: string;
  mediaType: 'movie' | 'tv';
  season: number;
}

export function collectionToStatus(type: BangumiCollectionType): WatchStatus {
  switch (type) {
    case 1:
      return 'plan_to_watch';
    case 2:
      return 'completed';
    case 3:
      return 'watching';
    case 4:
      return 'on_hold';
    default:
      return 'dropped';
  }
}

export function statusToCollection(status: WatchStatus): BangumiCollectionType {
  switch (status) {
    case 'plan_to_watch':
      return 1;
    case 'completed':
      return 2;
    case 'watching':
      return 3;
    case 'on_hold':
      return 4;
    default:
      return 5;
  }
}

/** Origin of a subject by Bangumi infobox country (国家/地区) */
const COUNTRY_ORIGINS: Record<string, string> = {
  韩国: 'Korean',
  大韩民国: 'Korean',
  泰国: 'Thai',
  日本: 'Japanese',
  中国: 'Chinese',
  中国大陆: 'Chinese',
  台湾: 'Taiwanese',
  中国台湾: 'Taiwanese',
  香港: 'Hong Kong',
  中国香港: 'Hong Kong',
  越南: 'Vietnamese',
  菲律宾: 'Filipino',
  印度尼西亚: 'Indonesian',
  马来西亚: 'Malaysian',
  新加坡: 'Singaporean',
  印度: 'Indian',
  美国: 'American',
  英国: 'British',
};

/** Origin of a subject by Bangumi infobox language (语言), used without country */
const LANGUAGE_ORIGINS: Record<string, string> = {
  韩语: 'Korean',
  泰语: 'Thai',
  日语: 'Japanese',
  汉语普通话: 'Chinese',
  普通话: 'Chinese',
  粤语: 'Cantonese',
  闽南语: 'Taiwanese',
  越南语: 'Vietnamese',
  菲律宾语: 'Filipino',
  印尼语: 'Indonesian',
};

/**
 * Origin of a subject from its infobox; for co-productions the first
 * listed country or language wins.
 */
export function subjectOrigin(subject: LiveactionSubject): string | undefined {
  const first = (values: string[]) => values.join('、').split(/[、,，/\s]+/)[0];
  const country = first(infoboxValue(subject, '国家/地区'));
  if (COUNTRY_ORIGINS[country]) return COUNTRY_ORIGINS[country];
  const language = first(infoboxValue(subject, '语言'));
  return LANGUAGE_ORIGINS[language];
}

/**
 * Bangumi only has own categories for Japanese, Western and Chinese drama.
 * Everything else (mostly Korean and Thai drama) is filed as generic TV drama
 * (电视剧), so its origin is derived from the infobox.
 */
export function platformName(subject?: LiveactionSubject): string {
  if (subject?.platform === '电视剧') {
    const origin = subjectOrigin(subject);
    return origin ? `${origin} Drama` : 'TV Drama';
  }
  switch (subject?.platform) {
    case '日剧':
      return 'Japanese Drama';
    case '欧美剧':
      return 'Western Drama';
    case '华语剧':
      return 'Chinese Drama';
    case '电视剧':
      return 'TV Drama';
    case '电影':
      return 'Movie';
    case '演出':
      return 'Stage';
    case '综艺':
      return 'Variety';
    default:
      return 'Live Action';
  }
}

export function infoboxValue(subject: LiveactionSubject, ...keys: string[]): string[] {
  for (const key of keys) {
    const item = subject.infobox?.find(entry => entry.key === key);
    if (!item) continue;
    if (typeof item.value === 'string') return [item.value];
    return item.value.map(value => value.v);
  }
  return [];
}
