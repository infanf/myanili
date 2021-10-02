import { Injectable } from '@angular/core';
import { AnisearchAnimeList } from '@models/anisearch';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnisearchService {
  private backendUrl = `${environment.backend}anisearch/`;

  async getAnimes(query: string): Promise<AnisearchAnimeList> {
    if (query) {
      const url = `${this.backendUrl}anime/search/${query}`;
      const result = await fetch(url);
      if (result.ok) {
        return result.json();
      }
    }
    return {
      link: '',
      page: 1,
      pages: 1,
      nodes: [],
    };
  }
}
