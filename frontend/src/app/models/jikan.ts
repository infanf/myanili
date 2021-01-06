interface Person {
  request_hash: string;
  request_cached: boolean;
  request_cache_expiry: number;
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
  image_url: string;
  name: string;
}

export type JikanPerson = Person;

interface Character {
  request_hash: string;
  request_cached: boolean;
  request_cache_expiry: number;
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
