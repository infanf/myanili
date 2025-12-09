import { Injectable } from '@angular/core';
import { AnilistNotification, AnilistSaveMedialistEntry, AnilistUser } from '@models/anilist';
import { ExtRating } from '@models/components';
import { DialogueService } from '@services/dialogue.service';
import { cacheExchange, Client, fetchExchange, gql } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AnilistFeedService } from './anilist/feed.service';
import { AnilistLibraryService } from './anilist/library.service';
import { AnilistMediaService } from './anilist/media.service';
import { AnilistNotificationsService } from './anilist/notifications.service';
import { PlatformService } from './platform.service';
import { AnilistMobileOAuthService } from './mobile/anilist-mobile-oauth.service';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  private anilistMedia!: AnilistMediaService;
  private anilistNotifications!: AnilistNotificationsService;
  private anilistLibrary!: AnilistLibraryService;
  private anilistFeed!: AnilistFeedService;
  private client!: Client;
  private mobileOAuth?: AnilistMobileOAuthService;

  loggedIn = false;
  constructor(
    private dialogue: DialogueService,
    private platformService: PlatformService
  ) {
    if (this.platformService.isMobile) {
      // Mobile initialization handled by app.component
    } else {
      // Web implementation (existing code)
      this.initializeWeb();
    }
  }

  private initializeWeb() {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));

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
        })
        .catch(() => {
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
    this.anilistFeed = new AnilistFeedService(this.client);
  }

  async initializeMobile(mobileOAuth: AnilistMobileOAuthService) {
    this.mobileOAuth = mobileOAuth;
    this.client = mobileOAuth.getClient();

    const user = await mobileOAuth.checkLogin();
    if (user) {
      this.userSubject.next(user);
      this.loggedIn = true;
    }

    this.anilistMedia = new AnilistMediaService(this.client);
    this.anilistNotifications = new AnilistNotificationsService(this.client);
    this.anilistLibrary = new AnilistLibraryService(this.client, this.user);
    this.anilistFeed = new AnilistFeedService(this.client);
  }

  async login() {
    if (this.platformService.isMobile && this.mobileOAuth) {
      const user = await this.mobileOAuth.login();
      if (user) {
        this.userSubject.next(user);
        this.loggedIn = true;
      }
      return;
    }

    // Web implementation (existing)
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
    if (this.platformService.isMobile && this.mobileOAuth) {
      return this.mobileOAuth.checkLogin();
    }

    // Web implementation (existing)
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
    if (this.platformService.isMobile && this.mobileOAuth) {
      this.mobileOAuth.logoff();
      this.userSubject.next(undefined);
      this.loggedIn = false;
      return;
    }

    // Web implementation (existing)
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
}
