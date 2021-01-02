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
  season: number;
}

export type Season = SeasonInterface;
