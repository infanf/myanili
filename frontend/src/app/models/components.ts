interface PictureInterface {
  medium: string;
  large?: string;
}

interface Generic {
  id: number;
  name: string;
}

interface PersonInterface {
  id: number;
  first_name: string;
  last_name: string;
}

export type Picture = PictureInterface;
export type Nsfw = 'white' | 'gray' | 'black';
export type Genre = Generic;
export type Studio = Generic;
export type Person = PersonInterface;

interface SeasonInterface {
  year: number;
  season: SeasonNumber;
}

export type SeasonNumber = 0 | 1 | 2 | 3;
export type Season = SeasonInterface;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Rating {
  norm: number; // mapped to 100 point rating system
  nom: number; // rating system used by provider
  unit?: string; // rating unit used by provider (eg. %)
  ratings?: number;
}

export type ExtRating = Rating;
