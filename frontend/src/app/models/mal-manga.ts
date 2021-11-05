import { Genre, Nsfw, Person, Picture, Studio } from './components';
import { RelatedAnime } from './mal-anime';

export type ReadStatus = 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read';

interface ListMangaInterface {
  node: MangaNode;
  list_status: MyMangaStatus;
  my_extension?: MangaExtension;
  busy?: boolean;
}

export type ListManga = ListMangaInterface;

interface MangaInterface {
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
  media_type: MangaType;
  status: MangaStatus;
  genres: Genre[];
  my_list_status?: MyMangaStatus;
  num_volumes?: number;
  num_chapters?: number;
  pictures: Picture[];
  background?: string;
  related_manga: RelatedManga[];
  related_anime: RelatedAnime[];
  related_anime_promise: Promise<RelatedAnime[]>;
  recommendations: MangaRecommendations;
  authors?: Array<{ role: string; node: Person }>;
  serialization: Array<{ node: Studio }>;
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
  my_extension?: MangaExtension;
}

export type Manga = MangaInterface;

export type MangaType =
  | 'unknown'
  | 'manga'
  | 'novel'
  | 'one_shot'
  | 'doujinshi'
  | 'manhwa'
  | 'manhua'
  | 'oel';

export type MangaStatus = 'finished' | 'currently_publishing' | 'not_yet_published';

interface MyUpdate {
  status: ReadStatus;
  is_rereading: boolean;
  score: number;
  num_volumes_read: number;
  num_chapters_read: number;
  priority: number;
  num_times_reread: number;
  reread_value: number;
  tags: string;
  comments: string;
}

export type MyMangaUpdate = MyUpdate;

export interface MangaNode {
  id: number;
  title: string;
  main_picture?: Picture;
  num_volumes?: number;
  num_chapters?: number;
  start_date?: Date;
  end_date?: Date;
  my_list_status?: MyMangaStatus;
  authors?: Array<{ role: string; node: Person }>;
  alternative_titles?: {
    synonyms?: string[];
    en?: string;
    ja?: string;
  };
}

interface MyStatus {
  status?: ReadStatus;
  is_rereading: boolean;
  score: number;
  num_volumes_read: number;
  num_chapters_read: number;
  start_date?: Date;
  finish_date?: Date;
  priority: number;
  num_times_reread: number;
  reread_value: number;
  tags: string;
  comments: string;
  updated_at: Date;
}

export type MyMangaStatus = MyStatus;

interface RelatedMangaInterface {
  node: MangaNode;
  relation_type: string;
  relation_type_formatted: string;
}

export type RelatedManga = RelatedMangaInterface;

interface MangaExtensionInterface {
  platform?: string;
  platformId?: string;
  ongoing?: boolean;
  publisher?: string;
  publisherWebsite?: string;
  displayName?: string;
  anilistId?: number;
  malId?: number;
  kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  bakaId?: number;
  anisearchId?: number;
  fandomSlug?: string;
}

export type MangaExtension = MangaExtensionInterface;

export type MangaRecommendations = Array<{ node: MangaNode; num_recommendations: number }>;

interface Character {
  mal_id: number;
  url: string;
  image_url: string;
  name: string;
  role: string;
}

export type MangaCharacter = Character;

interface BakaMangaInterface {
  votes?: number;
  score?: number;
}

export type BakaManga = BakaMangaInterface;

interface BakaMangaListInterface {
  link: string;
  page: number;
  more: boolean;
  mangas: Array<{
    title: string;
    link: string;
    image?: string;
    id: number;
    genres: string[];
    description?: string;
    year: number;
    rating: number;
  }>;
}

export type BakaMangaList = BakaMangaListInterface;
