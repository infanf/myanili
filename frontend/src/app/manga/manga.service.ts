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

import { MalService } from '../mal.service';

@Injectable({
  providedIn: 'root',
})
export class MangaService {
  constructor(private malService: MalService, private httpClient: HttpClient) {}

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

  async getManga(id: number) {
    const manga = await this.malService.get<Manga>('manga/' + id);
    const comments = manga.my_list_status?.comments;
    if (!manga.related_anime.length) manga.related_anime = await this.getAnimes(id);
    if (!comments) return manga;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as MangaExtension;
      return { ...manga, my_extension };
    } catch (e) {}
    return manga;
  }

  async updateManga(id: number, data: Partial<MyMangaUpdate>): Promise<MyMangaStatus> {
    return this.malService.put<MyMangaStatus>('manga/' + id, data);
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
