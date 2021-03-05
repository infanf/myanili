import { Injectable } from '@angular/core';
import { KitsuMappingResponse } from '@models/kitsu';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KitsuService {
  private baseUrl = 'https://kitsu.io/api/edge/';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<string | undefined>(undefined);
  loggedIn = false;

  constructor() {
    this.accessToken = String(localStorage.getItem('kitsuAccessToken'));
    this.refreshToken = String(localStorage.getItem('kitsuRefreshToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to Kitsu, please check your account settings.');
          localStorage.removeItem('kitsuAccessToken');
        });
    }
  }

  async getId(
    externalId: number,
    type: 'anime' | 'manga',
    externalSite = 'myanimelist',
  ): Promise<string | undefined> {
    const result = await fetch(
      `${this.baseUrl}mappings?filter[externalSite]=${externalSite}/${type}&filter[externalId]=${externalId}`,
    );
    if (result.ok) {
      const response = ((await result.json()) as unknown) as KitsuMappingResponse;
      if (response.data.length) {
        const newUrl = response.data[0].relationships.item.links.related;
        const newResult = await fetch(newUrl);
        const animeResponse = ((await newResult.json()) as unknown) as {
          data?: { id: string; attributes: { slug: string } };
        };
        if (newResult.ok && animeResponse.data) {
          return animeResponse.data.attributes.slug || animeResponse.data.id;
        }
      }
    }
    return undefined;
  }

  async login(username: string, password: string) {
    const result = await fetch('https://kitsu.io/api/oauth/token', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        grant_type: 'password',
        email: encodeURI(username),
        password: encodeURI(password),
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as OauthResponse;
      this.accessToken = response.access_token;
      localStorage.setItem('kitsuAccessToken', this.accessToken);
      this.refreshToken = response.refresh_token;
      localStorage.setItem('kitsuRefreshToken', this.refreshToken);
    }
  }

  logoff() {
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('kitsuAccessToken');
    localStorage.removeItem('kitsuRefreshToken');
  }

  async checkLogin() {
    const result = await fetch(`${this.baseUrl}users?filter[self]=true`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as { data: UserResponse[] };
      if (response.data.length) {
        return response.data[0].attributes.name;
      }
    }
    return undefined;
  }
}

interface OauthResponse {
  access_token: string;
  created_at: number;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface UserResponse {
  id: string;
  attributes: {
    name: string;
  };
}
