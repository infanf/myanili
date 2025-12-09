import { Injectable } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { Jikan4Response } from '@models/jikan';
import { ListManga, ReadStatus } from '@models/manga';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CacheService } from './cache.service';
import { MalMobileOAuthService } from './mobile/mal-mobile-oauth.service';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = `${environment.backend}mal/`;
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);
  private mobileOAuth?: MalMobileOAuthService;

  constructor(
    private cache: CacheService,
    private injectedMobileOAuth?: MalMobileOAuthService,
  ) {
    console.log('[MALService] Constructor - Platform:', environment.platform);
    if (environment.platform === 'mobile') {
      // Mobile: use injected mobile OAuth service
      console.log('[MALService] Mobile platform - initializing with mobile OAuth');
      this.mobileOAuth = this.injectedMobileOAuth;
      this.isLoggedIn.next(false);
      // Check if already logged in
      this.injectedMobileOAuth?.checkLogin().then(user => {
        if (user) {
          console.log('[MALService] Already logged in:', user.name);
          this.isLoggedIn.next(user.name);
          this.malUser.next(user);
        }
      });
    } else {
      // Web implementation
      console.log('[MALService] Web platform detected, using web implementation');
      const malUser = JSON.parse(localStorage.getItem('malUser') || 'false') as MalUser | false;
      if (malUser) {
        this.isLoggedIn.next(malUser.name);
        this.malUser.next(malUser);
      }
      this.checkLogin();
    }
  }

  async initializeMobile(mobileOAuth: MalMobileOAuthService) {
    console.log('[MALService] initializeMobile() called');
    this.mobileOAuth = mobileOAuth;
    const user = await mobileOAuth.checkLogin();
    console.log('[MALService] checkLogin result:', user);
    if (user) {
      this.isLoggedIn.next(user.name);
      this.malUser.next(user);
    }
  }

  async get<T>(path: string, params?: URLSearchParams): Promise<T> {
    const url = new URL(`${this.backendUrl}${path}`);
    if (params) url.search = params.toString();
    const request = await fetch(url.toString(), { credentials: 'include' });
    if (!request.ok) {
      throw new Error(`Error ${request.status}: ${request.statusText}`);
    }
    return request.json() as Promise<T>;
  }

  // tslint:disable-next-line:no-any
  async post<T>(path: string, data: any, method = 'POST'): Promise<T> {
    if ('extension' in data) {
      data = { ...data };
      data.comments = data.extension;
      delete data.extension;
    }
    const request = await fetch(`${this.backendUrl}${path}`, {
      method,
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!request.ok) {
      throw new Error(`Error ${request.status}: ${request.statusText}`);
    }
    return request.json() as Promise<T>;
  }

  // tslint:disable-next-line:no-any
  async put<T>(path: string, data: any): Promise<T> {
    return this.post<T>(path, data, 'PUT');
  }

  // tslint:disable-next-line:no-any
  async delete<T>(path: string): Promise<T> {
    return this.post<T>(path, {}, 'DELETE');
  }

  async getJikanData<T>(url: string): Promise<T> {
    try {
      const response = await this.cache.fetch<Jikan4Response<T>>(`${environment.jikanUrl}${url}`);
      return response.data;
    } catch (e) {
      try {
        const response = await fetch(`${environment.jikanFallbackUrl}${url}`);
        const result = (await response.json()) as unknown as Jikan4Response<T>;
        return result.data;
      } catch (ex) {
        return undefined as unknown as T;
      }
    }
  }

  async checkLogin(): Promise<MalUser | undefined> {
    if (environment.platform === 'mobile' && this.mobileOAuth) {
      return this.mobileOAuth.checkLogin();
    }

    // Web implementation
    const response = await this.get<UserResponse>('me');
    if (response && 'name' in response) {
      this.isLoggedIn.next(response.name);
      localStorage.setItem('malUser', JSON.stringify(response));
      this.malUser.next(response);
      return response;
    } else if (!(await this.maintenace())) {
      this.isLoggedIn.next(false);
      localStorage.removeItem('malUser');
      this.malUser.next(undefined);
    }
    return undefined;
  }

  async myList(status?: WatchStatus, options?: { limit?: number; offset?: number; sort?: string }) {
    if (environment.platform === 'mobile' && this.mobileOAuth) {
      return this.mobileOAuth.myList(status, options);
    }

    // Web implementation
    const params = new URLSearchParams([
      ['limit', String(options?.limit || 50)],
      ['offset', String(options?.offset || 0)],
      ['sort', options?.sort || 'anime_start_date'],
    ]);
    if (status) return this.get<ListAnime[]>(`list/${status}`, params);
    return this.get<ListAnime[]>('list');
  }

  async myMangaList(status?: ReadStatus, options?: { limit?: number; offset?: number }) {
    if (environment.platform === 'mobile' && this.mobileOAuth) {
      return this.mobileOAuth.myMangaList(status, options);
    }

    // Web implementation
    const params = new URLSearchParams([
      ['limit', String(options?.limit || 50)],
      ['offset', String(options?.offset || 0)],
    ]);
    if (status) return this.get<ListManga[]>(`mangalist/${status}`, params);
    return this.get<ListManga[]>('mangalist');
  }

  async refreshTokens() {}

  async login() {
    console.log('[MALService] login() called - platform:', environment.platform, 'mobileOAuth:', !!this.mobileOAuth);
    if (environment.platform === 'mobile' && this.mobileOAuth) {
      console.log('[MALService] Using mobile OAuth login');
      const user = await this.mobileOAuth.login();
      if (user) {
        this.isLoggedIn.next(user.name);
        this.malUser.next(user);
      }
      return;
    }

    // Web implementation
    console.log('[MALService] Using web OAuth login, opening:', `${this.backendUrl}auth`);
    return new Promise(r => {
      window.addEventListener('message', async event => {
        console.log(event);
        if (event.data?.mal) {
          await this.checkLogin();
        }
        loginWindow?.close();
      });
      const loginWindow = window.open(`${this.backendUrl}auth`);
    });
  }

  get loggedIn() {
    return this.isLoggedIn.asObservable();
  }

  get user() {
    return this.malUser.asObservable();
  }

  async maintenace(): Promise<boolean> {
    const maint = await this.get<{ maintenance?: boolean }>('maintenance').catch(() => ({
      maintenance: true,
    }));
    return Boolean(maint.maintenance);
  }
}
