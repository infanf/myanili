import { Injectable } from '@angular/core';
import { statusFromMal } from '@models/anilist';
import { RelatedAnime } from '@models/anime';
import { Jikan4MangaCharacter, Jikan4WorkRelation } from '@models/jikan';
import {
  BakaManga,
  BakaMangaList,
  ListManga,
  Manga,
  MangaExtension,
  MyMangaStatus,
  MyMangaUpdate,
  ReadStatus,
} from '@models/manga';
import { ShikimoriService } from '@services/shikimori.service';
import { Base64 } from 'js-base64';
import { DateTime } from 'luxon';
import { environment } from 'src/environments/environment';
import { compareTwoStrings } from 'string-similarity';

import { AnilistService } from '../anilist.service';
import { CacheService } from '../cache.service';
import { KitsuService } from '../kitsu.service';
import { MalService } from '../mal.service';

import { MangaupdatesService } from './mangaupdates.service';

@Injectable({
  providedIn: 'root',
})
export class MangaService {
  constructor(
    private malService: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private shikimori: ShikimoriService,
    private baka: MangaupdatesService,
    private cache: CacheService,
  ) {}

  async list(status?: ReadStatus, options?: { limit?: number; offset?: number }) {
    options = { limit: 50, offset: 0, ...options };
    const mangas = await this.malService.myMangaList(status, options);
    return Promise.all(
      mangas.map(async manga => {
        if (manga.node.title) {
          const mangaToSave = {
            id: manga.node.id,
            title: manga.node.title,
            created_at: new Date(),
            updated_at: manga.list_status.updated_at,
            mean: 0,
            media_type: manga.node.media_type || 'unknown',
            num_list_users: 0,
            num_scoring_users: 0,
            recommendations: [],
            related_manga: [],
            related_anime: [],
            genres: [],
            pictures: [],
          };
          this.cache.saveValues(manga.node.id, 'manga', mangaToSave);
        }
        const comments = manga.list_status.comments;
        if (!comments) return manga;
        try {
          const json = Base64.decode(comments);
          const my_extension = JSON.parse(json || '{}') as MangaExtension;
          return { ...manga, my_extension } as ListManga;
        } catch (e) {}
        return manga;
      }),
    );
  }

  async getManga(id: number, extend = true) {
    const manga = await this.malService.get<Manga>('manga/' + id);
    const extension = manga.my_list_status?.comments;
    if (!manga.related_anime.length && extend) manga.related_anime_promise = this.getAnimes(id);
    const mangaToSave = { ...manga } as Partial<Manga>;
    delete mangaToSave.my_list_status;
    delete mangaToSave.related_anime_promise;
    if (extension) {
      try {
        const json = Base64.decode(extension);
        const my_extension = JSON.parse(json || '{}') as MangaExtension;
        manga.my_extension = my_extension;
        mangaToSave.my_extension = my_extension;
      } catch (e) {}
    }
    this.cache.saveValues(manga.id, 'manga', mangaToSave, true);
    return manga;
  }

  async updateManga(
    ids: {
      malId: number;
      anilistId?: number;
      kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
      bakaId?: number | string;
    },
    data: Partial<MyMangaUpdate>,
  ): Promise<MyMangaStatus> {
    const [malResponse] = await Promise.all([
      this.malService.put<MyMangaStatus>('manga/' + ids.malId, data),
      (async () => {
        if (this.anilist.loggedIn) {
          if (!ids.anilistId) {
            ids.anilistId = await this.anilist.getId(ids.malId, 'MANGA');
          }
          if (!ids.anilistId) return;
          const startDate = data.start_date ? DateTime.fromISO(data.start_date) : undefined;
          const finishDate = data.finish_date ? DateTime.fromISO(data.finish_date) : undefined;
          return this.anilist.updateEntry(ids.anilistId, {
            progress: data.num_chapters_read,
            progressVolumes: data.num_volumes_read,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: statusFromMal(data.status, data.is_rereading),
            notes: data.comments,
            repeat: data.num_times_reread,
            startedAt: startDate
              ? {
                  year: startDate.year,
                  month: startDate.month,
                  day: startDate.day,
                }
              : undefined,
            completedAt: finishDate
              ? {
                  year: finishDate.year,
                  month: finishDate.month,
                  day: finishDate.day,
                }
              : undefined,
          });
        }
        return;
      })(),
      (async () => {
        if (!ids.kitsuId) {
          ids.kitsuId = await this.kitsu.getId({ id: ids.malId }, 'manga');
        }
        if (!ids.kitsuId) return;
        return this.kitsu.updateEntry(ids.kitsuId, 'manga', {
          progress: data.num_chapters_read,
          ratingTwenty: (data.score || 0) * 2 || undefined,
          status: this.kitsu.statusFromMal(data.status),
          notes: data.comments,
          startedAt: data.start_date,
          finishedAt: data.finish_date,
          reconsuming: data.is_rereading,
          reconsumeCount: data.num_times_reread,
        });
      })(),
      this.shikimori.updateMedia({
        target_id: ids.malId,
        target_type: 'Manga',
        score: data.score,
        status: data.is_rereading ? 'rewatching' : this.shikimori.statusFromMal(data.status),
        chapters: data.num_chapters_read,
        volumes: data.num_volumes_read,
        rewatches: data.num_times_reread,
      }),
      (async () => {
        if (!ids.bakaId) return;
        const cleanId = await this.baka.getId(ids.bakaId);
        if (!cleanId) return;
        return this.baka.updateSeries(cleanId, {
          chapters: data.num_chapters_read,
          volumes: data.num_volumes_read,
          list: this.baka.statusFromMal(data.status),
          rating: data.score,
        });
      })(),
    ]);
    return malResponse;
  }

  async deleteManga(ids: {
    malId: number;
    anilistId?: number;
    kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  }) {
    await Promise.all([
      this.malService.delete<boolean>('manga/' + ids.malId),
      this.anilist.deleteEntry(ids.anilistId),
      this.kitsu.deleteEntry(ids.kitsuId, 'manga'),
      this.shikimori.deleteMedia(ids.malId, 'Manga'),
    ]);
    return true;
  }

  async getAnimes(id: number): Promise<RelatedAnime[]> {
    const relationTypes =
      (await this.malService.getJikanData<Jikan4WorkRelation[]>(`manga/${id}/relations`)) || [];
    const animes = [] as RelatedAnime[];
    for (const relationType of relationTypes) {
      for (const related of relationType.entry) {
        if (related.type === 'anime') {
          animes.push({
            node: { id: related.mal_id, title: related.name },
            relation_type: relationType.relation.replace(' ', '_').toLowerCase(),
            relation_type_formatted: relationType.relation,
          });
        }
      }
    }
    return animes;
  }

  async getCharacters(id: number): Promise<Jikan4MangaCharacter[]> {
    const characters = await this.malService.getJikanData<Jikan4MangaCharacter[]>(
      `manga/${id}/characters`,
    );
    return characters || [];
  }

  async getBakaManga(id?: number | string): Promise<BakaManga | undefined> {
    if (!id) return;
    const request = await fetch(`${environment.backend}baka/manga/${id}`);
    if (request.ok) {
      const response = (await request.json()) as BakaManga;
      return response;
    }
    return;
  }

  async getBakaMangas(title: string): Promise<BakaMangaList | undefined> {
    if (!title) return;
    const request = await fetch(`${environment.backend}baka/search/${title}`);
    if (request.ok) {
      const response = (await request.json()) as BakaMangaList;
      return response;
    }
    return;
  }

  async getBakaMangaId(manga: Manga): Promise<number | string | undefined> {
    const mangas = await this.getBakaMangas(manga.title);
    if (!mangas) return;
    const bakaMangas = mangas.mangas.filter(m => {
      const mangaStart = manga.start_date ? new Date(manga.start_date).getFullYear() : 0;
      return Math.abs(m.year - mangaStart) <= 1;
    });
    if (bakaMangas.length === 1) return bakaMangas[0].id;
    const bakaMangasByTitle = bakaMangas.filter(m => compareTwoStrings(m.title, manga.title) > 0.9);
    if (bakaMangasByTitle.length === 1) return bakaMangasByTitle[0].id;
    return bakaMangas.find(m => m.title.toLowerCase() === manga.title.toLowerCase())?.id;
  }

  async getPoster(id: number): Promise<string | undefined> {
    let manga;
    try {
      manga = await this.cache.getValues<Manga>(id, 'manga');
    } catch (e) {}
    if (!manga?.main_picture) manga = await this.getManga(id);
    return manga?.main_picture?.large || manga?.main_picture?.medium;
  }
}
