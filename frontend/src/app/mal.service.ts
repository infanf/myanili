import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ListAnime, WatchStatus } from './models/anime';
import { UserResponse } from './models/user';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = 'http://localhost:4280/';
  private isLoggedIn = new BehaviorSubject<string | false>(false);

  constructor(private httpClient: HttpClient) {
    this.checkLogin();
  }

  private async get<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .get(`${this.backendUrl}${path}`, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  async checkLogin() {
    const response = await this.get<UserResponse>('me');
    if ('name' in response) {
      this.isLoggedIn.next(response.name);
    } else {
      this.isLoggedIn.next(false);
    }
  }

  async myList(status?: WatchStatus) {
    if (status) return this.get<ListAnime[]>(`list/${status}`);
    return this.get<ListAnime[]>('list');
  }
  async refreshTokens() {}

  async login() {
    return new Promise(r => {
      const loginWindow = window.open('http://localhost:4280/auth');
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
}
