import { Injectable } from '@angular/core';
import { DialogueService } from '@components/dialogue/dialogue.service';
import { WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import {
  KitsuEntry,
  KitsuEntryAttributes,
  KitsuMappingData,
  KitsuMedia,
  KitsuResponse,
  KitsuStatus,
  KitsuUser,
} from '@models/kitsu';
import { ReadStatus } from '@models/manga';
import { KitsuNotificationsService } from '@services/kitsu/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { compareTwoStrings } from 'string-similarity';

@Injectable({
  providedIn: 'root',
})
export class KitsuService {
  private readonly baseUrl = 'https://kitsu.io/api/edge/';
  private accessToken = '';
  private refreshToken = '';
  // not app specific, see https://kitsu.docs.apiary.io/#introduction/authentication/app-registration
  private readonly clientId = 'dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd';
  private readonly clientSecret =
    '54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151';
  private userSubject = new BehaviorSubject<KitsuUser | undefined>(undefined);
  loggedIn = false;
  private kitsuNotifications: KitsuNotificationsService;

  constructor(private dialogue: DialogueService) {
    this.accessToken = String(localStorage.getItem('kitsuAccessToken'));
    this.refreshToken = String(localStorage.getItem('kitsuRefreshToken'));
    this.kitsuNotifications = new KitsuNotificationsService();
    if (this.accessToken && this.accessToken !== 'null') {
      this.kitsuNotifications.updateAccess = this.accessToken;
      this.login()
        .then(user => {
          if (user) {
            this.kitsuNotifications.updateUserId = user.id;
            this.userSubject.next(user);
          } else {
            throw new Error('User not found');
          }
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to Kitsu, please check your account settings.',
            'Kitsu Connection Error',
          );
          this.logoff();
        });
    }
  }

  async getId(
    search: { id?: number; title?: string; year?: number },
    type: 'anime' | 'manga',
    externalSite = 'myanimelist',
    kitsu?: number | string,
  ): Promise<{ kitsuId: string; entryId?: string } | undefined> {
    if (kitsu) {
      return {
        kitsuId: String(kitsu),
        entryId: (await this.getEntry(Number(kitsu), type))?.id,
      };
    }
    if (search.id) {
      const result = await fetch(
        `${this.baseUrl}mappings?filter[externalSite]=${externalSite}/${type}&filter[externalId]=${search.id}`,
      );
      if (result.ok) {
        const response = (await result.json()) as unknown as KitsuResponse<KitsuMappingData[]>;
        if (response.data.length) {
          const newUrl = response.data[0].relationships.item.links.related;
          const newResult = await fetch(newUrl);
          const animeResponse = (await newResult.json()) as KitsuResponse<KitsuEntry>;
          if (newResult.ok && animeResponse.data) {
            return {
              kitsuId: animeResponse.data.id,
              entryId: (await this.getEntry(Number(animeResponse.data.id), type))?.id,
            };
          }
        }
      }
    }
    if (search.title) {
      const title = search.title;
      const results = await this.getDataFromName(search.title, type);
      if (results.length) {
        const foundResult = results.find(result => {
          const titleSimilarity = compareTwoStrings(title, result.attributes.canonicalTitle);
          if (search.year) {
            return (
              titleSimilarity > 0.9 &&
              new Date(result.attributes.startDate).getFullYear() === search.year
            );
          }
          return titleSimilarity > 0.9;
        });
        return foundResult
          ? {
              kitsuId: String(foundResult?.id),
            }
          : undefined;
      }
    }
    return undefined;
  }

  async getIdFromSlug(slug: string, type: 'anime' | 'manga'): Promise<number | undefined> {
    const result = await fetch(`${this.baseUrl}${type}?filter[slug]=${slug}`);
    if (result.ok) {
      const response = (await result.json()) as KitsuResponse<KitsuEntry[]>;
      if (response.data.length) {
        return Number(response.data[0].id);
      }
    }
    return undefined;
  }

  async getDataFromName(name: string, type: 'anime' | 'manga'): Promise<KitsuMedia[]> {
    const result = await fetch(`${this.baseUrl}${type}?filter[text]=${name}`);
    if (result.ok) {
      const response = (await result.json()) as KitsuResponse<KitsuMedia[]>;
      if (response.data.length) {
        return response.data;
      }
    }
    return [];
  }

  async getExternalId(id: number, type: 'anime' | 'manga', externalSite = 'myanimelist') {
    const result = await fetch(
      `${this.baseUrl}${type}/${id}/mappings?filter[externalSite]=${externalSite}/${type}`,
    );
    if (result.ok) {
      const response = (await result.json()) as unknown as KitsuResponse<KitsuMappingData[]>;
      if (response.data.length) {
        return Number(response.data[0].attributes.externalId);
      }
    }
    return undefined;
  }

  async login(
    username?: string,
    password?: string,
    saveLogin = false,
  ): Promise<KitsuUser | undefined> {
    const CryptoJS = await import('crypto-js');
    if (saveLogin && username && password) {
      const usernameEncrypted = CryptoJS.AES.encrypt(username, this.clientId).toString();
      const passwordEncrypted = CryptoJS.AES.encrypt(password, this.clientId).toString();
      localStorage.setItem('kitsuUsername', usernameEncrypted);
      localStorage.setItem('kitsuPassword', passwordEncrypted);
    }
    if (!username && !password) {
      const usernameEncrypted = localStorage.getItem('kitsuUsername') || undefined;
      const passwordEncrypted = localStorage.getItem('kitsuPassword') || undefined;
      if (usernameEncrypted && passwordEncrypted) {
        username = CryptoJS.AES.decrypt(usernameEncrypted, this.clientId).toString(
          CryptoJS.enc.Utf8,
        );
        password = CryptoJS.AES.decrypt(passwordEncrypted, this.clientId).toString(
          CryptoJS.enc.Utf8,
        );
      }
    }
    const details = {
      grant_type: 'password',
      username,
      password,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    } as { [key: string]: string };

    if (!username || !password) {
      if (!this.refreshToken) {
        this.logoff();
        return;
      }
      details.grant_type = 'refresh_token';
      details.refresh_token = this.refreshToken;
      delete details.username;
      delete details.password;
    }

    const formBody = [];
    for (const property in details) {
      if (!details[property]) continue;
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    const body = formBody.join('&');
    const result = await fetch('https://kitsu.io/api/oauth/token', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body,
    });
    if (result.ok) {
      const response = (await result.json()) as OauthResponse;
      this.accessToken = response.access_token;
      this.kitsuNotifications.updateAccess = this.accessToken;
      localStorage.setItem('kitsuAccessToken', this.accessToken);
      this.refreshToken = response.refresh_token;
      localStorage.setItem('kitsuRefreshToken', this.refreshToken);
      return this.checkLogin();
    }
    return;
  }

  logoff() {
    this.accessToken = '';
    this.kitsuNotifications.updateAccess = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('kitsuAccessToken');
    localStorage.removeItem('kitsuRefreshToken');
  }

  async checkLogin(refresh = true): Promise<KitsuUser | undefined> {
    const result = await fetch(`${this.baseUrl}users?filter[self]=true`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as KitsuResponse<KitsuUser[]>;
      if (response.data.length) {
        const userdata = response.data[0];
        this.kitsuNotifications.updateUserId = userdata.id;
        this.userSubject.next(userdata);
        return userdata;
      }
    }
    if (refresh) {
      await this.login();
      return this.checkLogin(false);
    }
    return;
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async getEntry(id: number, type: 'anime' | 'manga' = 'anime'): Promise<KitsuEntry | undefined> {
    const user = await new Promise<{ id: string } | undefined>(r => this.user.subscribe(r));
    if (!user?.id) return;
    const result = await fetch(
      `${this.baseUrl}library-entries?filter[userId]=${user?.id}&filter[${type}Id]=${id}`,
      {
        headers: new Headers({
          Authorization: `Bearer ${this.accessToken}`,
        }),
      },
    );
    if (result.ok) {
      const response = (await result.json()) as KitsuResponse<KitsuEntry[]>;
      if (response.data.length) {
        return response.data[0];
      }
    }
    return;
  }

  async updateEntry(
    ids: { kitsuId: number | string; entryId?: string | undefined },
    type: 'anime' | 'manga' = 'anime',
    attributes: Partial<KitsuEntryAttributes>,
  ): Promise<KitsuEntry | undefined> {
    if (!ids.entryId) {
      const existing = await this.getEntry(Number(ids.kitsuId), type);
      if (!existing) {
        return this.createEntry(Number(ids.kitsuId), type, attributes);
      }
      ids.entryId = existing?.id;
    }
    const data = {
      attributes,
      id: ids.entryId,
      type: 'libraryEntries',
    };
    const result = await fetch(`${this.baseUrl}library-entries/${ids.entryId}`, {
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/vnd.api+json',
      }),
      body: JSON.stringify({ data }),
    });
    if (result.ok) {
      const { data: response } = (await result.json()) as KitsuResponse<KitsuEntry>;
      return response;
    }
    return;
  }

  async createEntry(
    id: number,
    type: 'anime' | 'manga' = 'anime',
    attributes: Partial<KitsuEntryAttributes>,
  ): Promise<KitsuEntry | undefined> {
    const user = await new Promise<{ id: string } | undefined>(r => this.user.subscribe(r));
    if (!user?.id) return;
    if (!attributes.status) attributes.status = 'planned';
    const data = {
      attributes,
      type: 'libraryEntries',
      relationships: {
        user: {
          data: {
            id: String(user.id),
            type: 'users',
          },
        },
        media: {
          data: {
            id: String(id),
            type,
          },
        },
      },
    };
    const result = await fetch(
      `${this.baseUrl}library-entries?filter[userId]=${user?.id}&filter[${type}Id]=${id}`,
      {
        method: 'POST',
        headers: new Headers({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/vnd.api+json',
        }),
        body: JSON.stringify({ data }),
      },
    );
    if (result.ok) {
      const { data: response } = (await result.json()) as KitsuResponse<KitsuEntry>;
      return response;
    }
    return;
  }

  async deleteEntry(
    ids?: { kitsuId: number | string; entryId?: string },
    type: 'anime' | 'manga' = 'anime',
  ): Promise<boolean> {
    if (!ids) {
      return true;
    }
    const user = await new Promise<{ id: string } | undefined>(r => this.user.subscribe(r));
    if (!user?.id) return true;
    if (!ids.entryId) {
      const existing = await this.getEntry(Number(ids.kitsuId), type);
      if (!existing) {
        return true;
      }
      ids.entryId = existing?.id;
    }
    const result = await fetch(`${this.baseUrl}library-entries/${ids.entryId}`, {
      method: 'DELETE',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/vnd.api+json',
      }),
    });
    if (result.ok) {
      return true;
    }
    return false;
  }

  async getRating(id?: number, type: 'anime' | 'manga' = 'anime'): Promise<ExtRating | undefined> {
    if (!id) return;
    const result = await fetch(`${this.baseUrl}${type}/${id}`, {
      headers: new Headers({ 'Content-Type': 'application/vnd.api+json' }),
    });
    if (result.ok) {
      const response = (await result.json()) as KitsuResponse<KitsuMedia>;
      if (response.data.attributes.averageRating) {
        let ratings = 0;
        for (const rating in response.data.attributes.ratingFrequencies) {
          if (response.data.attributes.ratingFrequencies[rating]) {
            ratings += Number(response.data.attributes.ratingFrequencies[rating]) || 0;
          }
        }
        return {
          nom: Math.round(Number(response.data.attributes.averageRating) / 10) / 2,
          norm: Number(response.data.attributes.averageRating),
          ratings,
          unit: '/ 5',
        };
      }
    }
    return;
  }

  get notifications() {
    return this.kitsuNotifications.notifications;
  }

  async markNotificationsAsRead() {
    return this.kitsuNotifications.markAsRead();
  }

  statusFromMal(malStatus?: WatchStatus | ReadStatus): KitsuStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'planned';
      case 'reading':
      case 'watching':
        return 'current';
      case 'completed':
      case 'dropped':
      case 'on_hold':
        return malStatus;
      default:
        return undefined;
    }
  }

  statusToMal(
    kitsuStatus?: KitsuStatus,
    type: 'anime' | 'manga' = 'anime',
  ): WatchStatus | ReadStatus | undefined {
    switch (kitsuStatus) {
      case 'planned':
        return type === 'manga' ? 'plan_to_read' : 'plan_to_watch';
      case 'current':
        return type === 'manga' ? 'reading' : 'watching';
      case 'completed':
      case 'dropped':
      case 'on_hold':
        return kitsuStatus;
      default:
        return undefined;
    }
  }
}

interface OauthResponse {
  access_token: string;
  created_at: number;
  expires_in: number;
  refresh_token: string;
  scope: string;
}
