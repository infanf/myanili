import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { CapacitorHttp } from '@capacitor/core';
import { TokenService } from '../token.service';
import { MalUser } from '@models/user';
import { ListAnime, WatchStatus } from '@models/anime';
import { ListManga, ReadStatus } from '@models/manga';
import { PKCEUtil } from './pkce.util';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MalMobileOAuthService {
  private clientId = 'c442088e3756db28eca7f4c1e68a6004';
  private redirectUri = 'myanilist://mal-callback';
  private loginResolve?: (user: MalUser | undefined) => void;
  private codeVerifier?: string;

  constructor(private tokenService: TokenService) {
    if (environment.platform === 'mobile') {
      this.setupUrlListener();
    }
  }

  private setupUrlListener() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url.startsWith(this.redirectUri)) {
        this.handleCallback(event.url);
      }
    });
  }

  async login(): Promise<MalUser | undefined> {
    return new Promise(async (resolve) => {
      this.loginResolve = resolve;

      // Generate PKCE verifier and challenge
      this.codeVerifier = PKCEUtil.generateCodeVerifier();
      const codeChallenge = await PKCEUtil.generateCodeChallenge(this.codeVerifier);

      const authUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=plain`;

      await Browser.open({ url: authUrl });
    });
  }

  private async handleCallback(url: string) {
    await Browser.close();

    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');

    if (!code || !this.codeVerifier) {
      this.loginResolve?.(undefined);
      return;
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, this.codeVerifier);

    if (!tokens) {
      this.loginResolve?.(undefined);
      return;
    }

    const user = await this.checkLogin();
    this.loginResolve?.(user);
  }

  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<boolean> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await CapacitorHttp.post({
      url: 'https://myanimelist.net/v1/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(),
    });

    if (response.status !== 200) return false;

    const data = response.data;

    await this.tokenService.saveTokens('mal', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return true;
  }

  private async getAccessToken(): Promise<string | null> {
    const tokens = await this.tokenService.getTokens('mal');
    if (!tokens) return null;

    // Check if expired and refresh if needed
    if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
      const refreshed = await this.refreshTokens();
      if (!refreshed) return null;

      const newTokens = await this.tokenService.getTokens('mal');
      return newTokens?.accessToken || null;
    }

    return tokens.accessToken;
  }

  private async refreshTokens(): Promise<boolean> {
    const tokens = await this.tokenService.getTokens('mal');
    if (!tokens?.refreshToken) return false;

    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
    });

    const response = await CapacitorHttp.post({
      url: 'https://myanimelist.net/v1/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(),
    });

    if (response.status !== 200) return false;

    const data = response.data;

    await this.tokenService.saveTokens('mal', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return true;
  }

  async checkLogin(): Promise<MalUser | undefined> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return undefined;

    const response = await CapacitorHttp.get({
      url: 'https://api.myanimelist.net/v2/users/@me',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MyAniLi',
      },
    });

    if (response.status !== 200) return undefined;

    return response.data;
  }

  async myList(
    status?: WatchStatus,
    options?: { limit?: number; offset?: number; sort?: string }
  ): Promise<ListAnime[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    const params = new URLSearchParams({
      limit: String(options?.limit || 50),
      offset: String(options?.offset || 0),
      sort: options?.sort || 'anime_start_date',
      fields: 'list_status,num_episodes,status,start_date,end_date',
    });

    if (status) {
      params.set('status', status);
    }

    const response = await CapacitorHttp.get({
      url: `https://api.myanimelist.net/v2/users/@me/animelist?${params}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MyAniLi',
      },
    });

    if (response.status !== 200) return [];

    return response.data.data || [];
  }

  async myMangaList(
    status?: ReadStatus,
    options?: { limit?: number; offset?: number }
  ): Promise<ListManga[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    const params = new URLSearchParams({
      limit: String(options?.limit || 50),
      offset: String(options?.offset || 0),
      fields: 'list_status,num_chapters,num_volumes,status,start_date,end_date',
    });

    if (status) {
      params.set('status', status);
    }

    const response = await CapacitorHttp.get({
      url: `https://api.myanimelist.net/v2/users/@me/mangalist?${params}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MyAniLi',
      },
    });

    if (response.status !== 200) return [];

    return response.data.data || [];
  }

  async updateAnime(id: number, updates: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    const params = new URLSearchParams(updates);

    const response = await CapacitorHttp.put({
      url: `https://api.myanimelist.net/v2/anime/${id}/my_list_status`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MyAniLi',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(),
    });

    if (response.status !== 200) return null;

    return response.data;
  }

  async logoff() {
    await this.tokenService.clearTokens('mal');
  }
}
