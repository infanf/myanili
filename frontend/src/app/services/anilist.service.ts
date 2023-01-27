import { Injectable } from '@angular/core';
import {
  AnilistMediaListStatus,
  AnilistNotification,
  AnilistSaveMedialistEntry,
  AnilistUser,
} from '@models/anilist';
import { WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { ReadStatus } from '@models/manga';
import { DialogueService } from '@services/dialogue.service';
import { Client } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AnilistLibraryService } from './anilist/library.service';
import { AnilistMediaService } from './anilist/media.service';
import { AnilistNotificationsService } from './anilist/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  private anilistMedia: AnilistMediaService;
  private anilistNotifications: AnilistNotificationsService;
  private anilistLibrary: AnilistLibraryService;
  private client!: Client;

  loggedIn = false;
  constructor(private dialogue: DialogueService) {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));
    const { createClient } = require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://graphql.anilist.co',
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        };
      },
    });
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to AniList, please check your account settings.',
            'AniList Connection Error',
          );
          localStorage.removeItem('anilistAccessToken');
        });
    }
    this.anilistMedia = new AnilistMediaService(this.client);
    this.anilistNotifications = new AnilistNotificationsService(this.client);
    this.anilistLibrary = new AnilistLibraryService(this.client, this.user);
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilist/auth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.anilist) {
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
    const { gql } = await import('@urql/core');
    const QUERY = gql`
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
    `;

    const result = await this.client
      .query<{ Viewer: AnilistUser }>(QUERY, {})
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const requestResult = result?.data?.Viewer;
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('anilistAccessToken');
    localStorage.removeItem('anilistRefreshToken');
    localStorage.removeItem('anilistClientId');
  }

  async getId(idMal: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    return this.anilistMedia.getId(idMal, type);
  }

  async getMalId(id: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    return this.anilistMedia.getMalId(id, type);
  }
  async updateEntry(id: number, data: Partial<AnilistSaveMedialistEntry>) {
    return this.anilistLibrary.updateEntry(id, data);
  }

  async getMediaListId(id: number): Promise<number | undefined> {
    return this.anilistLibrary.getMediaListId(id);
  }

  async deleteEntry(mediaId?: number): Promise<{ deleted: boolean; msg?: string }> {
    return this.anilistLibrary.deleteEntry(mediaId);
  }

  async getRating(id?: number, type: 'ANIME' | 'MANGA' = 'ANIME'): Promise<ExtRating | undefined> {
    return this.anilistMedia.getRating(id, type);
  }

  get notifications(): Observable<AnilistNotification[]> {
    return this.anilistNotifications.notifications;
  }

  async markNotificationsAsRead(): Promise<boolean> {
    return this.anilistNotifications.markAsRead();
  }

  statusFromMal(
    malStatus?: WatchStatus | ReadStatus,
    repeating = false,
  ): AnilistMediaListStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'PLANNING';
      case 'completed':
        return repeating ? 'REPEATING' : 'COMPLETED';
      case 'dropped':
        return 'DROPPED';
      case 'on_hold':
        return 'PAUSED';
      case 'reading':
      case 'watching':
        return 'CURRENT';
      default:
        return undefined;
    }
  }

  statusToMal(
    alStatus?: AnilistMediaListStatus,
    type: 'ANIME' | 'MANGA' = 'ANIME',
  ): WatchStatus | ReadStatus | undefined {
    switch (alStatus) {
      case 'PLANNING':
        return type === 'MANGA' ? 'plan_to_read' : 'plan_to_watch';
      case 'CURRENT':
        return type === 'MANGA' ? 'reading' : 'watching';
      case 'REPEATING':
      case 'COMPLETED':
        return 'completed';
      case 'PAUSED':
        return 'on_hold';
      case 'DROPPED':
        return 'dropped';
      default:
        return undefined;
    }
  }
}
