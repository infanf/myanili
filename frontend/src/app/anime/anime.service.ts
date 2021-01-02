import { Injectable } from '@angular/core';
import {
  Anime,
  AnimeExtension,
  AnimeNode,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdate,
  RelatedAnime,
  WatchStatus,
} from '@models/anime';

import { MalService } from '../mal.service';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  constructor(private malService: MalService) {}

  async list(status?: WatchStatus) {
    const animes = await this.malService.myList(status);
    return animes.map(anime => {
      const comments = anime.list_status.comments;
      if (!comments) return anime;
      try {
        const json = atob(comments);
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
        const json = atob(comments);
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
      const json = atob(comments);
      const my_extension = JSON.parse(json) as AnimeExtension;
      return { ...anime, my_extension };
    } catch (e) {}
    return anime;
  }

  async updateAnime(id: number, data: Partial<MyAnimeUpdate>): Promise<MyAnimeStatus> {
    return this.malService.put<MyAnimeStatus>('anime/' + id, data);
  }

  async getManga(id: number): Promise<RelatedAnime[]> {
    const jikanime = await this.malService.getJikan('anime', id);
    const mangas = [] as RelatedAnime[];
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
}
