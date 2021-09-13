import { Injectable } from '@angular/core';
import { RelatedAnime } from '@models/anime';
import {
  BakaManga,
  ListManga,
  Manga,
  MangaCharacter,
  MangaExtension,
  MyMangaStatus,
  MyMangaUpdate,
  ReadStatus,
} from '@models/manga';
import { Base64 } from 'js-base64';
import { environment } from 'src/environments/environment';

import { AnilistService } from '../anilist.service';
import { KitsuService } from '../kitsu.service';
import { MalService } from '../mal.service';

@Injectable({
  providedIn: 'root',
})
export class MangaService {
  constructor(
    private malService: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
  ) {}

  async list(status?: ReadStatus) {
    const mangas = await this.malService.myMangaList(status);
    return mangas.map(manga => {
      const comments = manga.list_status.comments;
      if (!comments) return manga;
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as MangaExtension;
        return { ...manga, my_extension } as ListManga;
      } catch (e) {}
      return manga;
    });
  }

  async getManga(id: number, extend = true) {
    const manga = await this.malService.get<Manga>('manga/' + id);
    const comments = manga.my_list_status?.comments;
    if (!manga.related_anime.length && extend) manga.related_anime_promise = this.getAnimes(id);
    if (!comments) return manga;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as MangaExtension;
      return { ...manga, my_extension };
    } catch (e) {}
    return manga;
  }

  async updateManga(
    ids: {
      malId: number;
      anilistId?: number;
      kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
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
          return this.anilist.updateEntry(ids.anilistId, {
            progress: data.num_chapters_read,
            progressVolumes: data.num_volumes_read,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: this.anilist.statusFromMal(data.status, data.is_rereading),
            notes: data.comments,
            repeat: data.num_times_reread,
          });
        }
        return;
      })(),
      (async () => {
        if (!ids.kitsuId) {
          ids.kitsuId = await this.kitsu.getId(ids.malId, 'manga');
        }
        if (!ids.kitsuId) return;
        return this.kitsu.updateEntry(ids.kitsuId, 'manga', {
          progress: data.num_chapters_read,
          ratingTwenty: (data.score || 0) * 2 || undefined,
          status: this.kitsu.statusFromMal(data.status),
          notes: data.comments,
          reconsuming: data.is_rereading,
          reconsumeCount: data.num_times_reread,
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
    ]);
    return true;
  }

  async getAnimes(id: number): Promise<RelatedAnime[]> {
    const jikmanga = await this.malService.getJikan('manga', id);
    const animes = [] as RelatedAnime[];
    for (const key in jikmanga.related) {
      if (!jikmanga.related[key]) continue;
      for (const related of jikmanga.related[key]) {
        if (related.type === 'anime') {
          animes.push({
            node: { id: related.mal_id, title: related.name },
            relation_type: key.replace(' ', '_').toLowerCase(),
            relation_type_formatted: key,
          });
        }
      }
    }
    return animes;
  }

  async getCharacters(id: number): Promise<MangaCharacter[]> {
    const result = await this.malService.getJikanData<{ characters?: MangaCharacter[] }>(
      `manga/${id}/characters`,
    );
    return result.characters || [];
  }

  async getBakaManga(id?: number): Promise<BakaManga | undefined> {
    if (!id) return;
    const request = await fetch(`${environment.backend}/baka/${id}`);
    if (request.ok) {
      const response = (await request.json()) as BakaManga;
      return response;
    }
    return;
  }
}
