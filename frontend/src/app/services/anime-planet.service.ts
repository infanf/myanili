import { Injectable } from '@angular/core';

import { LivechartService } from './anime/livechart.service';

@Injectable({
  providedIn: 'root',
})
export class AnimePlanetService {
  constructor(private livechart: LivechartService) {}

  async getSlug(livechartId?: number): Promise<string | undefined> {
    return this.livechart.getAnimePlanetId(livechartId);
  }
}
