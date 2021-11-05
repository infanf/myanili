import { Injectable } from '@angular/core';
import { AnisearchAnimeList, AnisearchMangaList } from '@models/anisearch';
import { ExtRating } from '@models/components';
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

  async getMangas(query: string): Promise<AnisearchMangaList> {
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

  async getId(
    title: string,
    type: 'anime' | 'manga',
    meta: { parts?: number; year?: number },
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
        node => Number(node.year) === meta.year && Number(node.chapters) === meta.parts,
      );
      if (nodes.length === 1) {
        return nodes[0].id;
      }
    }
    return;
  }
}
