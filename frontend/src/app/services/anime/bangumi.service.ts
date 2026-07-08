import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ExtRating } from '../../models/components';
import { DialogueService } from '../dialogue.service';

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

  constructor(private dialogue: DialogueService) {
    this.accessToken = String(localStorage.getItem('bangumiAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('bangumiRefreshToken') || '');
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.user.next(user);
        })
        .catch(() => {
          this.dialogue.alert(
            'Could not connect to Bangumi, please check your account settings.',
            'Bangumi Connection Error',
          );
          localStorage.removeItem('bangumiAccessToken');
        });
    }
  }

  async checkLogin(secondTry = false): Promise<BangumiUser | undefined> {
    if (!this.accessToken) return undefined;
    const response = await fetch(this.userinfoUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (response.ok) {
      const user: BangumiUser = await response.json();
      this.isLoggedIn.next(true);
      return user;
    }
    if (response.status === 401 && !secondTry && (await this.refreshTokens())) {
      return this.checkLogin(true);
    }
    this.logout();
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
      const response = await fetch(`${this.baseUrl}/v0/search/subjects?limit=20`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        body: JSON.stringify({ keyword, filter: { type: [type] } }),
      });
      if (!response.ok) return [];
      const data = (await response.json()) as { data?: BangumiSubject[] };
      return data.data || [];
    } catch {
      return [];
    }
  }

  async getRating(subjectId: number | undefined): Promise<ExtRating | undefined> {
    if (!subjectId) return undefined;
    try {
      const response = await fetch(`${this.baseUrl}/v0/subjects/${subjectId}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
      });
      if (!response.ok) return undefined;
      const data = await response.json();
      const score: number = data?.rating?.score ?? 0;
      const total: number = data?.rating?.total ?? 0;
      if (!score) return undefined;
      return { nom: score, norm: score * 10, ratings: total };
    } catch {
      return undefined;
    }
  }
}
