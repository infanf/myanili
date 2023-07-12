import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class MangapassionService {
  private baseUrl = 'https://api.manga-passion.de';

  constructor(private cache: CacheService) {}

  async searchManga(query: string) {
    if (!query) return [];
    const mangas = await this.cache.fetch<PassionManga[]>(
      `${this.baseUrl}/editions?search[title]=${query}`,
    );
    return mangas;
  }

  async getIdFromTitle(titles: string[]): Promise<number | undefined> {
    if (!titles?.length) return undefined;
    const mangas = await this.searchManga(titles[0]);
    const manga = mangas.find(
      m =>
        titles.includes(m.title) ||
        titles.includes(m.sources[0]?.title) ||
        titles.includes(m.sources[0]?.romaji),
    );
    return manga?.id;
  }
}

interface PassionManga {
  id: number;
  title: string;
  titleLength: number;
  publishers: Array<{
    id: number;
    name: string;
  }>;

  sources: Array<{
    id: 1712;
    romaji: 'Dandadan';
    title: 'ダンダダン';
    visible: true;
    type: 0;
    origin: 0;
    contributors: [
      {
        id: 3589;
        contributor: {
          id: 1633;
          name: 'Yukinobu Tatsu';
          visible: true;
        };
        role: 0;
      },
      {
        id: 3590;
        contributor: {
          id: 1633;
          name: 'Yukinobu Tatsu';
          visible: true;
        };
        role: 1;
      },
    ];
  }>;

  cover: string;
  print: boolean;
  digital: boolean;
}
