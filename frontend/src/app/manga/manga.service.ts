import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RelatedAnime } from '@models/anime';
import {
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
    private httpClient: HttpClient,
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
    if (!manga.related_anime.length && extend) manga.related_anime = await this.getAnimes(id);
    if (!comments) return manga;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as MangaExtension;
      return { ...manga, my_extension };
    } catch (e) {}
    return manga;
  }

  async updateManga(id: number, data: Partial<MyMangaUpdate>): Promise<MyMangaStatus> {
    const [malResponse] = await Promise.all([
      this.malService.put<MyMangaStatus>('manga/' + id, data),
      (async () => {
        if (this.anilist.loggedIn) {
          const anilistId = await this.anilist.getId(id, 'MANGA');
          if (!anilistId) return;
          return this.anilist.updateEntry(anilistId, {
            progress: data.num_chapters_read,
            progressVolumes: data.num_volumes_read,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: this.anilist.statusFromMal(data.status),
            notes: data.comments,
            repeat: data.num_times_reread,
          });
        }
        return;
      })(),
      (async () => {
        const kitsuId = await this.kitsu.getId(id, 'manga');
        if (!kitsuId) return;
        return this.kitsu.updateEntry(Number(kitsuId.kitsuId), 'manga', {
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
    return new Promise((r, rj) => {
      this.httpClient
        .get<{ characters: MangaCharacter[] }>(`${environment.jikanUrl}manga/${id}/characters`)
        .subscribe(result => {
          r(result.characters || []);
        });
    });
  }
}
