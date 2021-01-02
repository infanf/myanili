import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TraktService {
  private readonly baseUrl = 'https://api.trakt.tv/';
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<string | undefined>(undefined);
  constructor(private http: HttpClient) {
    this.clientId = String(localStorage.getItem('traktClientId'));
    this.accessToken = String(localStorage.getItem('traktAccessToken'));
    this.refreshToken = String(localStorage.getItem('traktRefreshToken'));
    this.checkLogin().then(user => {
      this.userSubject.next(user);
    });
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'traktauth');
      window.addEventListener('message', async event => {
        if (event.data) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('traktAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('traktRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('traktClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(): Promise<string | undefined> {
    return new Promise((r, rj) => {
      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
        'trakt-api-version': '2',
        'trakt-api-key': this.clientId,
      };
      try {
        this.http
          .get<{ user?: { username?: string } }>(this.baseUrl + 'users/settings', { headers })
          .subscribe(result => {
            if (result.user) {
              r(result.user.username);
            } else {
              r(undefined);
            }
          });
      } catch (e) {
        rj(e.message);
      }
    });
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('traktAccessToken');
    localStorage.removeItem('traktRefreshToken');
    localStorage.removeItem('traktClientId');
  }
}
