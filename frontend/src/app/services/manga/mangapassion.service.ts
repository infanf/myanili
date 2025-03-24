import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';
import { getCountryCode } from '@zma-lab/user-geolocation';

@Injectable({
  providedIn: 'root',
})
export class MangapassionService {
  private baseUrl = 'https://api.manga-passion.de';

  constructor(private cache: CacheService) {}

  async searchManga(query: string) {
    if (!query) return [];
    const countryCode = await getCountryCode();
    if (!countryCode || !['DE', 'AT', 'CH', 'LI', 'NL', 'BE', 'LU'].includes(countryCode)) {
      return [];
    }
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
    id: number;
    romaji: string;
    title: string;
  }>;

  cover: string;
  print: boolean;
  digital: boolean;
}
