import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class MangadexService {
  readonly baseUrl = 'https://api.mangadex.org';

  constructor(private cache: CacheService) {}

  async searchManga(query: string) {
    if (!query) return [];
    const { data: mangas } = await this.cache.fetch<{ data: Manga[] }>(
      `${this.baseUrl}/manga?title=${query}`,
    );
    return mangas;
  }

  async getByMalId(malId: number, title: string) {
    const mangas = await this.searchManga(title);
    const manga = mangas.find(mdManga => Number(mdManga.attributes?.links?.mal) === malId);
    return manga;
  }

  async getManga(mangaId?: string) {
    if (!mangaId) return;
    const { data: manga } = await this.cache.fetch<{ data?: Manga }>(
      `${this.baseUrl}/manga/${mangaId}`,
    );
    return manga;
  }

  async getMangaRating(mangaId?: UUID) {
    if (!mangaId) return;
    const { statistics } = await this.cache.fetch<{ statistics: Statistics }>(
      `${this.baseUrl}/statistics/manga/${mangaId}`,
    );
    return statistics;
  }

  // async getMangaChapters(mangaId?: UUID) {
  //   if (!mangaId) return;
  //   const { data: chapters } = await this.cache.fetch<{ data: {} }>(
  //     `${this.baseUrl}/manga/${mangaId}/aggregate`,
  //   );
  //   return chapters;
  // }
}

interface Manga {
  id: UUID;
  type: string;
  attributes: Partial<{
    isLocked: boolean;
    links: Partial<{
      al: string;
      ap: string;
      bw: string;
      kt: string;
      mu: string;
      amz: string;
      ebj: string;
      mal: string;
    }>;
    originalLanguage: string;
    lastVolume?: string;
    lastChapter?: string;
    publicationDemographic: 'shounen' | 'shoujo' | 'seinen' | 'josei';
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    contentRating: string;
    title: {
      en: string;
    };
    altTitles: [
      {
        [lang: string]: string;
      },
    ];
    description: {
      en: string;
    };
    year: number;
    tags: [
      {
        id: UUID;
        type: 'tag';
        attributes: {
          name: {
            en: string;
          };
          description: {};
          group: 'format' | 'theme' | 'content' | 'genre';
          version: 1;
        };
      },
    ];
    state: 'published' | 'unpublished';
    chapterNumbersResetOnNewVolume: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    availableTranslatedLanguages: [string];
    latestUploadedChapter: UUID;
  }>;
  relationships: [
    {
      id: UUID;
      type: string;
      related?: string;
    },
  ];
}

type UUID = string;

interface Statistics {
  [id: UUID]: {
    comments: {
      threadId: number;
      repliesCount: number;
    };
    rating: {
      average: number;
      bayesian: number;
      distribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
        '6': number;
        '7': number;
        '8': number;
        '9': number;
        '10': number;
      };
    };
    follows: number;
  };
}
