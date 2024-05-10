import { Injectable } from '@angular/core';
import { BakaList, BakaSeries, BakaUser, ListType } from '@models/baka';
import { BakaManga, Manga, ReadStatus } from '@models/manga';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MangaupdatesService {
  private baseUrl = environment.backend + 'baka/v1/';
  private accessToken = '';
  private userSubject = new BehaviorSubject<BakaUser | undefined>(undefined);
  private myLists?: BakaList[];

  constructor() {
    this.accessToken = String(localStorage.getItem('bakaAccessToken'));
    if (this.accessToken && this.accessToken !== 'null') {
      this.login().then(user => {
        this.userSubject.next(user);
      });
    }
  }

  async login(
    username?: string,
    password?: string,
    saveLogin = false,
  ): Promise<BakaUser | undefined> {
    if (!username || !password) {
      return this.checkLogin();
    }
    const result = await fetch(`${this.baseUrl}account/login`, {
      method: 'PUT',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ username, password }),
    });
    if (!result.ok) return undefined;
    const response = (await result.json()) as { context: { session_token: string } };
    this.accessToken = response.context.session_token;
    localStorage.setItem('bakaAccessToken', this.accessToken);
    return this.checkLogin();
  }

  async checkLogin(): Promise<BakaUser | undefined> {
    if (!this.accessToken) return undefined;
    const result = await fetch(`${this.baseUrl}account/profile`, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (!result.ok) return undefined;
    const response = (await result.json()) as BakaUser;
    this.userSubject.next(response);
    return response;
  }

  logoff() {
    this.accessToken = '';
    this.userSubject.next(undefined);
    localStorage.removeItem('bakaAccessToken');
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async getId(idOrSlug: number | string): Promise<number | undefined> {
    if (!idOrSlug) return;
    if (typeof idOrSlug === 'number') {
      const manga = await this.getManga(idOrSlug);
      if (manga) {
        return manga.series_id;
      }
    }
    const request = await fetch(`${environment.backend}baka/manga/${idOrSlug}`);
    if (request.ok) {
      const response = (await request.json()) as BakaManga;
      return response.id;
    }
    return;
  }

  async getManga(id: number): Promise<BakaSeries | undefined> {
    if (!id) return;
    const response = await fetch(`${this.baseUrl}series/${id}`);
    if (!response.ok) return;
    return response.json() as Promise<BakaSeries>;
  }

  async getIdFromManga(manga: Manga): Promise<number | undefined> {
    if (!manga) return;
    const author = manga.authors?.[0]?.node;
    return this.getIdFromTitle(
      manga.title,
      manga.start_date,
      manga.media_type.includes('novel'),
      `${author?.last_name} ${author?.first_name}`,
    );
  }

  async getIdFromTitle(
    title: string,
    startDate?: Date,
    novel?: boolean,
    author?: string,
  ): Promise<number | undefined> {
    if (novel) title += ' (Novel)';
    const mangas = await this.findSeries(title);
    if (!mangas) return;
    const bakaMangas = mangas.filter(m => {
      const mangaStart = startDate ? new Date(startDate).getFullYear() : 0;
      return Math.abs((m.year || 0) - mangaStart) <= 1;
    });
    if (bakaMangas.length === 1) return bakaMangas[0].series_id;
    const { compareTwoStrings } = await import('string-similarity');
    const bakaMangasByTitle = bakaMangas.filter(m => compareTwoStrings(m.title, title) > 0.9);
    if (bakaMangasByTitle.length === 1) return bakaMangasByTitle[0].series_id;
    return bakaMangas.find(
      m =>
        m.title.toLowerCase() === title.toLowerCase() ||
        m.title.toLowerCase() === `${title} (${author})`.toLowerCase(),
    )?.series_id;
  }

  async findSeries(title: string): Promise<BakaSeries[] | undefined> {
    if (!title) return;
    const response = await fetch(`${this.baseUrl}series/search`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        search: title,
      }),
    });
    if (!response.ok) return;
    const results = (await response.json()) as { results: Array<{ record: BakaSeries }> };
    return results.results.map(result => result.record);
  }

  async updateSeries(
    id: number,
    data: { chapters?: number; volumes?: number; list?: ListType; rating?: number },
  ) {
    if (!id) return;
    if (data.rating) this.addRating(id, data.rating);
    const updateData = {
      series: { id },
    } as {
      series: { id: number };
      list_id?: number;
      status?: { chapter?: number; volume?: number };
    };
    if (data.chapters || data.volumes) {
      updateData.status = {
        chapter: data.chapters,
        volume: data.volumes,
      };
    }
    if (!data.list) data.list = 'read';
    if (!this.myLists) {
      const listsResponse = await fetch(`${this.baseUrl}lists`, {
        headers: new Headers({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }),
      });
      if (!listsResponse.ok) return;
      this.myLists = (await listsResponse.json()) as BakaList[];
    }
    const newList = this.myLists.find(list => list.type === data.list);
    if (newList) updateData.list_id = newList.list_id;

    const updateResponse = await fetch(`${this.baseUrl}lists/series/update`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify([updateData]),
    });
    if (updateResponse.ok) return;

    await fetch(`${this.baseUrl}lists/series`, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify([updateData]),
    });
  }

  async addRating(id: number, rating: number) {
    await fetch(`${this.baseUrl}series/${id}/rating`, {
      method: 'PUT',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ rating }),
    });
  }

  statusFromMal(malStatus?: ReadStatus): ListType | undefined {
    switch (malStatus) {
      case 'plan_to_read':
        return 'wish';
      case 'reading':
        return 'read';
      case 'completed':
        return 'complete';
      case 'dropped':
        return 'unfinished';
      case 'on_hold':
        return 'hold';
      default:
        return undefined;
    }
  }
}
