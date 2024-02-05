import { Injectable } from '@angular/core';
import { ShikimoriUser } from '@models/shikimori';
import { Client } from '@urql/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import { DialogueService } from './dialogue.service';

@Injectable({
  providedIn: 'root',
})
export class ShikimoriService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<ShikimoriUser | undefined>(undefined);
  private loggedIn = false;
  private client!: Client;

  constructor(private dialogue: DialogueService) {
    this.clientId = String(localStorage.getItem('shikimoriClientId'));
    this.accessToken = String(localStorage.getItem('shikimoriAccessToken'));
    this.refreshToken = String(localStorage.getItem('shikimoriRefreshToken'));

    const { createClient, cacheExchange, fetchExchange } =
      require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://shikimori.one/api/graphql',
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
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to Shikimori, please check your account settings.',
            'Shikimori Connection Error',
          );
          localStorage.removeItem('shikimoriAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'shikimori/auth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.shikimori) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('shikimoriAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('shikimoriRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('shikimoriClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('shikimoriAccessToken');
    localStorage.removeItem('shikimoriRefreshToken');
    localStorage.removeItem('shikimoriClientId');
  }

  async checkLogin(): Promise<ShikimoriUser | undefined> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      {
        currentUser {
          id
          avatarUrl
          nickname
        }
      }
    `;

    const result = await this.client
      .query<{ currentUser: ShikimoriUser }>(QUERY, {})
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const requestResult = result?.data?.currentUser;
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  get user() {
    return this.userSubject.asObservable();
  }

  /** @deprecated only here to satisfy the linter */
  get loggedInUser() {
    return this.loggedIn;
  }
}
