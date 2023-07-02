import { Injectable } from '@angular/core';
import { AnisearchAnimeList, AnisearchMangaList } from '@models/anisearch';
import { ExtRating } from '@models/components';
import { environment } from 'src/environments/environment';

import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AnisearchService {
  private backendUrl = `${environment.backend}anisearch/`;

  constructor(private cache: CacheService) {}

  async getAnimes(query: string): Promise<AnisearchAnimeList> {
    if (query) {
      const url = `${this.backendUrl}anime/search/${encodeURI(
        query.replace(/[\/\\\?\#\&]/g, ' '),
      )}`;
      const result = await this.cache.fetch<AnisearchAnimeList>(url);
      return (
        result || {
          link: '',
          page: 1,
          pages: 1,
          nodes: [],
        }
      );
    }
    return {
      link: '',
      page: 1,
      pages: 1,
      nodes: [],
    };
  }

  async getMangas(query: string): Promise<AnisearchMangaList> {
    if (query) {
      const url = `${this.backendUrl}manga/search/${query}`;
      const result = await this.cache.fetch<AnisearchMangaList>(url);
      return (
        result || {
          link: '',
          page: 1,
          pages: 1,
          nodes: [],
        }
      );
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
    return this.cache.fetch<ExtRating>(url);
  }

  async getId(
    title: string,
    type: 'anime' | 'manga',
    meta: { parts?: number; volumes?: number; year?: number },
  ): Promise<number | undefined> {
    if (!title) return;
    if (type === 'anime') {
      const list = await this.getAnimes(title);

      const nodes = list.nodes.filter(
        node => Number(node.year) === meta.year && Number(node.episodes) === meta.parts,
      );
      if (nodes.length === 1) {
        return nodes[0].id;
      }
    } else {
      const list = await this.getMangas(title);
      const nodes = list.nodes.filter(
        node =>
          Math.abs(Number(node.year) - (meta.year || 0)) <= 1 &&
          (Number(node.chapters) === meta.parts || Number(node.volumes) === meta.volumes),
      );
      if (nodes.length === 1) {
        return nodes[0].id;
      }
    }
    return;
  }

  async getRelated(id: number, type: 'anime' | 'manga'): Promise<AnisearchRelated[]> {
    const url = `${this.backendUrl}${type}/relations/${id}`;
    const result = await this.cache.fetch<AnisearchRelated[]>(url);
    return result || [];
  }
}

export interface AnisearchRelated {
  type: 'anime' | 'manga' | 'movie';
  title: string;
  link: string;
  id: number;
  poster?: string;
  relation: string;
  media_type: string;
  episodes: number;
  volumes: number;
  year: number;
  genres: string[];
}
