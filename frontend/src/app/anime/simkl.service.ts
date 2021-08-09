import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';
import { MyMediaUpdate, PersonalStatus } from '@models/media';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SimklService {
  private readonly baseUrl = 'https://api.simkl.com/';
  private clientId = '';
  private accessToken = '';
  private userSubject = new BehaviorSubject<number | undefined>(undefined);

  constructor() {
    this.clientId = String(localStorage.getItem('simklClientId'));
    this.accessToken = String(localStorage.getItem('simklAccessToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to SIMKL, please check your account settings.');
          localStorage.removeItem('simklAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'simklauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.simkl) {
          const data = event.data as { at: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('simklAccessToken', this.accessToken);
          this.clientId = data.ci;
          localStorage.setItem('simklClientId', this.clientId);
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

  async checkLogin(): Promise<number | undefined> {
    if (
      !this.accessToken ||
      !this.clientId ||
      this.accessToken === 'null' ||
      this.clientId === 'null'
    ) {
      return;
    }
    const result = await fetch(`${this.baseUrl}users/settings`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as { account?: { id?: number } };
      return response?.account?.id;
    }
    return;
  }

  async getId(malId: number): Promise<number | undefined> {
    if (!this.clientId) return;
    const result = await fetch(`${this.baseUrl}search/id?mal=${malId}`, {
      headers: new Headers({ 'simkl-api-key': this.clientId }),
    });
    if (result.ok) {
      const response = (await result.json()) as IdSearch[];
      if (response?.length) {
        return response[0].ids.simkl;
      }
    }
    return;
  }

  async scrobble(ids: { simkl?: number; mal?: number }, number?: number) {
    if (!this.clientId || !this.accessToken || (!ids.simkl && !ids.mal) || !number) return;
    const scrobbleData = { shows: [{ ids, seasons: [{ number: 1, episodes: [{ number }] }] }] };
    return fetch(`${this.baseUrl}sync/history`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      }),
      body: JSON.stringify(scrobbleData),
    });
  }

  async updateEntry(ids: { simkl?: number; mal?: number }, data: Partial<MyMediaUpdate>) {
    if (!this.clientId || !this.accessToken || (!ids.simkl && !ids.mal)) return;
    const promises = [];
    if (data.status) {
      promises.push(this.addToList(ids, this.statusToSimkl(data.status)));
    }
    if (data.score) {
      promises.push(this.addRating(ids, data.score));
    }
    if (data.progress) {
      promises.push(this.scrobble(ids, data.progress));
    }
    await Promise.all(promises);
  }

  async addToList(ids: { simkl?: number; mal?: number }, list?: SimklList) {
    if (!this.clientId || !this.accessToken || (!ids.simkl && !ids.mal) || !list) return;
    const toListData = { shows: [{ to: list, ids }] };
    return fetch(`${this.baseUrl}sync/add-to-list`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      }),
      body: JSON.stringify(toListData),
    });
  }

  async deleteEntry(id?: number) {
    if (!this.clientId || !this.accessToken || !id) return;
    const deleteData = { shows: [{ ids: { simkl: id } }] };
    return fetch(`${this.baseUrl}sync/history/remove`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      }),
      body: JSON.stringify(deleteData),
    });
  }

  async addRating(ids: { simkl?: number; mal?: number }, rating: number) {
    if (!this.clientId || !this.accessToken || (!ids.simkl && !ids.mal)) return;
    const ratingData = { shows: [{ rating, ids }] };
    return fetch(`${this.baseUrl}sync/ratings`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'simkl-api-key': this.clientId,
      }),
      body: JSON.stringify(ratingData),
    });
  }

  async getRating(id?: number): Promise<ExtRating | undefined> {
    if (!this.clientId || !id) return;
    const result = await fetch(`${this.baseUrl}ratings?simkl=${id}`, {
      headers: new Headers({
        'simkl-api-key': this.clientId,
      }),
    });
    if (result.ok) {
      const response = (await result.json()) as { simkl?: { rating: number; votes: number } };
      if (response.simkl?.rating) {
        const nom = response.simkl?.rating;
        return { nom, norm: nom * 10, ratings: response.simkl.votes };
      }
    }
    return;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('simklAccessToken');
    localStorage.removeItem('simklClientId');
  }

  statusToSimkl(status?: PersonalStatus): SimklList | undefined {
    switch (status) {
      case 'planning':
        return 'plantowatch';
      case 'on_hold':
        return 'hold';
      case 'dropped':
        return 'notinteresting';
      case 'current':
        return 'watching';
      case 'completed':
        return 'completed';
      default:
        return undefined;
    }
  }

  statusToMal(status?: SimklList): PersonalStatus | undefined {
    switch (status) {
      case 'plantowatch':
        return 'planning';
      case 'hold':
        return 'on_hold';
      case 'notinteresting':
        return 'dropped';
      case 'completed':
        return 'completed';
      case 'watching':
        return 'current';
      default:
        return undefined;
    }
  }
}

interface IdSearch {
  ids: {
    simkl: number;
  };
}

export type SimklList = 'plantowatch' | 'completed' | 'watching' | 'hold' | 'notinteresting';
