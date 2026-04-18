import { Injectable } from '@angular/core';
import { Anime } from '@models/anime';
import { CacheService } from '@services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class SeasonPlannerService {
  constructor(private cache: CacheService) {}

  async isSkipped(animeId: number, year: number, season: number): Promise<boolean> {
    const decision = await this.cache.getPlannerDecision(animeId, year, season);
    return decision === 'skip';
  }

  async getUndecidedAnimes(
    animes: Array<Partial<Anime>>,
    year: number,
    season: number,
  ): Promise<Array<Partial<Anime>>> {
    const results: Array<Partial<Anime>> = [];
    for (const anime of animes) {
      if (!anime.id) continue;
      if (anime.my_list_status) continue;
      const decision = await this.cache.getPlannerDecision(anime.id, year, season);
      if (decision === 'skip') continue;
      results.push(anime);
    }
    return results;
  }

  skip(animeId: number, year: number, season: number): void {
    this.cache.setPlannerDecision(animeId, year, season, 'skip');
  }

  askAgain(animeId: number, year: number, season: number): void {
    this.cache.setPlannerDecision(animeId, year, season, 'ask_again');
  }
}
