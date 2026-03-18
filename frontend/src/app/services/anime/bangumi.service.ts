import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ExtRating } from '../../models/components';

interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: { large?: string; medium?: string; small?: string };
}

@Injectable({
  providedIn: 'root',
})
export class BangumiService {
  private readonly baseUrl = 'https://api.bgm.tv';
  private readonly authUrl = `${environment.backend}bangumi/auth`;
  private readonly userinfoUrl = `${environment.backend}bangumi/userinfo`;
  private readonly userAgent = 'myanili/2.0 (https://github.com/infanf/myanili)';
  private accessToken = '';

  isLoggedIn = new BehaviorSubject<boolean>(false);
  user = new BehaviorSubject<BangumiUser | undefined>(undefined);

  constructor() {
    this.accessToken = String(localStorage.getItem('bangumiAccessToken') || '');
    if (this.accessToken) {
      this.checkLogin();
    }
  }

  private async checkLogin(): Promise<void> {
    try {
      const response = await fetch(this.userinfoUrl, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (response.ok) {
        const user: BangumiUser = await response.json();
        this.user.next(user);
        this.isLoggedIn.next(true);
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }

  async login(): Promise<void> {
    return new Promise((resolve, reject) => {
      const popup = window.open(this.authUrl, 'bangumi_auth', 'width=600,height=700');
      const handler = (event: MessageEvent) => {
        if (!event.data?.bangumi) return;
        window.removeEventListener('message', handler);
        popup?.close();
        const { at, rt } = event.data;
        this.accessToken = at;
        localStorage.setItem('bangumiAccessToken', at);
        localStorage.setItem('bangumiRefreshToken', rt);
        this.checkLogin().then(resolve).catch(reject);
      };
      window.addEventListener('message', handler);
    });
  }

  logout(): void {
    this.accessToken = '';
    localStorage.removeItem('bangumiAccessToken');
    localStorage.removeItem('bangumiRefreshToken');
    this.user.next(undefined);
    this.isLoggedIn.next(false);
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
