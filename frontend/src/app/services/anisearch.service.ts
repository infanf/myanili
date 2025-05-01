import { Injectable } from '@angular/core';
import { MyAnimeUpdate, WatchStatus } from '@models/anime';
import { AnisearchAnimeList, AnisearchMangaList } from '@models/anisearch';
import { ExtRating } from '@models/components';
import { MyMangaUpdate, ReadStatus } from '@models/manga';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CacheService } from './cache.service';
import { DialogueService } from './dialogue.service';

@Injectable({
  providedIn: 'root',
})
export class AnisearchService {
  private backendUrl = `${environment.backend}anisearch/`;
  private baseUrl = 'https://api.anisearch.com/';
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';

  private userSubject = new BehaviorSubject<AnisearchUser | undefined>(undefined);
  loggedIn = false;

  constructor(
    private cache: CacheService,
    private dialogue: DialogueService,
  ) {
    this.clientId = String(localStorage.getItem('anisearchClientId') || '');
    this.accessToken = String(localStorage.getItem('anisearchAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('anisearchRefreshToken') || '');
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to aniSearch, please check your account settings.',
            'aniSearch Connection Error',
          );
          localStorage.removeItem('anisearchAccessToken');
        });
    }
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(secondTry = false): Promise<AnisearchUser | undefined> {
    if (!this.accessToken || !this.clientId) return;
    const result = await fetch(`${this.baseUrl}v1/my/profile`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (result.ok) {
      const { id, name: username } = (await result.json()) as { id: number; name: string };
      this.loggedIn = true;
      return { id, username };
    } else if (result.status === 401 && !secondTry && (await this.refreshTokens())) {
      return this.checkLogin(true);
    }
    this.loggedIn = false;
    return;
  }

  async login(): Promise<void> {
    if (await this.refreshTokens()) return;
    // Open OAuth login window
    const loginWindow = window.open(`${this.backendUrl}auth`, 'aniSearch Login');

    // Listen for the message from the login window
    const loginPromise = new Promise<void>((resolve, reject) => {
      const messageListener = (event: MessageEvent) => {
        if (event.data && event.data.anisearch === true) {
          window.removeEventListener('message', messageListener);
          loginWindow?.close();
          if (event.data.at) {
            this.accessToken = event.data.at;
            this.refreshToken = event.data.rt;
            this.clientId = event.data.ci || '';
            localStorage.setItem('anisearchAccessToken', this.accessToken);
            localStorage.setItem('anisearchRefreshToken', this.refreshToken);
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

  private async refreshTokens() {
    if (!this.refreshToken) return false;
    const formData = new FormData();
    formData.append('refresh_token', this.refreshToken);
    const response = await fetch(`${this.backendUrl}token`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { access_token: string; refresh_token: string };
    this.accessToken = data.access_token;
    localStorage.setItem('anisearchAccessToken', this.accessToken);
    this.refreshToken = data.refresh_token;
    localStorage.setItem('anisearchRefreshToken', this.refreshToken);
    return true;
  }

  async logoff(): Promise<void> {
    const body = new FormData();
    body.append('refresh_token', this.refreshToken);
    await fetch(`${this.backendUrl}logoff`, {
      method: 'POST',
      body,
    }).catch(console.error);
    this.accessToken = '';
    this.refreshToken = '';
    this.clientId = '';
    this.loggedIn = false;
    localStorage.removeItem('anisearchAccessToken');
    localStorage.removeItem('anisearchRefreshToken');
    localStorage.removeItem('anisearchClientId');
    this.userSubject.next(undefined);
  }

  async deleteEntry(
    id?: number,
    type: 'anime' | 'manga' = 'anime',
    secondTry = false,
  ): Promise<void> {
    if (!id) return;
    const url = `${this.baseUrl}v1/my/${type}/${id}/ratings`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok) {
      if (!secondTry && response.status === 401 && (await this.refreshTokens())) {
        return this.deleteEntry(id, type, true);
      }
      console.error('Failed to delete entry');
    }
  }

  async updateEntry(
    id?: number,
    data?: Partial<MyAnimeUpdate | MyMangaUpdate> & { status: WatchStatus | ReadStatus },
    type: 'anime' | 'manga' = 'anime',
    secondTry = false,
  ): Promise<void> {
    if (!id || !data) return;
    const url = `${this.baseUrl}v1/my/${type}/${id}/ratings`;
    const anisearchData = convertToAnisearchRating(data);
    const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(anisearchData),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok) {
      if (!secondTry && response.status === 401 && (await this.refreshTokens())) {
        return this.updateEntry(id, data, type, true);
      }
      console.error('Failed to update entry');
    }
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

function convertToAnisearchRating(data: Partial<MyAnimeUpdate | MyMangaUpdate>): AnisearchUpdate {
  return {
    status: mapStatus(data.status) || 'not_interested',
    public_rating: data.score,
    episodes_watched: 'num_watched_episodes' in data ? data.num_watched_episodes || 0 : undefined,
    chapters_read: 'num_chapters_read' in data ? data.num_chapters_read || 0 : undefined,
    volumes_read: 'num_volumes_read' in data ? data.num_volumes_read || 0 : undefined,
    start_date: data.start_date,
    end_date: data.finish_date,
    is_rewatching: 'is_rewatching' in data ? data.is_rewatching : undefined,
    is_rereading: 'is_rereading' in data ? data.is_rereading : undefined,
    times_rewatched: 'num_times_rewatched' in data ? data.num_times_rewatched || 0 : undefined,
    times_reread: 'num_times_reread' in data ? data.num_times_reread || 0 : undefined,
    notes: data.comments,
    priority: data.priority,
    touch: true,
  };
}

function mapStatus(status?: WatchStatus | ReadStatus): AnisearchStatus | undefined {
  if (!status) return undefined;
  switch (status) {
    case 'watching':
    case 'reading':
      return 'ongoing';
    case 'plan_to_read':
    case 'plan_to_watch':
      return 'bookmark';
    case 'completed':
      return 'completed';
    case 'on_hold':
      return 'on_hold';
    case 'dropped':
      return 'dropped';
    default:
      return 'not_interested';
  }
}

type AnisearchStatus =
  | 'ongoing'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'not_interested'
  | 'bookmark';

type AnisearchUpdate = Partial<AnisearchRating> & {
  status: AnisearchStatus;
};

interface AnisearchRating {
  status: AnisearchStatus;
  is_visible: boolean;
  public_rating: number;
  public_fraction: number;
  personal_rating: number;
  episodes_watched: number;
  chapters_read: number;
  volumes_read: number;
  start_date: string;
  end_date: string;
  is_rewatching: boolean;
  is_rereading: boolean;
  times_rewatched: number;
  times_reread: number;
  rewatch_desire: number;
  reread_desire: number;
  notes: string;
  priority: number;
  touch: boolean;
}
