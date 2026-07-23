import { Injectable } from '@angular/core';
import { MyAnimeUpdate, WatchStatus } from '@models/anime';
import { MyMangaUpdate, ReadStatus } from '@models/manga';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ExtRating } from '../../models/components';
import { ConnectionStatusService } from '../connection-status.service';

interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: { large?: string; medium?: string; small?: string };
}

export interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  date?: string;
  summary?: string;
  meta_tags?: string[];
  images?: { large?: string; common?: string; medium?: string; small?: string; grid?: string };
}

@Injectable({
  providedIn: 'root',
})
export class BangumiService {
  private readonly baseUrl = 'https://api.bgm.tv';
  private readonly authUrl = `${environment.backend}bangumi/auth`;
  private readonly tokenUrl = `${environment.backend}bangumi/token`;
  private readonly userinfoUrl = `${environment.backend}bangumi/userinfo`;
  private readonly userAgent = 'myanili/2.0 (https://github.com/infanf/myanili)';
  private accessToken = '';
  private refreshToken = '';

  isLoggedIn = new BehaviorSubject<boolean>(false);
  user = new BehaviorSubject<BangumiUser | undefined>(undefined);

  constructor(private connection: ConnectionStatusService) {
    this.accessToken = String(localStorage.getItem('bangumiAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('bangumiRefreshToken') || '');
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.user.next(user);
          if (user) this.connection.clearError('bangumi');
        })
        .catch(() => {
          this.reportConnectionError();
        });
    }
  }

  private reportConnectionError() {
    this.connection.reportError(
      'bangumi',
      'Could not verify your Bangumi session. It may have expired – reconnect to renew it.',
    );
  }

  async checkLogin(secondTry = false): Promise<BangumiUser | undefined> {
    if (!this.accessToken) return undefined;
    const response = await fetch(this.userinfoUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (response.ok) {
      const user: BangumiUser = await response.json();
      this.isLoggedIn.next(true);
      this.connection.clearError('bangumi');
      return user;
    }
    if (response.status === 401 && !secondTry && (await this.refreshTokens())) {
      return this.checkLogin(true);
    }
    this.reportConnectionError();
    return undefined;
  }

  async login(): Promise<void> {
    if (await this.refreshTokens()) {
      this.user.next(await this.checkLogin());
      return;
    }
    return new Promise((resolve, reject) => {
      const popup = window.open(this.authUrl);
      const handler = (event: MessageEvent) => {
        if (!event.data?.bangumi) return;
        window.removeEventListener('message', handler);
        popup?.close();
        const { at, rt } = event.data;
        if (!at) {
          reject(new Error('Login failed'));
          return;
        }
        this.accessToken = at;
        this.refreshToken = rt;
        localStorage.setItem('bangumiAccessToken', at);
        localStorage.setItem('bangumiRefreshToken', rt);
        this.checkLogin().then(user => {
          this.user.next(user);
          resolve();
        }, reject);
      };
      window.addEventListener('message', handler);
    });
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;
    const url = new URL(this.tokenUrl);
    url.searchParams.append('refresh_token', this.refreshToken);
    const response = await fetch(url);
    if (!response.ok) return false;
    const data = (await response.json()) as { access_token: string; refresh_token: string };
    this.accessToken = data.access_token;
    localStorage.setItem('bangumiAccessToken', this.accessToken);
    this.refreshToken = data.refresh_token;
    localStorage.setItem('bangumiRefreshToken', this.refreshToken);
    return true;
  }

  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    this.connection.clearError('bangumi');
    localStorage.removeItem('bangumiAccessToken');
    localStorage.removeItem('bangumiRefreshToken');
    this.user.next(undefined);
    this.isLoggedIn.next(false);
  }

  async getAnimes(keyword: string): Promise<BangumiSubject[]> {
    return this.search(keyword, 2);
  }

  async getMangas(keyword: string): Promise<BangumiSubject[]> {
    return this.search(keyword, 1);
  }

  async getId(title: string, type: 'anime' | 'manga' = 'anime'): Promise<number | undefined> {
    if (!title) return undefined;
    const subjects = type === 'anime' ? await this.getAnimes(title) : await this.getMangas(title);
    const match = subjects.find(subject => subject.name === title || subject.name_cn === title);
    return match?.id;
  }

  private async search(keyword: string, type: 1 | 2): Promise<BangumiSubject[]> {
    if (!keyword) return [];
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/v0/search/subjects?limit=20`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        body: JSON.stringify({ keyword, filter: { type: [type] } }),
      });
      if (!response?.ok) return [];
      const data = (await response.json()) as { data?: BangumiSubject[] };
      return data.data || [];
    } catch {
      return [];
    }
  }

  async updateEntry(
    subjectId?: number,
    data?: Partial<MyAnimeUpdate | MyMangaUpdate> & { status: WatchStatus | ReadStatus },
    type: 'anime' | 'manga' = 'anime',
    secondTry = false,
  ): Promise<void> {
    if (!subjectId || !data || !this.accessToken) return;
    const body: { type?: number; rate?: number; ep_status?: number; vol_status?: number } = {
      type: mapStatus(data.status),
    };
    // Send rate whenever a score is explicitly present, including 0, which
    // Bangumi treats as "remove rating". Paths that only change progress/status
    // leave score undefined, so an existing rating is never wiped by accident.
    if (data.score !== undefined) body.rate = data.score;
    if (type === 'manga') {
      if ('num_chapters_read' in data) body.ep_status = data.num_chapters_read;
      if ('num_volumes_read' in data) body.vol_status = data.num_volumes_read;
    }
    const response = await fetch(`${this.baseUrl}/v0/users/-/collections/${subjectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      if (!secondTry && response.status === 401 && (await this.refreshTokens())) {
        return this.updateEntry(subjectId, data, type, true);
      }
      throw new Error(`Bangumi: HTTP ${response.status}`);
    }
    if (type === 'anime' && 'num_watched_episodes' in data && data.num_watched_episodes) {
      await this.updateEpisodes(subjectId, data.num_watched_episodes);
    }
  }

  async deleteEntry(subjectId?: number, secondTry = false): Promise<void> {
    if (!subjectId || !this.accessToken) return;
    const response = await fetch(`${this.baseUrl}/v0/users/-/collections/${subjectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    if (!response.ok) {
      if (!secondTry && response.status === 401 && (await this.refreshTokens())) {
        return this.deleteEntry(subjectId, true);
      }
      throw new Error(`Bangumi: HTTP ${response.status}`);
    }
  }

  private async updateEpisodes(subjectId: number, watched: number): Promise<void> {
    const episodeIds = await this.getEpisodeIds(subjectId);
    const ids = episodeIds.slice(0, watched);
    if (!ids.length) return;
    await fetch(`${this.baseUrl}/v0/users/-/collections/${subjectId}/episodes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ episode_id: ids, type: 2 }),
    }).catch(() => undefined);
  }

  private async getEpisodeIds(subjectId: number): Promise<number[]> {
    const episodes: Array<{ id: number; sort: number }> = [];
    const limit = 200;
    let offset = 0;
    try {
      for (;;) {
        const response = await this.fetchWithRetry(
          `${this.baseUrl}/v0/episodes?subject_id=${subjectId}&type=0&limit=${limit}&offset=${offset}`,
          { headers: { Accept: 'application/json', 'User-Agent': this.userAgent } },
        );
        if (!response?.ok) break;
        const page = (await response.json()) as {
          total?: number;
          data?: Array<{ id: number; sort: number }>;
        };
        if (!page.data?.length) break;
        episodes.push(...page.data);
        offset += limit;
        if (offset >= (page.total || 0)) break;
      }
    } catch {
      return [];
    }
    return episodes.sort((a, b) => a.sort - b.sort).map(episode => episode.id);
  }

  async getRating(subjectId: number | undefined): Promise<ExtRating | undefined> {
    if (!subjectId) return undefined;
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/v0/subjects/${subjectId}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
      });
      if (!response?.ok) return undefined;
      const data = await response.json();
      const score: number = data?.rating?.score ?? 0;
      const total: number = data?.rating?.total ?? 0;
      if (!score) return undefined;
      return { nom: score, norm: score * 10, ratings: total };
    } catch {
      return undefined;
    }
  }

  /**
   * Bangumi's API (behind Cloudflare) intermittently answers read requests with
   * a 504 Gateway Timeout. Retry transient 5xx and network failures with a short
   * backoff so lookups usually succeed on the next attempt. Never retries 4xx.
   * Resolves to undefined when every attempt fails on a network error.
   */
  private async fetchWithRetry(
    url: string,
    init?: RequestInit,
    retries = 2,
  ): Promise<Response | undefined> {
    const backoffs = [300, 800];
    for (let attempt = 0; ; attempt++) {
      const wait = backoffs[Math.min(attempt, backoffs.length - 1)];
      try {
        const response = await fetch(url, init);
        if (response.status >= 500 && attempt < retries) {
          await this.delay(wait);
          continue;
        }
        return response;
      } catch (error) {
        if (attempt < retries) {
          await this.delay(wait);
          continue;
        }
        return undefined;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function mapStatus(status?: WatchStatus | ReadStatus): number | undefined {
  switch (status) {
    case 'watching':
    case 'reading':
      return 3;
    case 'completed':
      return 2;
    case 'on_hold':
      return 4;
    case 'dropped':
      return 5;
    case 'plan_to_watch':
    case 'plan_to_read':
      return 1;
    default:
      return undefined;
  }
}
