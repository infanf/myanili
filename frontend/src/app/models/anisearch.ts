interface List<T> {
  pages: number;
  page: number;
  link: string;
  nodes: T[];
}

interface ListMedia {
  id: number;
  title: string;
  genre?: string;
  description?: string;
  link: string;
  image?: string;
  source?: string;
  type?: string;
  year: string;
  rating: number;
}

interface ListAnime extends ListMedia {
  id: number;
  title: string;
  studio?: string;
  genre?: string;
  description?: string;
  link: string;
  image?: string;
  source?: string;
  duration: number;
  type?: string;
  episodes: number;
  year: string;
  rating: number;
}

interface ListManga extends ListMedia {
  id: number;
  title: string;
  publisher: string;
  genre?: string;
  description?: string;
  link: string;
  image?: string;
  source?: string;
  type: string;
  chapters?: number;
  volumes?: number;
  year: string;
  rating: number;
}

export type AnisearchAnimeList = List<ListAnime>;
export type AnisearchMangaList = List<ListManga>;
export type AnisearchList = List<ListMedia>;
