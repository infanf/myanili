import { Injectable } from '@angular/core';

import { MalService } from './mal.service';
import { Anime, WatchStatus } from './models/anime';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  constructor(private malService: MalService) {}

  async list(status?: WatchStatus) {
    return this.malService.myList(status);
  }

  async getAnime(id: number) {
    return this.malService.get<Anime>('anime/' + id);
  }
}
