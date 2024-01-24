import { Injectable } from '@angular/core';
import { CacheService } from '@services/cache.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MangadexService {
  private baseUrl = environment.backend + 'mangadex';

  constructor(private cache: CacheService) {}

  async searchManga(query: string) {
    if (!query) return [];
    const { data: mangas } = await this.cache
      .fetch<{ data: Manga[] }>(`${this.baseUrl}/manga?title=${query}`)
      .catch(() => ({ data: [] } as { data: Manga[] }));
    return mangas;
  }

  async getByMalId(malId: number, title: string) {
    const mangas = await this.searchManga(title);
    const manga = mangas.find(mdManga => Number(mdManga.attributes?.links?.mal) === malId);
    return manga;
  }

  async getManga(mangaId?: string) {
    if (!mangaId) return;
    const { data: manga } = await this.cache
      .fetch<{ data?: Manga }>(`${this.baseUrl}/manga/${mangaId}`)
      .catch(() => ({ data: undefined } as { data?: Manga }));
    return manga;
  }

  async getMangaRating(mangaId?: UUID) {
    if (!mangaId) return;
    const { statistics } = await this.cache
      .fetch<{ statistics: Statistics }>(`${this.baseUrl}/statistics/manga/${mangaId}`)
      .catch(() => ({ statistics: {} } as { statistics: Statistics }));
    return statistics;
  }

  async getMangaVolumes(mangaId?: UUID) {
    if (!mangaId) return;
    interface Volumes {
      volumes: { [volume: string]: Volume };
    }
    const { volumes } = await this.cache
      .fetch<Volumes>(`${this.baseUrl}/manga/${mangaId}/aggregate`)
      .catch(() => ({ volumes: {} } as Volumes));
    return volumes;
  }

  async getChapterVolumeMapping(mangaId: UUID) {
    const volumes = await this.getMangaVolumes(mangaId);
    const mapping: number[] = [];
    for (const volumeNo in volumes) {
      if (!volumes.hasOwnProperty(volumeNo)) continue;
      const volume = volumes[volumeNo];
      for (const chapterNo in volume.chapters) {
        if (!volume.chapters.hasOwnProperty(chapterNo)) continue;
        if (Number(chapterNo) % 1) continue;
        mapping[Number(chapterNo)] = Math.max(
          Number(volumeNo) || 0,
          mapping[Number(chapterNo)] || 0,
        );
      }
    }
    return mapping;
  }

  async getVolume(mangaId: UUID, chapter: number) {
    const mapping = await this.getChapterVolumeMapping(mangaId);
    if (mapping[chapter]) {
      const volumeChapters = mapping.filter(v => v === mapping[chapter]);
      const chapters = Object.keys(volumeChapters).map(Number);
      return {
        volume: mapping[chapter],
        last: Math.max(...chapters) === chapter,
      };
    }
    const data = { volume: 0, last: true };
    for (const chapterNo in mapping) {
      if (!mapping.hasOwnProperty(chapterNo)) continue;
      if (Number(chapterNo) > chapter) {
        break;
      }
      data.volume = Math.max(mapping[chapterNo] || 0, data.volume || 0);
    }
    return data;
  }

  async getChapter(mangaId: UUID, volume: number) {
    const volumes = await this.getMangaVolumes(mangaId);
    const chapters = { first: 0, last: 0 };
    if (!volumes) return;
    if (!(String(volume) in volumes)) return;
    for (const chapterNo in volumes[String(volume)].chapters) {
      if (!volumes[String(volume)].chapters.hasOwnProperty(chapterNo)) continue;
      chapters.first = Math.min(chapters.first, Number(chapterNo));
      chapters.last = Math.max(chapters.last, Number(chapterNo));
    }
    return chapters;
  }
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

interface Volume {
  volume: string;
  count: number;
  chapters: {
    [chapterNo: string]: Chapter;
  };
}

interface Chapter {
  id: UUID;
  chapter: '156';
  others: UUID[];
  count: number;
}
