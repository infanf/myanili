import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ReadStatus } from '../../models/manga';
import {
  MangaBakaError,
  MangaBakaLibraryEntry,
  MangaBakaLibraryEntryWithSeries,
  MangaBakaResponse,
  MangaBakaSearchParams,
  MangaBakaSeries,
  MangaBakaUser,
} from '../../models/mangabaka';
import { CacheService } from '../cache.service';

@Injectable({
  providedIn: 'root',
})
export class MangabakaService {
  private readonly baseUrl = 'https://api.mangabaka.dev/v1';
  private readonly authUrl = `${environment.backend}mangabaka/auth`;
  private accessToken = '';
  private refreshToken = '';

  // Observable for user authentication state
  isLoggedIn = new BehaviorSubject<boolean>(false);
  user = new BehaviorSubject<MangaBakaUser | undefined>(undefined);
  needsReauth = new BehaviorSubject<boolean>(false);

  constructor(private cache: CacheService) {
    // Load saved tokens
    this.accessToken = String(localStorage.getItem('mangabakaAccessToken') || '');
    this.refreshToken = String(localStorage.getItem('mangabakaRefreshToken') || '');

    // Check for legacy PAT
    if (localStorage.getItem('mangabakaApiKey')) {
      this.needsReauth.next(true);
    }

    // Check if user is logged in
    if (this.accessToken) {
      this.checkLogin();
    }
  }

  /**
   * Check if user is authenticated by fetching user info
   */
  async checkLogin(): Promise<boolean> {
    try {
      const userInfo = await this.getCurrentUser();
      if (userInfo) {
        this.user.next(userInfo);
        this.isLoggedIn.next(true);
        return true;
      }
      this.user.next(undefined);
      this.isLoggedIn.next(false);
      return false;
    } catch (error) {
      this.user.next(undefined);
      this.isLoggedIn.next(false);
      return false;
    }
  }

  /**
   * Get current user information from library
   * Note: PAT tokens don't have access to userinfo endpoint, so we extract user_id from library
   */
  async getCurrentUser(): Promise<MangaBakaUser | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch('https://mangabaka.org/auth/oauth2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && this.refreshToken) {
          // Token expired, should refresh here if implemented
          // For now, just logout
          this.logout();
        }
        return null;
      }

      const userData = (await response.json()) as MangaBakaUser;
      return userData;
    } catch (error) {
      console.error('MangaBaka getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Start OAuth login flow
   */
  async login(): Promise<void> {
    return new Promise(resolve => {
      const loginWindow = window.open(this.authUrl);
      const listener = async (event: MessageEvent) => {
        if (event.data && event.data.mangabaka) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          this.refreshToken = data.rt;

          localStorage.setItem('mangabakaAccessToken', this.accessToken);
          localStorage.setItem('mangabakaRefreshToken', this.refreshToken);

          // Clear legacy PAT if it exists
          localStorage.removeItem('mangabakaApiKey');
          this.needsReauth.next(false);

          await this.checkLogin();
          window.removeEventListener('message', listener);
          loginWindow?.close();
          resolve();
        }
      };
      window.addEventListener('message', listener);
    });
  }

  /**
   * @deprecated PAT is no longer supported
   */
  async setApiKey(apiKey: string): Promise<boolean> {
    console.warn('Mangabaka PAT is deprecated, use OAuth instead.');
    return false;
  }

  /**
   * Logout - clear credentials
   */
  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    localStorage.removeItem('mangabakaAccessToken');
    localStorage.removeItem('mangabakaRefreshToken');
    this.user.next(undefined);
    this.isLoggedIn.next(false);
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(url: string, options?: RequestInit): Promise<MangaBakaResponse<T>> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as MangaBakaError;
      throw new Error(error.message || `HTTP ${error.status}`);
    }

    return data as MangaBakaResponse<T>;
  }

  /**
   * Search for manga series
   */
  async searchSeries(params: MangaBakaSearchParams): Promise<MangaBakaSeries[]> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.set('q', params.q);
    if (params.type) params.type.forEach(t => queryParams.append('type', t));
    if (params.type_not) params.type_not.forEach(t => queryParams.append('type_not', t));
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.status_not) params.status_not.forEach(s => queryParams.append('status_not', s));
    if (params.content_rating) {
      params.content_rating.forEach(r => queryParams.append('content_rating', r));
    }

    const url = `${this.baseUrl}/series/search?${queryParams.toString()}`;

    try {
      const response = await this.cache.fetch<MangaBakaResponse<MangaBakaSeries[]>>(url);
      return response.data;
    } catch (error) {
      console.error('MangaBaka search error:', error);
      return [];
    }
  }

  /**
   * Get series by ID
   */
  async getSeries(id: number): Promise<MangaBakaSeries | null> {
    const url = `${this.baseUrl}/series/${id}`;

    try {
      const response = await this.cache.fetch<MangaBakaResponse<MangaBakaSeries>>(url);
      return response.data;
    } catch (error) {
      console.error('MangaBaka getSeries error:', error);
      return null;
    }
  }

  /**
   * Get user's library
   */
  async getLibrary(params?: {
    limit?: number;
    page?: number;
    sort_by?: string;
    q?: string;
  }): Promise<MangaBakaLibraryEntryWithSeries[]> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params?.q) queryParams.set('q', params.q);

    const url = `${this.baseUrl}/my/library?${queryParams.toString()}`;

    const response = await this.fetch<MangaBakaLibraryEntryWithSeries[]>(url);
    return response.data;
  }

  /**
   * Get a specific library entry
   */
  async getLibraryEntry(seriesId: number): Promise<MangaBakaLibraryEntry | null> {
    const url = `${this.baseUrl}/my/library/${seriesId}`;

    try {
      const response = await this.fetch<MangaBakaLibraryEntry>(url);
      return response.data;
    } catch (error) {
      console.error('MangaBaka getLibraryEntry error:', error);
      return null;
    }
  }

  /**
   * Add series to library
   */
  async addToLibrary(
    seriesId: number,
    entry: Partial<MangaBakaLibraryEntry>,
  ): Promise<MangaBakaLibraryEntry | null> {
    const url = `${this.baseUrl}/my/library/${seriesId}`;

    try {
      const response = await this.fetch<MangaBakaLibraryEntry>(url, {
        method: 'POST',
        body: JSON.stringify(entry),
      });
      return response.data;
    } catch (error) {
      console.error('MangaBaka addToLibrary error:', error);
      throw error;
    }
  }

  /**
   * Update library entry (partial)
   */
  async updateLibraryEntry(
    seriesId: number,
    updates: Partial<MangaBakaLibraryEntry>,
  ): Promise<MangaBakaLibraryEntry | null> {
    const url = `${this.baseUrl}/my/library/${seriesId}`;

    try {
      const response = await this.fetch<MangaBakaLibraryEntry>(url, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response.data;
    } catch (error) {
      console.error('MangaBaka updateLibraryEntry error:', error);
      throw error;
    }
  }

  /**
   * Remove series from library
   */
  async removeFromLibrary(seriesId: number): Promise<boolean> {
    const url = `${this.baseUrl}/my/library/${seriesId}`;

    try {
      await this.fetch<void>(url, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('MangaBaka removeFromLibrary error:', error);
      return false;
    }
  }

  /**
   * Map from external source (e.g., AniList) to MangaBaka series
   */
  async mapFromSource(
    source: 'anilist' | 'kitsu' | 'anime-planet' | 'manga-updates' | 'my-anime-list',
    sourceId: number,
  ): Promise<MangaBakaSeries[] | null> {
    const url = `${this.baseUrl}/source/${source}/${sourceId}`;

    try {
      const response =
        await this.cache.fetch<MangaBakaResponse<{ series: MangaBakaSeries[] }>>(url);
      return response.data.series;
    } catch (error) {
      console.error('MangaBaka mapFromSource error:', error);
      return null;
    }
  }

  /**
   * Map MAL reading status to MangaBaka library state
   */
  statusFromMal(
    malStatus?: ReadStatus,
  ): 'reading' | 'completed' | 'dropped' | 'paused' | 'plan_to_read' | 'rereading' | undefined {
    switch (malStatus) {
      case 'reading':
        return 'reading';
      case 'completed':
        return 'completed';
      case 'on_hold':
        return 'paused';
      case 'dropped':
        return 'dropped';
      case 'plan_to_read':
        return 'plan_to_read';
      default:
        return undefined;
    }
  }
}
