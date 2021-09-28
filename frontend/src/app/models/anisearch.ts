interface AnimeList {
  pages: number;
  page: number;
  link: string;
  nodes: ListAnime[];
}

interface ListAnime {
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

export type AnisearchAnimeList = AnimeList;
