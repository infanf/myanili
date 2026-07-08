import { Injectable } from '@angular/core';
import { Anime } from '@models/anime';
import { LivechartService } from '@services/anime/livechart.service';
import { CacheService } from '@services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class SeasonPlannerService {
  constructor(
    private cache: CacheService,
    private livechart: LivechartService,
  ) {}

  async isSkipped(animeId: number, year: number, season: number): Promise<boolean> {
    const decision = await this.cache.getPlannerDecision(animeId, year, season);
    return decision === 'skip';
  }

  async getUndecidedAnimes(
    animes: Array<Partial<Anime>>,
    year: number,
    season: number,
  ): Promise<Array<Partial<Anime>>> {
    const skippedLivechartIds = new Set(await this.livechart.getSkippedAnimeIds());
    const results: Array<Partial<Anime>> = [];
    for (const anime of animes) {
      if (!anime.id) continue;
      if (anime.my_list_status) continue;
      const decision = await this.cache.getPlannerDecision(anime.id, year, season);
      if (decision === 'skip') continue;
      const livechartId = anime.my_extension?.livechartId;
      if (livechartId && skippedLivechartIds.has(livechartId)) continue;
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
