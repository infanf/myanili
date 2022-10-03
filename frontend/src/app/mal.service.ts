import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { Jikan4Response } from '@models/jikan';
import { ListManga, ReadStatus } from '@models/manga';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = `${environment.backend}mal/`;
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);

  constructor(private httpClient: HttpClient, private cache: CacheService) {
    const malUser = JSON.parse(localStorage.getItem('malUser') || 'false') as MalUser | false;
    if (malUser) {
      this.isLoggedIn.next(malUser.name);
      this.malUser.next(malUser);
    }
    this.checkLogin();
  }

  async get<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .get(`${this.backendUrl}${path}`, { withCredentials: true })
        .subscribe(value => {
          res(value as unknown as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async put<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .put(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res(value as unknown as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async post<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .post(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res(value as unknown as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async delete<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .delete(`${this.backendUrl}${path}`, { withCredentials: true })
        .subscribe(value => {
          res(value as unknown as T);
        });
    });
  }

  async getJikanData<T>(url: string): Promise<T> {
    try {
      const response = await this.cache.fetch<Jikan4Response<T>>(`${environment.jikanUrl}${url}`);
      return response.data;
    } catch (e) {
      const response = await fetch(`${environment.jikanFallbackUrl}${url}`);
      const result = (await response.json()) as unknown as Jikan4Response<T>;
      return result.data;
    }
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

  async myList(status?: WatchStatus) {
    if (status) return this.get<ListAnime[]>(`list/${status}`);
    return this.get<ListAnime[]>('list');
  }

  async myMangaList(status?: ReadStatus) {
    if (status) return this.get<ListManga[]>(`mangalist/${status}`);
    return this.get<ListManga[]>('mangalist');
  }

  async refreshTokens() {}

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(this.backendUrl + 'auth');
      window.addEventListener('message', async event => {
        if (event.data) {
          await this.checkLogin();
        }
        loginWindow?.close();
      });
    });
  }

  get loggedIn() {
    return this.isLoggedIn.asObservable();
  }

  get user() {
    return this.malUser.asObservable();
  }

  async maintenace(): Promise<boolean> {
    const maint = await this.get<{ maintenance?: boolean }>('maintenance');
    return Boolean(maint.maintenance);
  }
}
