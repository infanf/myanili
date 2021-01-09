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

  async search(q: string): Promise<Show[]> {
    return new Promise((r, rj) => {
      const headers = {
        'trakt-api-version': '2',
        'trakt-api-key': this.clientId,
      };
      this.http
        .get<Show[]>(this.baseUrl + 'search/show?query=' + q, { headers })
        .subscribe(r, e => {
          r([]);
        });
    });
  }

  async scrobble(show: string, season: number, episodeno: number): Promise<boolean> {
    return new Promise((r, rj) => {
      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
        'trakt-api-version': '2',
        'trakt-api-key': this.clientId,
      };

      try {
        const episodeUrl = `${this.baseUrl}shows/${show}/seasons/${season}/episodes/${episodeno}`;
        this.http
          .get<Episode>(episodeUrl, { headers })
          .subscribe(result => {
            if (result.ids.trakt) {
              const episode = result;
              this.http
                .post<{ id: number; action: 'scrobble' }>(
                  `${this.baseUrl}scrobble/stop`,
                  {
                    episode,
                    progress: 100,
                  },
                  { headers },
                )
                .subscribe(
                  scrobbleResult => {
                    if (scrobbleResult.id && scrobbleResult.action) {
                      r(true);
                    }
                    r(false);
                  },
                  error => {
                    console.error(error.message);
                    alert('Error scrobbling to trakt');
                    r(false);
                  },
                );
            } else {
              r(false);
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

interface Episode {
  season: number;
  number: number;
  title: string;
  ids: {
    trakt: number;
    tvdb: number;
    imdb: string;
    tmdb: number;
  };
}

export interface Show {
  type: 'show';
  score: number;
  show: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
}
