import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Anime,
  AnimeCharacter,
  AnimeExtension,
  AnimeNode,
  AnimeStaff,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdate,
  WatchStatus,
} from '@models/anime';
import { RelatedManga } from '@models/manga';
import { Base64 } from 'js-base64';
import { environment } from 'src/environments/environment';

import { MalService } from '../mal.service';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  constructor(private malService: MalService, private httpClient: HttpClient) {}

  async list(status?: WatchStatus) {
    const animes = await this.malService.myList(status);
    return animes.map(anime => {
      const comments = anime.list_status.comments;
      if (!comments) return anime;
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as AnimeExtension;
        return { ...anime, my_extension } as ListAnime;
      } catch (e) {}
      return anime;
    });
  }
  async season(year: number, season: number): Promise<Array<Partial<Anime>>> {
    const animes = (
      await this.malService.get<Array<{ node: AnimeNode }>>(`/animes/season/${year}/${season}`)
    ).map(anime => anime.node);
    return animes.map(anime => {
      const comments = anime.my_list_status?.comments;
      if (!comments) return anime;
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as AnimeExtension;
        return { ...anime, my_extension } as Anime;
      } catch (e) {}
      return anime as Anime;
    });
  }

  async getAnime(id: number) {
    const anime = await this.malService.get<Anime>('anime/' + id);
    const comments = anime.my_list_status?.comments;
    if (!anime.related_manga.length) anime.related_manga = await this.getManga(id);
    if (!comments) return anime;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as AnimeExtension;
      return { ...anime, my_extension };
    } catch (e) {}
    return anime;
  }

  async updateAnime(id: number, data: Partial<MyAnimeUpdate>): Promise<MyAnimeStatus> {
    return this.malService.put<MyAnimeStatus>('anime/' + id, data);
  }

  async getManga(id: number): Promise<RelatedManga[]> {
    const jikanime = await this.malService.getJikan('anime', id);
    const mangas = [] as RelatedManga[];
    for (const key in jikanime.related) {
      if (!jikanime.related[key]) continue;
      for (const related of jikanime.related[key]) {
        if (related.type === 'manga') {
          mangas.push({
            node: { id: related.mal_id, title: related.name },
            relation_type: key.replace(' ', '_').toLowerCase(),
            relation_type_formatted: key,
          });
        }
      }
    }
    return mangas;
  }

  async getCharacters(id: number): Promise<AnimeCharacter[]> {
    return new Promise((r, rj) => {
      this.httpClient
        .get<{ characters: AnimeCharacter[] }>(
          `${environment.jikanUrl}anime/${id}/characters_staff`,
        )
        .subscribe(result => {
          r(result.characters || []);
        });
    });
  }
  async getStaff(id: number): Promise<AnimeStaff[]> {
    return new Promise((r, rj) => {
      this.httpClient
        .get<{ staff: AnimeStaff[] }>(`${environment.jikanUrl}anime/${id}/characters_staff`)
        .subscribe(result => {
          r(result.staff || []);
        });
    });
  }
}
