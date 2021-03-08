import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SimklService {
  private readonly baseUrl = 'https://api.simkl.com/';
  private clientId = '';
  private accessToken = '';
  private userSubject = new BehaviorSubject<number | undefined>(undefined);

  constructor(private http: HttpClient) {
    this.clientId = String(localStorage.getItem('simklClientId'));
    this.accessToken = String(localStorage.getItem('simklAccessToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to SIMKL, please check your account settings.');
          localStorage.removeItem('simklAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'simklauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.simkl) {
          const data = event.data as { at: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('simklAccessToken', this.accessToken);
          this.clientId = data.ci;
          localStorage.setItem('simklClientId', this.clientId);
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

  async checkLogin(): Promise<number | undefined> {
    if (
      !this.accessToken ||
      !this.clientId ||
      this.accessToken === 'null' ||
      this.clientId === 'null'
    ) {
      return;
    }
    return new Promise(r => {
      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      };
      try {
        this.http
          .get<{ account?: { id?: number } }>(this.baseUrl + 'users/settings', { headers })
          .subscribe(
            result => {
              if (result.account) {
                r(result.account.id);
              } else {
                r(undefined);
              }
            },
            error => {
              console.log({ error });
              r(undefined);
            },
          );
      } catch (error) {
        console.log({ error });
        r(undefined);
      }
    });
  }

  async getId(malId: number): Promise<number | undefined> {
    if (!this.clientId) return;
    return new Promise((r, rj) => {
      const headers = {
        'simkl-api-key': this.clientId,
      };
      this.http
        .get<IdSearch[]>(this.baseUrl + 'search/id?mal=' + malId, { headers })
        .subscribe(
          res => {
            if (res.length) {
              r(res[0].ids.simkl);
            } else {
              r(undefined);
            }
          },
          e => {
            r(undefined);
          },
        );
    });
  }

  async scrobble(ids: { simkl?: number; mal?: number }, number?: number): Promise<boolean> {
    if (!this.clientId || !this.accessToken || (!ids.simkl && !ids.mal) || !number) return false;
    return new Promise<boolean>(r => {
      const data = {
        shows: [{ ids, seasons: [{ number: 1, episodes: [{ number }] }] }],
      };
      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      };
      try {
        this.http
          .post<{ added: { shows: number }; not_found: { shows: [] } }>(
            this.baseUrl + 'sync/history',
            data,
            { headers },
          )
          .subscribe(
            result => {
              if (result.added.shows) {
                r(true);
              } else {
                r(false);
              }
            },
            error => {
              console.log({ error });
              r(false);
            },
          );
      } catch (error) {
        console.log({ error });
        r(false);
      }
    });
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('simklAccessToken');
    localStorage.removeItem('simklClientId');
  }
}

interface IdSearch {
  ids: {
    simkl: number;
  };
}
