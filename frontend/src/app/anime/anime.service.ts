import { Injectable } from '@angular/core';

import { MalService } from '../mal.service';
import {
  Anime,
  AnimeExtension,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdate,
  WatchStatus,
} from '../models/anime';

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

  async getAnime(id: number) {
    const anime = await this.malService.get<Anime>('anime/' + id);
    const comments = anime.my_list_status?.comments;
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
}
