interface Person extends JikanResponse {
  mal_id: number;
  url: string;
  image_url?: string;
  website_url?: string;
  name: string;
  given_name?: string;
  family_name?: string;
  alternate_names: string[];
  birthday?: Date;
  member_favorites: number;
  about: string;
  voice_acting_roles: PersonRole[];
  anime_staff_positions: AnimePosition[];
  published_manga: MangaPosition[];
}

interface JikanResponse {
  request_hash: string;
  request_cached: boolean;
  request_cache_expiry: number;
}

interface PersonRole {
  role: string;
  anime: Node;
  character: Node;
}

interface AnimePosition {
  position: string;
  anime: Node;
}
interface MangaPosition {
  position: string;
  manga: Node;
}

interface Node {
  mal_id: number;
  url: string;
  image_url?: string;
  name: string;
  type?: string;
}

export type JikanPerson = Person;

interface Character extends JikanResponse {
  mal_id: number;
  url: string;
  image_url?: string;
  name: string;
  name_kanji?: string;
  nicknames: string[];
  about: string;
  member_favorites: number;
  animeography: CharacterRole[];
  mangaography: CharacterRole[];
  voice_actors: VoiceActor[];
}

interface CharacterRole extends Node {
  role: string;
}

interface VoiceActor extends Node {
  language: string;
}

export type JikanCharacter = Character;

interface Producer extends JikanResponse {
  meta: Node;
  anime: Array<{
    mal_id: number;
    url: string;
    title: string;
    image_url: string;
    synopsis: string;
    type: string;
    airing_start: Date;
    episodes: number;
    members: number;
    genres: Node[];
    source: string;
    producers: Node[];
    score: number;
    licensors: Node[];
    r18: false;
    kids: false;
  }>;
}

export type JikanProducer = Producer;

interface Magazine extends JikanResponse {
  meta: Node;
  manga: Array<{
    mal_id: number;
    url: string;
    title: string;
    image_url: string;
    synopsis: string;
    type: string;
    publishing_start: Date;
    volumes: number;
    members: number;
    genres: Node[];
    authors: Node[];
    score: number;
    serialization: string[];
  }>;
}

export type JikanMagazine = Magazine;

interface ListManga {
  added_to_list: boolean;
  days?: number;
  end_date: Date;
  image_url: string;
  is_rereading: boolean;
  magazines: string[];
  mal_id: number;
  priority: string;
  publishing_status: number;
  read_chapters: number;
  read_end_date?: Date;
  read_start_date?: Date;
  read_volumes?: number;
  reading_status: number;
  retail?: string;
  score: number;
  start_date?: Date;
  tags?: string;
  title: string;
  total_chapters: number;
  total_volumes: number;
  type: string;
  url: string;
}

export type JikanListManga = ListManga;

interface Jikan4Data {
  mal_id: number;
  url: string;
}

interface Jikan4Response<T> {
  data: T;
  pagination?: {};
}

interface Jikan4ImageUrls {
  image_url: string;
  small_image_url?: string;
  large_image_url?: string;
}

interface Jikan4Image {
  jpg: Jikan4ImageUrls;
  webp?: Jikan4ImageUrls;
}

type Jikan4CharacterData = Jikan4Data & {
  name: string;
  nicknames: string[];
  images?: Jikan4Image;
  favorites: number;
  about: string;
};

export type Jikan4Character = Jikan4Response<Jikan4CharacterData>;

interface Jikan4CharacterRoleData {
  role: 'Main' | 'Supporting';
  anime: Jikan4Data & {
    images: Jikan4Image;
    title: string;
  };
}

export type Jikan4CharacterRoles = Jikan4Response<Jikan4CharacterRoleData[]>;
