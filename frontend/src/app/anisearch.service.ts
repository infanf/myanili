import { Injectable } from '@angular/core';
import { AnisearchList } from '@models/anisearch';
import { ExtRating } from '@models/components';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnisearchService {
  private backendUrl = `${environment.backend}anisearch/`;

  async getAnimes(query: string): Promise<AnisearchList> {
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

  async getMangas(query: string): Promise<AnisearchList> {
    if (query) {
      const url = `${this.backendUrl}manga/search/${query}`;
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

  async getRating(id?: number, type = 'anime'): Promise<ExtRating | undefined> {
    if (!id) return;
    const url = `${this.backendUrl}${type}/rating/${id}`;
    const result = await fetch(url);
    if (result.ok) {
      return result.json();
    }
    return;
  }
}
