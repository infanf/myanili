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
          localStorage.setItem('traktAccessToken', this.accessToken);
          this.clientId = data.ci;
          localStorage.setItem('traktClientId', this.clientId);
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
    if (!malId || !title) return;
    return;
  }

  get user() {
    return this.userSubject.asObservable();
  }
}
