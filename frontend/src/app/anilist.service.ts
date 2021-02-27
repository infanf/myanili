import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  constructor(private client: Apollo) {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to anilist, please check your account settings.');
          localStorage.removeItem('anilistAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilistauth');
      window.addEventListener('message', async event => {
        if (event.data) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('anilistAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('anilistRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('anilistClientId', this.clientId);
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

  async checkLogin(): Promise<AnilistUser | undefined> {
    const requestResult = await new Promise<AnilistUser>(r => {
      this.client
        .query<{ Viewer: AnilistUser }>({
          query: gql`
            {
              Viewer {
                id
                name
                avatar {
                  large
                  medium
                }
              }
            }
          `,
        })
        .subscribe(result => {
          r(result.data.Viewer);
        });
    });
    return requestResult;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('anilistAccessToken');
    localStorage.removeItem('anilistRefreshToken');
    localStorage.removeItem('anilistClientId');
  }
}

export interface AnilistUser {
  id: number;
  name: string;
  avatar: {
    medium: string;
  };
}
