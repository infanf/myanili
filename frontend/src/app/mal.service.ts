import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { ListManga, ReadStatus } from '@models/manga';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = environment.backend;
  private jikanUrl = 'https://api.jikan.moe/v3';
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);

  constructor(private httpClient: HttpClient) {
    this.checkLogin();
  }

  async get<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .get(`${this.backendUrl}${path}`, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async put<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .put(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async post<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .post(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  async getJikan(type: 'anime' | 'manga', id: number): Promise<JikanInstance> {
    return new Promise((r, rj) => {
      this.httpClient.get<JikanInstance>(`${this.jikanUrl}/${type}/${id}`).subscribe(r);
    });
  }

  async checkLogin() {
    const response = await this.get<UserResponse>('me');
    if ('name' in response) {
      this.isLoggedIn.next(response.name);
      this.malUser.next(response);
    } else {
      this.isLoggedIn.next(false);
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
}
