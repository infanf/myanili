import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';
import { KitsuService } from '@services/kitsu.service';
import { environment } from 'src/environments/environment';

import { LivechartService } from './livechart.service';

@Injectable({
  providedIn: 'root',
})
export class AnidbService {
  private readonly baseUrl = environment.backend + 'anidb/httpapi';
  private readonly client = 'myanilist';
  private readonly clientver = 2;
  private readonly protover = 1;

  constructor(private kitsu: KitsuService, private livechart: LivechartService) {}

  private getUrl(params: { [key: string]: string }) {
    const url = new URL(this.baseUrl);
    url.searchParams.set('client', this.client);
    url.searchParams.set('clientver', this.clientver.toString());
    url.searchParams.set('protover', this.protover.toString());
    for (const key in params) {
      if (!params.hasOwnProperty(key)) continue;
      url.searchParams.set(key, params[key]);
    }
    return url;
  }

  private async getXml(params: { [key: string]: string }) {
    const response = await fetch(this.getUrl(params));
    const xml = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
  }

  async getId(
    ids: Partial<{
      kitsuId: number;
      livechartId: number;
    }>,
  ): Promise<number | undefined> {
    if (ids.kitsuId) {
      const kitsu = await this.kitsu.getExternalId(ids.kitsuId, 'anime', 'anidb');
      if (kitsu) return kitsu;
    }
    if (ids.livechartId) {
      const livechart = await this.livechart.getAnidbId(ids.livechartId);
      if (livechart) return livechart;
    }
    return;
  }

  async getRating(id?: number): Promise<ExtRating | undefined> {
    if (!id) return undefined;
    const xml = await this.getXml({
      request: 'anime',
      aid: id.toString(),
      'with-credits': '1',
    });
    const rating = xml.querySelector('ratings permanent');
    const count = Number(rating?.getAttribute('count'));
    if (!count) return undefined;
    const value = Number(rating?.textContent);
    if (!value) return undefined;
    return {
      nom: value,
      norm: value * 10,
      ratings: count,
    };
  }
}
