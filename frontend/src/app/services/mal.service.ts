import { Injectable } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { ListManga, ReadStatus } from '@models/manga';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = `${environment.backend}mal/`;
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);
  private hasChanged = new Subject<void>();

  constructor() {
    const malUser = JSON.parse(localStorage.getItem('malUser') || 'false') as MalUser | false;
    if (malUser) {
      this.isLoggedIn.next(malUser.name);
      this.malUser.next(malUser);
    }
    this.checkLogin();
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
    this.hasChanged.next();
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

  async checkLogin() {
    const response = await this.get<UserResponse>('me');
    if (response && 'name' in response) {
      this.isLoggedIn.next(response.name);
      localStorage.setItem('malUser', JSON.stringify(response));
      this.malUser.next(response);
    } else if (!(await this.maintenace())) {
      this.isLoggedIn.next(false);
      localStorage.removeItem('malUser');
      this.malUser.next(undefined);
    }
  }

  async myList(status?: WatchStatus, options?: { limit?: number; offset?: number; sort?: string }) {
    const params = new URLSearchParams([
      ['limit', String(options?.limit || 50)],
      ['offset', String(options?.offset || 0)],
      ['sort', options?.sort || 'anime_start_date'],
    ]);
    if (status) return this.get<ListAnime[]>(`list/${status}`, params);
    return this.get<ListAnime[]>('list');
  }

  async myMangaList(status?: ReadStatus, options?: { limit?: number; offset?: number }) {
    const params = new URLSearchParams([
      ['limit', String(options?.limit || 50)],
      ['offset', String(options?.offset || 0)],
    ]);
    if (status) return this.get<ListManga[]>(`mangalist/${status}`, params);
    return this.get<ListManga[]>('mangalist');
  }

  async refreshTokens() {}

  async login() {
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

  /** Emits after every write to MyAnimeList, so cached list views can be dropped. */
  get changed() {
    return this.hasChanged.asObservable();
  }

  async maintenace(): Promise<boolean> {
    const maint = await this.get<{ maintenance?: boolean }>('maintenance').catch(() => ({
      maintenance: true,
    }));
    return Boolean(maint.maintenance);
  }
}
