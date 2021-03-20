import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnictService {
  private accessToken?: string;
  private clientId?: string;
  private readonly baseUrl = 'https://api.annict.com/v1/';
  private readonly graphqlUrl = 'https://api.annict.com/graphql';
  private userSubject = new BehaviorSubject<string | undefined>(undefined);

  constructor() {
    this.accessToken = String(localStorage.getItem('annictAccessToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to Annict, please check your account settings.');
          localStorage.removeItem('annictAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'annictauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.annict) {
          const data = event.data as { at: string; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('annictAccessToken', this.accessToken);
          this.clientId = data.ci;
          localStorage.setItem('annictClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  async checkLogin(): Promise<string | undefined> {
    if (!this.clientId || !this.accessToken) return;
    const result = await fetch(`${this.baseUrl}me?access_token=${this.accessToken}`);
    if (result.ok) {
      const response = (await result.json()) as { name?: string };
      return response.name;
    }
    return;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('annictAccessToken');
    localStorage.removeItem('annictClientId');
  }

  async getId(malId: number, title: string): Promise<number | undefined> {
    if (!malId || !title || !this.accessToken) return;
    const query = `
      query {
        searchWorks(titles: ["${title}","${title.replace(/\s/g, '')}"]) {
          nodes {
            annictId
            malAnimeId
            title
          }
        }
      }
    `;
    const result = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ query, variables: {} }),
    });
    if (!result.ok) return;
    const response = (await result.json()) as {
      data: { searchWorks: { nodes: Array<{ annictId: number; malAnimeId?: string }> } };
    };
    if (response.data?.searchWorks?.nodes?.length) {
      const endResult = response.data?.searchWorks?.nodes.filter(
        series => Number(series.malAnimeId) === malId,
      );
      if (endResult.length) {
        return endResult[0].annictId;
      }
    }
    return;
  }

  get user() {
    return this.userSubject.asObservable();
  }
}
