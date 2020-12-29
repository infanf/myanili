interface PictureInterface {
  medium: string;
  large?: string;
}

interface Generic {
  id: number;
  name: string;
}

export type Picture = PictureInterface;
export type Nsfw = 'white' | 'gray' | 'black';
export type Genre = Generic;
export type Studio = Generic;
