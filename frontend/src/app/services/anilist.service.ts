import { Injectable } from '@angular/core';
import {
  AnilistCharacterDetail,
  AnilistCharacterMediaRole,
  AnilistCharacterVoiceActor,
  AnilistMediaRef,
  AnilistMediaSearchResult,
  AnilistNotification,
  AnilistSaveMedialistEntry,
  AnilistStaffDetail,
  AnilistStaffMediaRole,
  AnilistStaffVoiceRole,
  AnilistStudioDetail,
  AnilistUser,
  AnilistWorkCharacter,
  AnilistWorkRelation,
  AnilistWorkStaff,
} from '@models/anilist';
import { ExtRating } from '@models/components';
import { ConnectionStatusService } from '@services/connection-status.service';
import { readStoredToken } from '@services/global.service';
import { cacheExchange, Client, fetchExchange, gql } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AnilistCharacterService } from './anilist/character.service';
import { AnilistFeedService } from './anilist/feed.service';
import { AnilistLibraryService } from './anilist/library.service';
import { AnilistMediaService } from './anilist/media.service';
import { AnilistNotificationsService } from './anilist/notifications.service';
import { AnilistPersonService } from './anilist/person.service';
import { AnilistStudioService } from './anilist/studio.service';

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
  private anilistFeed: AnilistFeedService;
  private anilistCharacter: AnilistCharacterService;
  private anilistPerson: AnilistPersonService;
  private anilistStudio: AnilistStudioService;
  private client!: Client;

  loggedIn = false;
  constructor(private connection: ConnectionStatusService) {
    this.clientId = readStoredToken('anilistClientId');
    this.accessToken = readStoredToken('anilistAccessToken');
    this.refreshToken = readStoredToken('anilistRefreshToken');

    this.client = new Client({
      url: 'https://graphql.anilist.co',
      preferGetMethod: false,
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
          if (user) {
            this.connection.clearError('anilist');
          } else {
            this.reportConnectionError();
          }
        })
        .catch(() => {
          this.reportConnectionError();
        });
    }
    this.anilistMedia = new AnilistMediaService(this.client);
    this.anilistNotifications = new AnilistNotificationsService(this.client);
    this.anilistLibrary = new AnilistLibraryService(this.client, this.user);
    this.anilistFeed = new AnilistFeedService(this.client);
    this.anilistCharacter = new AnilistCharacterService(this.client);
    this.anilistPerson = new AnilistPersonService(this.client);
    this.anilistStudio = new AnilistStudioService(this.client);
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
          const user = await this.checkLogin();
          this.userSubject.next(user);
          if (user) this.connection.clearError('anilist');
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

  private reportConnectionError() {
    this.connection.reportError(
      'anilist',
      'Could not verify your AniList session. It may have expired – reconnect to renew it.',
    );
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    this.connection.clearError('anilist');
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

  async searchMedia(search: string, type: 'ANIME' | 'MANGA'): Promise<AnilistMediaSearchResult[]> {
    return this.anilistMedia.search(search, type);
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

  async getLang(id: number): Promise<string | undefined> {
    return this.anilistMedia.getLang(id);
  }

  async getAirDates(id: number | number[]) {
    return this.anilistMedia.getAirDates(id);
  }

  async getStatusMapping(malIds: number[], type: 'ANIME' | 'MANGA') {
    return this.anilistLibrary.getStatusMapping(malIds, type);
  }

  async loadUserFeed(userId?: number, perPage = 25, page = 1, forceRefresh = false) {
    return this.anilistFeed.loadUserFeed(userId, perPage, page, forceRefresh);
  }

  async loadFollowingFeed(perPage = 25, page = 1, forceRefresh = false) {
    return this.anilistFeed.loadFollowingFeed(perPage, page, forceRefresh);
  }

  async loadActivity(activityId: number, forceRefresh = false) {
    return this.anilistFeed.loadActivity(activityId, forceRefresh);
  }

  async toggleActivityLike(activityId: number): Promise<boolean> {
    return this.anilistFeed.toggleLike(activityId);
  }

  async toggleReplyLike(replyId: number): Promise<boolean> {
    return this.anilistFeed.toggleReplyLike(replyId);
  }

  async postActivityReply(activityId: number, text: string): Promise<boolean> {
    return this.anilistFeed.postReply(activityId, text);
  }

  async loadActivityLikes(activityId: number): Promise<boolean> {
    return this.anilistFeed.loadActivityLikes(activityId);
  }

  async loadActivityReplies(activityId: number): Promise<boolean> {
    return this.anilistFeed.loadActivityReplies(activityId);
  }

  async loadReplyLikes(activityId: number, replyId: number): Promise<boolean> {
    return this.anilistFeed.loadReplyLikes(activityId, replyId);
  }

  get feed() {
    return this.anilistFeed.feed;
  }

  get feedLoading() {
    return this.anilistFeed.loading;
  }

  async getExternalWebsite(id: number): Promise<string | undefined> {
    return this.anilistMedia.getExternalWebsite(id);
  }

  async getRelations(id: number): Promise<AnilistWorkRelation[]> {
    return this.anilistMedia.getRelations(id);
  }

  async getWorkCharacters(id: number): Promise<AnilistWorkCharacter[]> {
    return this.anilistMedia.getCharacters(id);
  }

  async getWorkStaff(id: number): Promise<AnilistWorkStaff[]> {
    return this.anilistMedia.getStaff(id);
  }

  async getCharacter(id: number): Promise<AnilistCharacterDetail | undefined> {
    return this.anilistCharacter.getCharacter(id);
  }

  async getCharacterMediaRoles(
    id: number,
    type: 'ANIME' | 'MANGA',
  ): Promise<AnilistCharacterMediaRole[]> {
    return this.anilistCharacter.getMediaRoles(id, type);
  }

  async getCharacterVoiceActors(id: number): Promise<AnilistCharacterVoiceActor[]> {
    return this.anilistCharacter.getVoiceActors(id);
  }

  async getPerson(id: number): Promise<AnilistStaffDetail | undefined> {
    return this.anilistPerson.getPerson(id);
  }

  async getPersonVoiceRoles(id: number): Promise<AnilistStaffVoiceRole[]> {
    return this.anilistPerson.getVoiceRoles(id);
  }

  async getPersonMediaRoles(id: number, type: 'ANIME' | 'MANGA'): Promise<AnilistStaffMediaRole[]> {
    return this.anilistPerson.getMediaRoles(id, type);
  }

  async findStudioByName(name: string): Promise<AnilistStudioDetail | undefined> {
    return this.anilistStudio.findByName(name);
  }

  async getStudioMedia(id: number): Promise<AnilistMediaRef[]> {
    return this.anilistStudio.getMedia(id);
  }
}
