import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MangaupdatesService {
  private baseUrl = environment.backend + 'baka/v1/';
  private accessToken = '';
  private userSubject = new BehaviorSubject<string>('');
  loggedIn = false;

  constructor() {
    this.accessToken = String(localStorage.getItem('bakaAccessToken'));
    if (this.accessToken && this.accessToken !== 'null') {
      this.login().then(user => {
        this.userSubject.next(user || '');
      });
    }
    this.login('test', 'test').then(console.log);
  }

  async login(username?: string, password?: string, saveLogin = false): Promise<string | false> {
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
    if (!result.ok) return false;
    return '';
  }

  async checkLogin(): Promise<string | false> {
    if (!this.accessToken) return false;
    const result = await fetch(`${this.baseUrl}account/profile`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (!result.ok) return false;
    return '';
  }
}
