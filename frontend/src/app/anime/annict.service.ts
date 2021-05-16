import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';
import { MyMediaUpdate, PersonalStatus } from '@models/media';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnictService {
  private accessToken?: string;
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

  private getFetchHeader() {
    return new Headers({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'annictauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.annict) {
          const data = event.data as { at: string; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('annictAccessToken', this.accessToken);
          localStorage.setItem('annictClientId', data.ci);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  async checkLogin(): Promise<string | undefined> {
    if (!this.accessToken) return;
    const result = await fetch(`${this.baseUrl}me?access_token=${this.accessToken}`);
    if (result.ok) {
      const response = (await result.json()) as { name?: string };
      return response.name;
    }
    return;
  }

  logoff() {
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('annictAccessToken');
    localStorage.removeItem('annictClientId');
  }

  async getId(malId: number, title: string): Promise<number | undefined> {
    if (!malId || !title || !this.accessToken) return;
    title = title.replace('!', '！').replace('?', '');
    const query = `
      query {
        searchWorks(titles: ["${title}","${title.replace(/\s/g, '')}"]) {
          nodes {
            annictId
            malAnimeId
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

  async getRating(id?: number): Promise<ExtRating | undefined> {
    if (!id || !this.accessToken) return;
    const query = `
      query {
        searchWorks(annictIds: [${id}]) {
          nodes {
            satisfactionRate
            reviewsCount
          }
        }
      }
    `;
    const result = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: this.getFetchHeader(),
      body: JSON.stringify({ query, variables: {} }),
    });
    if (!result.ok) return;
    const response = (await result.json()) as {
      data: { searchWorks: { nodes: Array<{ satisfactionRate?: number; reviewsCount?: number }> } };
    };
    const rating = response.data?.searchWorks?.nodes[0]?.satisfactionRate;
    return rating
      ? {
          nom: rating,
          norm: rating,
          unit: '%',
          ratings: response.data.searchWorks.nodes[0].reviewsCount,
        }
      : undefined;
  }

  async updateEntry(annictId?: number, data?: Partial<MyMediaUpdate>) {
    if (!annictId || !this.accessToken) return;
    if (data?.progress) {
      this.updateProgress(annictId, data?.progress);
    }
    if (data?.status) {
      this.updateStatus(annictId, this.statusToAnnict(data.status));
    }
    if (data?.score) {
      this.addRating(annictId, data.score);
    }
  }

  async updateStatus(annictId: number, status?: AnnictStatus) {
    if (!this.accessToken || !status) return;
    await fetch(`${this.baseUrl}me/statuses?work_id=${annictId}&kind=${status}`, {
      method: 'POST',
      headers: this.getFetchHeader(),
    });
  }

  async updateProgress(annictId: number, episodeMin: number, episodeMax?: number) {
    if (!this.accessToken) return;
    const episodes = await this.getEpisodeIds(annictId, episodeMin, episodeMax);
    for (const episode of episodes) {
      fetch(`${this.baseUrl}me/records?episode_id=${episode}`, {
        method: 'POST',
        headers: this.getFetchHeader(),
      });
    }
  }

  async addRating(annictId: number, rating: number) {
    if (!this.accessToken || !rating) return;
    const annictRating =
      rating < 5 ? 'bad' : rating < 7 ? 'average' : rating < 9 ? 'good' : 'great';
    fetch(
      `${this.baseUrl}me/reviews?work_id=${annictId}&rating_overall_state=${annictRating}&body=-`,
      { method: 'POST', headers: this.getFetchHeader() },
    );
  }

  async getEpisodeIds(
    annictId: number,
    episodeMin: number,
    episodeMax?: number,
  ): Promise<number[]> {
    if (!this.accessToken) return [];
    if (!episodeMax) episodeMax = episodeMin;
    const episodes: number[] = [];
    const perPage = 50;
    if (Math.ceil(episodeMin / perPage) < Math.ceil(episodeMax / perPage)) {
      const newMax = Math.ceil(episodeMin / perPage) * perPage;
      episodes.push(...(await this.getEpisodeIds(annictId, episodeMin, newMax)));
    }
    const result = await fetch(
      `${this.baseUrl}episodes?filter_work_id=${annictId}&per_page=${perPage}&page=${Math.ceil(
        episodeMax / perPage,
      )}&sort_sort_number=asc`,
      { headers: this.getFetchHeader() },
    );
    if (result.ok) {
      const response = (await result.json()) as {
        episodes?: Array<{ id: number; number: number }>;
      };
      if (!response.episodes) return [];
      const filtered = response.episodes.filter(
        ep => ep.number <= (episodeMax || episodeMin) && ep.number >= episodeMin,
      );
      episodes.push(...filtered.map(ep => ep.id));
    }
    return episodes;
  }

  statusToAnnict(status?: PersonalStatus): AnnictStatus | undefined {
    switch (status) {
      case 'planning':
        return 'wanna_watch';
      case 'dropped':
        return 'stop_watching';
      case 'completed':
        return 'watched';
      case 'current':
        return 'watching';
      case 'on_hold':
        return 'on_hold';
      default:
        return undefined;
    }
  }

  statusFromAnnict(status?: AnnictStatus): PersonalStatus | undefined {
    switch (status) {
      case 'wanna_watch':
        return 'planning';
      case 'stop_watching':
      case 'no_select':
        return 'dropped';
      case 'watched':
        return 'completed';
      case 'on_hold':
        return 'on_hold';
      case 'watching':
        return 'current';
      default:
        return undefined;
    }
  }
}

export type AnnictStatus =
  | 'wanna_watch'
  | 'watching'
  | 'watched'
  | 'on_hold'
  | 'stop_watching'
  | 'no_select';
