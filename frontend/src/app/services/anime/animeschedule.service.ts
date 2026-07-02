import { Injectable } from '@angular/core';
import { MyAnimeUpdate, WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { DialogueService } from '@services/dialogue.service';
import { cleanupObject } from '@services/global.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Integration for AnimeSchedule.net (https://animeschedule.net).
 *
 * Public data (search, single anime, ratings) is proxied through the backend
 * because it requires the application token, which must not be exposed in the
 * frontend. User specific watch data uses the OAuth2 (authorization code + PKCE)
 * access token which is safe to keep client side, analogous to SIMKL/aniSearch.
 *
 * API docs: https://animeschedule.net/api/v3/documentation
 */
@Injectable({
  providedIn: 'root',
})
export class AnimescheduleService {
  // All API calls go through the backend: public reads need the secret app
  // token, and the OAuth endpoints send no CORS headers for the browser.
  private readonly backendUrl = `${environment.backend}animeschedule/`;
  private accessToken = '';
  private refreshToken = '';
  private expires = 0;
  private userSubject = new BehaviorSubject<AnimescheduleUser | undefined>(undefined);
  loggedIn = false;

  constructor(private dialogue: DialogueService) {
    this.accessToken = String(localStorage.getItem('animescheduleAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('animescheduleRefreshToken') || '');
    this.expires = Number(localStorage.getItem('animescheduleExpires') || 0);
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(() => {
          this.dialogue.alert(
            'Could not connect to AnimeSchedule, please check your account settings.',
            'AnimeSchedule Connection Error',
          );
          this.logoff();
        });
    }
  }

  get user() {
    return this.userSubject.asObservable();
  }

  // ---------------------------------------------------------------------------
  // Public data (proxied through the backend which injects the application token)
  // ---------------------------------------------------------------------------

  async getAnimes(term: string): Promise<AnimescheduleAnime[]> {
    if (!term) return [];
    const query = new URLSearchParams({ q: term.substring(0, 200), st: 'popularity' });
    const result = await fetch(`${this.backendUrl}anime?${query}`);
    if (!result.ok) return [];
    const response = (await result.json()) as
      | { anime?: AnimescheduleAnime[] }
      | AnimescheduleAnime[];
    return Array.isArray(response) ? response : (response.anime ?? []);
  }

  async getAnime(route: string): Promise<AnimescheduleAnime | undefined> {
    if (!route) return;
    const result = await fetch(`${this.backendUrl}anime/${encodeURIComponent(route)}`);
    if (!result.ok) return;
    return (await result.json()) as AnimescheduleAnime;
  }

  /**
   * Resolves the AnimeSchedule route (URL slug) for a given MAL anime.
   * Matches by the linked MyAnimeList website first, falling back to the top
   * search result for the title.
   */
  async getId(malId: number, title: string): Promise<string | undefined> {
    if (!malId || !title) return;
    const animes = await this.getAnimes(title);
    if (!animes.length) return;
    const byMal = animes.find(anime =>
      Object.values(anime.websites ?? {}).some(url =>
        url?.includes(`myanimelist.net/anime/${malId}`),
      ),
    );
    return (byMal ?? animes[0]).route;
  }

  async getRating(route?: string): Promise<ExtRating | undefined> {
    if (!route) return;
    const anime = await this.getAnime(route);
    const stats = anime?.stats;
    if (!stats?.averageScore) return;
    // averageScore is on a 0-100 scale; the app normalises to 0-100 (norm) and 0-10 (nom).
    return { nom: stats.averageScore / 10, norm: stats.averageScore, ratings: stats.ratingCount };
  }

  // ---------------------------------------------------------------------------
  // Authentication (OAuth2 authorization code flow with PKCE, via the backend)
  // ---------------------------------------------------------------------------

  async login(): Promise<void> {
    if (await this.refreshTokens()) return;
    const loginWindow = window.open(`${this.backendUrl}auth`, 'AnimeSchedule Login');
    return new Promise<void>(resolve => {
      const listener = async (event: MessageEvent) => {
        if (event.data && event.data.animeschedule === true) {
          const data = event.data as { at: string; rt: string; ex: number };
          window.removeEventListener('message', listener);
          this.accessToken = data.at;
          this.refreshToken = data.rt;
          this.expires = Number(data.ex) || 0;
          localStorage.setItem('animescheduleAccessToken', this.accessToken);
          localStorage.setItem('animescheduleRefreshToken', this.refreshToken);
          localStorage.setItem('animescheduleExpires', String(this.expires));
          this.userSubject.next(await this.checkLogin());
          loginWindow?.close();
          resolve();
        }
      };
      window.addEventListener('message', listener);
    });
  }

  async checkLogin(secondTry = false): Promise<AnimescheduleUser | undefined> {
    if (!this.accessToken || this.accessToken === 'null') return;
    const result = await fetch(`${this.backendUrl}oauth/stats`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (result.ok) {
      const { userId, username } = (await result.json()) as { userId: string; username: string };
      this.loggedIn = true;
      return { id: userId, username };
    } else if (result.status === 401 && !secondTry && (await this.refreshTokens())) {
      return this.checkLogin(true);
    }
    this.loggedIn = false;
    return;
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken || this.refreshToken === 'null') return false;
    const result = await fetch(`${this.backendUrl}refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });
    if (!result.ok) return false;
    const data = (await result.json()) as { at?: string; rt?: string; ex?: number };
    if (!data.at) return false;
    this.accessToken = data.at;
    if (data.rt) this.refreshToken = data.rt;
    this.expires = Number(data.ex) || 0;
    localStorage.setItem('animescheduleAccessToken', this.accessToken);
    localStorage.setItem('animescheduleRefreshToken', this.refreshToken);
    localStorage.setItem('animescheduleExpires', String(this.expires));
    return true;
  }

  logoff() {
    this.accessToken = '';
    this.refreshToken = '';
    this.expires = 0;
    this.loggedIn = false;
    this.userSubject.next(undefined);
    localStorage.removeItem('animescheduleAccessToken');
    localStorage.removeItem('animescheduleRefreshToken');
    localStorage.removeItem('animescheduleExpires');
  }

  // ---------------------------------------------------------------------------
  // Watch data synchronisation (OAuth2 endpoints)
  // ---------------------------------------------------------------------------

  async getEntry(route?: string): Promise<AnimescheduleListEntry | undefined> {
    if (!route || !this.accessToken) return;
    const result = await fetch(`${this.backendUrl}oauth/list/${encodeURIComponent(route)}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (result.ok) return (await result.json()) as AnimescheduleListEntry;
    return;
  }

  async updateEntry(route?: string, data?: Partial<MyAnimeUpdate>): Promise<void> {
    if (!route || !data || !this.accessToken || !this.loggedIn) return;
    const body = cleanupObject<Partial<AnimescheduleListPut>>({
      route,
      listStatus: this.statusFromMal(data.status),
      episodesSeen: data.num_watched_episodes,
      manualScore: typeof data.score === 'number' ? data.score * 10 : undefined,
      startDate: data.start_date,
      endDate: data.finish_date,
      note: data.comments?.substring(0, 1000),
    });
    const result = await fetch(`${this.backendUrl}oauth/list/${encodeURIComponent(route)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!result.ok) throw new Error(`AnimeSchedule: HTTP ${result.status}`);
  }

  async deleteEntry(route?: string): Promise<boolean> {
    if (!route || !this.accessToken) return false;
    const result = await fetch(`${this.backendUrl}oauth/list/${encodeURIComponent(route)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return result.ok;
  }

  statusFromMal(malStatus?: WatchStatus): AnimescheduleListStatus | undefined {
    switch (malStatus) {
      case 'watching':
        return 'watching';
      case 'completed':
        return 'completed';
      case 'on_hold':
        return 'on-hold';
      case 'dropped':
        return 'dropped';
      case 'plan_to_watch':
        return 'to-watch';
      default:
        return undefined;
    }
  }

  statusToMal(status?: AnimescheduleListStatus): WatchStatus | undefined {
    switch (status) {
      case 'watching':
        return 'watching';
      case 'completed':
        return 'completed';
      case 'on-hold':
        return 'on_hold';
      case 'dropped':
        return 'dropped';
      case 'to-watch':
        return 'plan_to_watch';
      default:
        return undefined;
    }
  }
}

export interface AnimescheduleUser {
  id: string;
  username: string;
}

export type AnimescheduleListStatus = 'completed' | 'watching' | 'on-hold' | 'dropped' | 'to-watch';

export interface AnimescheduleAnime {
  id: string;
  title: string;
  route: string;
  year?: number;
  premier?: string;
  description?: string;
  imageVersionRoute?: string;
  genres?: Array<{ name: string; route: string }>;
  websites?: Record<string, string | undefined>;
  stats?: {
    averageScore: number;
    ratingCount: number;
    trackedCount: number;
    trackedRating: number;
  };
}

export interface AnimescheduleListEntry {
  route: string;
  listStatus: AnimescheduleListStatus;
  episodesSeen: number;
  episodes: number;
  manualScore: number;
  averageAutoScore: number;
  useAutoScores: boolean;
  startDate?: string;
  endDate?: string;
  note?: string;
  preferredTitle?: string;
}

export interface AnimescheduleListPut {
  route: string;
  listStatus: AnimescheduleListStatus;
  episodesSeen: number;
  manualScore: number;
  useAutoScores: boolean;
  startDate: string;
  endDate: string;
  note: string;
}
