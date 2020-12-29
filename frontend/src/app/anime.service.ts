import { Injectable } from '@angular/core';

import { MalService } from './mal.service';
import { WatchStatus } from './models/anime';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  constructor(private malService: MalService) {}

  async list(status?: WatchStatus) {
    return this.malService.myList(status);
  }
}
