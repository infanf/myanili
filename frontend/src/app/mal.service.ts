import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { ListManga, ReadStatus } from '@models/manga';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = `${environment.backend}mal/`;
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);

  constructor(private httpClient: HttpClient, private glob: GlobalService) {
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

  async getJikanData<T>(url: string, v3 = false, retry = false): Promise<T> {
    try {
      const response = await fetch(`${v3 ? environment.jikan3Url : environment.jikanUrl}${url}`);
      if (response.status === 429 && !retry) {
        await this.glob.sleep(1000);
        return this.getJikanData<T>(url, v3, true);
      }
      return response.json() as unknown as T;
    } catch (e) {
      const response = await fetch(
        `${v3 ? environment.jikan3FallbackUrl : environment.jikanFallbackUrl}${url}`,
      );
      return response.json() as unknown as T;
    }
  }

  async getJikan(type: 'anime' | 'manga', id: number): Promise<JikanInstance> {
    return this.getJikanData<JikanInstance>(`${type}/${id}`, true);
  }

  async checkLogin() {
    const response = await this.get<UserResponse>('me');
    if (response && 'name' in response) {
      this.isLoggedIn.next(response.name);
      localStorage.setItem('malUser', JSON.stringify(response));
      this.malUser.next(response);
    } else {
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
}

interface JikanInstance {
  related: {
    [key: string]: Array<{
      mal_id: number;
      type: 'manga' | 'anime';
      name: string;
      url: string;
    }>;
  };
  external_links: Array<{ name: string; url: string }>;
}
