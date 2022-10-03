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

export interface Jikan4Response<T> {
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

export type Jikan4Anime = Jikan4Data & {
  images?: Jikan4Image;
  title: string;
  type: string;
  source: string;
};

type Jikan4CharacterData = Jikan4Data & {
  name: string;
  name_kanji?: string;
  nicknames: string[];
  images?: Jikan4Image;
  favorites: number;
  about: string;
};

export type Jikan4Character = Jikan4CharacterData;

interface Jikan4CharacterAnimeRoleData {
  role: 'Main' | 'Supporting';
  anime: Jikan4Data & {
    images: Jikan4Image;
    title: string;
  };
}

interface Jikan4CharacterMangaRoleData {
  role: 'Main' | 'Supporting';
  manga: Jikan4Data & {
    images: Jikan4Image;
    title: string;
  };
}

interface Jikan4CharacterVoiceActorData {
  language: string;
  person: Jikan4Data & {
    images: Jikan4Image;
    name: string;
  };
}

export type Jikan4CharacterAnimeRoles = Jikan4CharacterAnimeRoleData[];
export type Jikan4CharacterMangaRoles = Jikan4CharacterMangaRoleData[];
export type Jikan4CharacterVoiceActors = Jikan4CharacterVoiceActorData[];

type Jikan4PersonData = Jikan4Data & {
  website_url?: string;
  images?: Jikan4Image;
  name: string;
  given_name?: string;
  family_name?: string;
  alternate_names: string[];
  birthday?: Date;
  favorites: number;
  about: string;
};

export type Jikan4Person = Jikan4PersonData;

interface Jikan4PersonRoleData {
  role: 'Main' | 'Supporting';
  anime: Jikan4Data & {
    title: string;
    images: Jikan4Image;
  };
  character: Jikan4Data & {
    name: string;
    images: Jikan4Image;
  };
}

export type Jikan4PersonRoles = Jikan4PersonRoleData[];

interface Jikan4PersonAnimeData {
  position: string;
  anime: Jikan4Data & {
    title: string;
    images: Jikan4Image;
  };
}

export type Jikan4PersonAnimes = Jikan4PersonAnimeData[];

interface Jikan4PersonMangaData {
  position: string;
  manga: Jikan4Data & {
    title: string;
    images: Jikan4Image;
  };
}

export type Jikan4PersonMangas = Jikan4PersonMangaData[];

interface Jikan4WorkCharacter {
  character: Jikan4Data & {
    images: Jikan4Image;
    name: string;
  };
  role: 'Main' | 'Supporting';
}

export type Jikan4AnimeCharacter = Jikan4WorkCharacter & {
  voice_actors: Array<{
    person: Jikan4Data & {
      images?: Jikan4Image;
      name: string;
    };
    language: string;
  }>;
};

export type Jikan4MangaCharacter = Jikan4WorkCharacter;

export interface Jikan4Staff {
  person: Jikan4Data & {
    images?: Jikan4Image;
    name: string;
  };
  positions: string[];
}

export interface Jikan4WorkRelation {
  relation: string;
  entry: Array<
    Jikan4Data & {
      name: string;
      type: 'anime' | 'manga';
    }
  >;
}

export type Jikan4Producer = Jikan4Data & {
  titles: Array<{
    type: string;
    title: string;
  }>;
  images: Jikan4Image;
  favorites: number;
  count: number;
  established: string;
  about: string;
  external: Array<{
    name: string;
    url: string;
  }>;
};
