import { Injectable } from '@angular/core';
import { DialogueService } from '@components/dialogue/dialogue.service';
import { MyAnimeUpdate } from '@models/anime';
import { ExtRating } from '@models/components';
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
  constructor(private dialogue: DialogueService) {
    this.clientId = String(localStorage.getItem('traktClientId'));
    this.accessToken = String(localStorage.getItem('traktAccessToken'));
    this.refreshToken = String(localStorage.getItem('traktRefreshToken'));
    if (this.accessToken && this.accessToken !== 'null') {
      this.login()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to trakt, please check your account settings.',
            'Trakt Connection Error',
          );
          localStorage.removeItem('traktAccessToken');
        });
    }
  }

  async login(): Promise<string | undefined> {
    if (this.refreshToken) {
      try {
        const body = `refresh_token=${this.refreshToken}`;
        const response = await fetch(`${environment.backend}trakt/auth`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body,
        });
        if (response.ok) {
          const result = (await response.json()) as {
            refresh_token?: string;
            access_token?: string;
          };
          if (result.access_token && result.refresh_token) {
            this.accessToken = result.access_token;
            localStorage.setItem('traktAccessToken', this.accessToken);
            this.refreshToken = result.refresh_token;
            localStorage.setItem('traktRefreshToken', this.refreshToken);
            return this.checkLogin();
          }
        }
        // return on 500 http status code
        if (response.status >= 500) return;
      } catch (e) {
        console.log(e);
      }
    }
    return new Promise(r => {
      const loginWindow = window.open(`${environment.backend}trakt/auth`);
      window.addEventListener('message', async event => {
        if (event.data && event.data.trakt) {
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
    if (
      !this.accessToken ||
      !this.clientId ||
      this.accessToken === 'null' ||
      this.clientId === 'null'
    ) {
      return;
    }
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
    };
    const result = await fetch(`${this.baseUrl}users/settings`, { headers });
    if (result.ok) {
      const response = (await result.json()) as { user?: { username?: string } };
      if (response.user) return response.user.username;
    }
    return;
  }

  async search(q: string): Promise<Show[]> {
    const headers = new Headers({
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
    });
    const result = await fetch(`${this.baseUrl}search/show?query=${q}&extended=full`, { headers });
    if (result.ok) {
      return result.json() as Promise<Show[]>;
    }
    return [];
  }

  async scrobble(show: string, season: number, episodeno: number): Promise<boolean> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
      'Content-Type': 'application/json',
    };
    const result = await fetch(
      `${this.baseUrl}shows/${show}/seasons/${season}/episodes/${episodeno}`,
      { headers },
    );
    if (result.ok) {
      const episode = (await result.json()) as Episode;
      if (episode.ids.trakt) {
        const scrobbleResult = await fetch(`${this.baseUrl}scrobble/stop`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            episode,
            progress: 100,
          }),
        });
        if (scrobbleResult.ok) {
          const scrobbleResponse = (await scrobbleResult.json()) as {
            id: number;
            action: 'scrobble';
          };
          if (scrobbleResponse.id && scrobbleResponse.action) {
            return true;
          }
        }
      }
    }

    return false;
  }

  async ignore(slug?: string): Promise<boolean> {
    if (!slug) return false;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
      'Content-Type': 'application/json',
    };
    const method = 'POST';
    const body = JSON.stringify({
      shows: [
        {
          ids: { slug },
        },
      ],
    });
    const [resultCalendar, resultWatchlist] = await Promise.all([
      fetch(`${this.baseUrl}users/hidden/calendar`, { headers, method, body }),
      fetch(`${this.baseUrl}users/hidden/progress_watched`, { headers, method, body }),
    ]);
    return resultCalendar.ok && resultWatchlist.ok;
  }

  async searchMovie(q: string): Promise<Show[]> {
    const headers = new Headers({
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
    });
    const result = await fetch(`${this.baseUrl}search/movie?query=${q}&extended=full`, { headers });
    if (result.ok) {
      const response = result.json() as Promise<Movie[]>;
      return (await response).map(movie => ({
        score: movie.score,
        type: 'show',
        show: movie.movie,
      }));
    }
    return [];
  }

  async scrobbleMovie(movieId: string): Promise<boolean> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
      'Content-Type': 'application/json',
    };
    const result = await fetch(`${this.baseUrl}movies/${movieId}`, { headers });
    if (result.ok) {
      const movie = (await result.json()) as Movie['movie'];
      if (movie.ids.trakt) {
        const scrobbleResult = await fetch(`${this.baseUrl}scrobble/stop`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            movie,
            progress: 100,
          }),
        });
        if (scrobbleResult.ok) {
          const scrobbleResponse = (await scrobbleResult.json()) as {
            id: number;
            action: 'scrobble';
          };
          if (scrobbleResponse.id && scrobbleResponse.action) {
            return true;
          }
        }
      }
    }

    return false;
  }

  async getRating(show?: string, season = 1): Promise<ExtRating | undefined> {
    if (!this.clientId || !show) return;
    const url =
      season < 0
        ? `${this.baseUrl}movies/${show}/ratings`
        : season === 1
        ? `${this.baseUrl}shows/${show}/ratings`
        : `${this.baseUrl}shows/${show}/seasons/${season}/ratings`;
    const result = await fetch(url, {
      headers: new Headers({
        'trakt-api-version': '2',
        'trakt-api-key': this.clientId,
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as Ratings;
      if (response.rating) {
        // Some trolls rate all animes 1/10 before they even watch it
        if (response.votes === response.distribution[1]) {
          return;
        }
        return {
          nom: Math.round(response.rating * 10),
          norm: response.rating * 10,
          unit: '%',
          ratings: response.votes,
        };
      }
    }
    return;
  }

  async updateEntry(trakt?: { id?: string; season?: number }, data?: Partial<MyAnimeUpdate>) {
    if (!trakt || !trakt.id || !this.accessToken) return;
    if (data?.status === 'dropped') {
      this.ignore(trakt.id);
    }
    if (data?.score) {
      this.addRating(data.score, trakt.id, trakt.season);
    }
  }

  async addRating(rating: number, slug?: string, number = 1) {
    if (!this.clientId || !this.accessToken || !slug) return;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': this.clientId,
      'Content-Type': 'application/json',
    };
    const data = {
      shows: [{ ids: { slug }, seasons: [{ number, rating }] }],
      movies: [],
    } as {
      shows: Array<{
        rating?: number;
        ids: { slug: string };
        seasons?: Array<{ number: number; rating: number }>;
      }>;
      movies: Array<{
        rating?: number;
        ids: { slug: string };
      }>;
    };
    if (number === 1) {
      data.shows.push({ rating, ids: { slug } });
    }
    if (number < 0) {
      data.shows = [];
      data.movies.push({ rating, ids: { slug } });
    }
    fetch(`${this.baseUrl}sync/ratings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
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

interface Ratings {
  rating: number;
  votes: number;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
    '6': number;
    '7': number;
    '8': number;
    '9': number;
    '10': number;
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
    genres: string[];
    overview: string;
  };
}

export interface Movie {
  type: 'movie';
  score: number;
  movie: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
    genres: string[];
    overview: string;
  };
}
