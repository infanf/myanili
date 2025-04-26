import { Injectable } from '@angular/core';
import { AnisearchAnimeList, AnisearchMangaList } from '@models/anisearch';
import { ExtRating } from '@models/components';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CacheService } from './cache.service';
import { DialogueService } from './dialogue.service';

@Injectable({
  providedIn: 'root',
})
export class AnisearchService {
  private backendUrl = `${environment.backend}anisearch/`;
  // @ts-ignore no-unused-variable
  private baseUrl = 'https://api.anisearch.com/';
  // @ts-ignore no-unused-variable
  private tokenUrl = 'https://www.anisearch.com/oauth/token';
  // @ts-ignore no-unused-variable
  private clientId = '';
  // @ts-ignore no-unused-variable
  private accessToken = '';
  // @ts-ignore no-unused-variable
  private refreshToken = '';

  private userSubject = new BehaviorSubject<AnisearchUser | undefined>(undefined);
  loggedIn = false;

  constructor(
    private cache: CacheService,
    private dialogue: DialogueService,
  ) {
    this.clientId = String(localStorage.getItem('anisearchClientId'));
    this.accessToken = String(localStorage.getItem('anisearchAccessToken'));
    this.refreshToken = String(localStorage.getItem('anisearchRefreshToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to AniSearch, please check your account settings.',
            'AniSearch Connection Error',
          );
          localStorage.removeItem('anisearchAccessToken');
        });
    }
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(): Promise<AnisearchUser | undefined> {
    if (this.accessToken) {
      // In a real implementation, this would verify the token and get user info
      // For now, we'll simulate a username based on the token existence
      this.loggedIn = true;
      return { id: 71765, username: 'infanf' };
    }
    this.loggedIn = false;
    return undefined;
  }

  async login(): Promise<void> {
    // Open OAuth login window
    const width = 600;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const loginWindow = window.open(
      `${this.backendUrl}auth`,
      'AniSearch Login',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Listen for the message from the login window
    const loginPromise = new Promise<void>((resolve, reject) => {
      const messageListener = (event: MessageEvent) => {
        if (event.data && event.data.anisearch === true) {
          window.removeEventListener('message', messageListener);
          loginWindow?.close();
          if (event.data.at) {
            this.accessToken = event.data.at;
            this.clientId = event.data.ci;
            localStorage.setItem('anisearchAccessToken', this.accessToken);
            localStorage.setItem('anisearchClientId', this.clientId);
            this.checkLogin().then(user => {
              this.userSubject.next(user);
              resolve();
            });
          } else {
            reject(new Error('Login failed'));
          }
        }
      };
      window.addEventListener('message', messageListener);
    });

    return loginPromise;
  }

  async logoff(): Promise<void> {
    this.accessToken = '';
    this.refreshToken = '';
    this.clientId = '';
    this.loggedIn = false;
    localStorage.removeItem('anisearchAccessToken');
    localStorage.removeItem('anisearchRefreshToken');
    localStorage.removeItem('anisearchClientId');
    this.userSubject.next(undefined);
  }

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

  async getId(malId: number, type: 'anime' | 'manga'): Promise<number | undefined> {
    const url = `${environment.anisearchUrl}${type}/${malId}`;
    const ids = await this.cache.fetch<number[]>(url);
    return ids?.[0];
  }

  /** @deprecated */
  async getIdByTitle(
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

export interface AnisearchUser {
  id: number;
  username: string;
}
