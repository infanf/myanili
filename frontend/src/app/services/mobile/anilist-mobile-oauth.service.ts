import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { TokenService } from '../token.service';
import { AnilistUser } from '@models/anilist';
import { Client, cacheExchange, fetchExchange, gql } from '@urql/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnilistMobileOAuthService {
  private client!: Client;
  private clientId = '18928'; // Mobile app client ID (register new)
  private redirectUri = 'myanilist://anilist-callback';
  private loginResolve?: (user: AnilistUser | undefined) => void;

  constructor(private tokenService: TokenService) {
    if (environment.platform === 'mobile') {
      this.setupUrlListener();
      this.initializeClient();
    }
  }

  private setupUrlListener() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url.startsWith(this.redirectUri)) {
        this.handleCallback(event.url);
      }
    });
  }

  private async initializeClient() {
    const tokens = await this.tokenService.getTokens('anilist');

    this.client = new Client({
      url: 'https://graphql.anilist.co',
      preferGetMethod: false,
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken || ''}`,
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });
  }

  async login(): Promise<AnilistUser | undefined> {
    return new Promise(async (resolve) => {
      this.loginResolve = resolve;

      const authUrl = `https://anilist.co/api/v2/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=token`;

      await Browser.open({ url: authUrl });
    });
  }

  private async handleCallback(url: string) {
    await Browser.close();

    // AniList uses implicit flow (token in URL fragment)
    const fragment = url.split('#')[1];
    if (!fragment) {
      this.loginResolve?.(undefined);
      return;
    }

    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (!accessToken) {
      this.loginResolve?.(undefined);
      return;
    }

    const expiresAt = expiresIn
      ? Date.now() + parseInt(expiresIn) * 1000
      : undefined;

    await this.tokenService.saveTokens('anilist', {
      accessToken,
      expiresAt,
      clientId: this.clientId,
    });

    await this.initializeClient();
    const user = await this.checkLogin();
    this.loginResolve?.(user);
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
      .catch(() => undefined);

    return result?.data?.Viewer;
  }

  async logoff() {
    await this.tokenService.clearTokens('anilist');
    await this.initializeClient();
  }

  getClient(): Client {
    return this.client;
  }
}
