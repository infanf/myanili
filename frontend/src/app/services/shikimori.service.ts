import { Injectable } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { ReadStatus } from '@models/manga';
import { ShikimoriRate, ShikimoriRateStatus, ShikimoriUser } from '@models/shikimori';
import { Client } from '@urql/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { DialogueService } from './dialogue.service';

@Injectable({
  providedIn: 'root',
})
export class ShikimoriService {
  private readonly baseUrl = 'https://shikimori.one/api';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<ShikimoriUser | undefined>(undefined);
  private loggedIn = false;
  private client!: Client;

  constructor(private dialogue: DialogueService) {
    this.accessToken = String(localStorage.getItem('shikimoriAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('shikimoriRefreshToken') || '');

    const { createClient, cacheExchange, fetchExchange } =
      require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://shikimori.one/api/graphql',
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to Shikimori, please check your account settings.',
            'Shikimori Connection Error',
          );
          localStorage.removeItem('shikimoriAccessToken');
        });
    }
  }

  async login() {
    if (await this.refreshTokens()) return true;
    return new Promise(r => {
      const loginWindow = window.open(`${environment.backend}shikimori/auth`);
      window.addEventListener('message', async event => {
        if (event.data && event.data.shikimori) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('shikimoriAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('shikimoriRefreshToken', this.refreshToken);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(true);
      });
    });
  }

  private async refreshTokens() {
    if (!this.refreshToken) return false;
    const url = new URL(`${environment.backend}shikimori/token`);
    url.searchParams.append('refresh_token', this.refreshToken);
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { access_token: string; refresh_token: string };
    this.accessToken = data.access_token;
    localStorage.setItem('shikimoriAccessToken', this.accessToken);
    this.refreshToken = data.refresh_token;
    localStorage.setItem('shikimoriRefreshToken', this.refreshToken);
    return true;
  }

  logoff() {
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('shikimoriAccessToken');
    localStorage.removeItem('shikimoriRefreshToken');
  }

  async checkLogin(refresh = true): Promise<ShikimoriUser | undefined> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      {
        currentUser {
          id
          avatarUrl
          nickname
        }
      }
    `;

    const result = await this.client
      .query<{ currentUser: ShikimoriUser }>(QUERY, {})
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    if (result?.error?.response.status === 401) {
      if (refresh && (await this.login())) {
        return this.checkLogin(false);
      }
      this.logoff();
      return;
    }
    const requestResult = result?.data?.currentUser;
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async getRating(id: number, type: 'anime' | 'manga') {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query Media($id: String) {
        ${type}s(ids: $id) {
          id
          score
          scoresStats { score count }
        }
      }
    `;
    const result = await this.client
      .query<{
        animes?: Array<{
          id: number;
          score: number;
          scoresStats: Array<{ score: number; count: number }>;
        }>;
        mangas?: Array<{
          id: number;
          score: number;
          scoresStats: Array<{ score: number; count: number }>;
        }>;
      }>(QUERY, { id: String(id) })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const data = result?.data?.animes?.[0] || result?.data?.mangas?.[0];
    if (!data?.scoresStats) return undefined;
    const ratings = data.scoresStats.map(a => a.count).reduce((a, b) => a + b);
    const nom = ratings ? data.scoresStats.reduce((a, b) => a + b.score * b.count, 0) / ratings : 0;
    return {
      nom,
      norm: nom * 10,
      ratings,
    };
  }

  async updateMedia(data: Partial<ShikimoriRate>) {
    const user = this.userSubject.getValue();
    if (!user || !this.loggedIn) return;
    if (!data.target_id) return;
    if (!data.target_type) return;
    data.user_id = user.id;
    const url = `${this.baseUrl}/v2/user_rates`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.log(response);
      return;
    }
    const result = await response.json();
    return result;
  }

  async deleteMedia(id: number, type: 'Anime' | 'Manga') {
    const user = this.userSubject.getValue();
    if (!user) return;
    const getUrl = new URL(`${this.baseUrl}/v2/user_rates`);
    getUrl.searchParams.append('user_id', String(user.id));
    getUrl.searchParams.append('target_id', String(id));
    getUrl.searchParams.append('target_type', type);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    const response = await fetch(getUrl, { headers });
    if (!response.ok) {
      console.log(response);
      return;
    }
    const result = await response.json();
    if (!result[0]) return;
    const deleteUrl = `${this.baseUrl}/v2/user_rates/${result[0].id}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers,
    });
    if (!deleteResponse.ok) {
      console.log(deleteResponse);
      return;
    }
    return true;
  }

  statusFromMal(malStatus?: WatchStatus | ReadStatus): ShikimoriRateStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'planned';
      case 'reading':
      case 'watching':
        return 'watching';
      case 'completed':
      case 'dropped':
      case 'on_hold':
        return malStatus;
      default:
        return undefined;
    }
  }

  statusToMal(
    shikimoriStatus?: ShikimoriRateStatus,
    type: 'anime' | 'manga' = 'anime',
  ): WatchStatus | ReadStatus | undefined {
    switch (shikimoriStatus) {
      case 'planned':
        return type === 'manga' ? 'plan_to_read' : 'plan_to_watch';
      case 'watching':
        return type === 'manga' ? 'reading' : 'watching';
      case 'completed':
      case 'dropped':
      case 'on_hold':
        return shikimoriStatus;
      default:
        return undefined;
    }
  }
}
