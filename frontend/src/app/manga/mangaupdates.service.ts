import { Injectable } from '@angular/core';
import { BakaUser } from '@models/baka';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MangaupdatesService {
  private baseUrl = environment.backend + 'baka/v1/';
  private accessToken = '';
  private userSubject = new BehaviorSubject<BakaUser | undefined>(undefined);

  constructor() {
    this.accessToken = String(localStorage.getItem('bakaAccessToken'));
    if (this.accessToken && this.accessToken !== 'null') {
      this.login().then(user => {
        this.userSubject.next(user);
      });
    }
  }

  async login(
    username?: string,
    password?: string,
    saveLogin = false,
  ): Promise<BakaUser | undefined> {
    if (!username || !password) {
      return this.checkLogin();
    }
    const result = await fetch(`${this.baseUrl}account/login`, {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ username, password }),
    });
    if (!result.ok) return undefined;
    const response = (await result.json()) as { context: { session_token: string } };
    this.accessToken = response.context.session_token;
    localStorage.setItem('bakaAccessToken', this.accessToken);
    return this.checkLogin();
  }

  async checkLogin(): Promise<BakaUser | undefined> {
    if (!this.accessToken) return undefined;
    const result = await fetch(`${this.baseUrl}account/profile`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (!result.ok) return undefined;
    const response = (await result.json()) as BakaUser;
    return response;
  }

  logoff() {
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('bakaAccessToken');
  }

  get user() {
    return this.userSubject.asObservable();
  }
}
