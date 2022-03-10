import { Injectable } from '@angular/core';
import { Season } from '@models/components';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private seasonSubject = new BehaviorSubject<Season>({
    year: moment().year(),
    season: Math.floor(moment().month() / 3),
  });
  private languageSubject = new BehaviorSubject<Language>('default');
  private inList = new BehaviorSubject<boolean>(false);
  private layoutSubject = new BehaviorSubject<string>('list');
  private nsfwSubject = new BehaviorSubject<boolean>(false);
  private streamingCountrySubject = new BehaviorSubject<StreamingCountry | undefined>('id');

  constructor() {
    try {
      const list = Boolean(JSON.parse(localStorage.getItem('inList') || 'false'));
      this.setInList(list);
      const layout = String(localStorage.getItem('layout') || 'list');
      this.setLayout(layout);
      const lang = String(localStorage.getItem('lang'));
      this.setLanguage(['default', 'en', 'jp'].includes(lang) ? (lang as Language) : 'default');
      const savedSeason = JSON.parse(String(localStorage.getItem('season')));
      if (savedSeason) {
        this.setSeason(savedSeason.year as number, savedSeason.season as number);
      }
      const nsfw = Boolean(JSON.parse(localStorage.getItem('nsfw') || 'false'));
      this.setNsfw(nsfw);
      const streamingCountry = JSON.parse(String(localStorage.getItem('streamingCountry')));
      if (streamingCountry) {
        this.setStreamingCountry(streamingCountry);
      }
    } catch (e) {}
  }

  get season() {
    return this.seasonSubject.asObservable();
  }

  setSeason(year: number, season: number) {
    const newSeason = { year, season };
    this.seasonSubject.next(newSeason);
    localStorage.setItem('season', JSON.stringify(newSeason));
  }

  resetSeason() {
    this.seasonSubject.next({
      year: moment().year(),
      season: Math.floor(moment().month() / 3),
    });
    localStorage.removeItem('season');
  }

  get language() {
    return this.languageSubject.asObservable();
  }

  setLanguage(lang: Language) {
    this.languageSubject.next(lang);
    localStorage.setItem('lang', lang);
  }

  get onlyInList() {
    return this.inList.asObservable();
  }

  setInList(list: boolean) {
    this.inList.next(list);
    localStorage.setItem('inList', JSON.stringify(list));
  }

  get layout() {
    return this.layoutSubject.asObservable();
  }

  setLayout(layout: string) {
    this.layoutSubject.next(layout);
    localStorage.setItem('layout', layout);
  }

  get nsfw() {
    return this.nsfwSubject.asObservable();
  }

  setNsfw(nsfw: boolean) {
    this.nsfwSubject.next(nsfw);
    localStorage.setItem('nsfw', JSON.stringify(nsfw));
  }

  get streamingCountry() {
    return this.streamingCountrySubject.asObservable();
  }

  setStreamingCountry(country: StreamingCountry) {
    this.streamingCountrySubject.next(country);
    localStorage.setItem('streamingCountry', JSON.stringify(country));
  }
}

export type Language = 'default' | 'en' | 'jp';

export type StreamingRegion = StreamingCountry[];

export const StreamingRegions: { [key: string]: StreamingCountry[] } = {
  na: ['us', 'ca'],
  la: [
    'mx',
    'ar',
    'br',
    'cl',
    'co',
    'cr',
    'ec',
    'gt',
    'hn',
    'ni',
    'pa',
    'pe',
    'pr',
    'py',
    'sv',
    'uy',
    've',
  ],
  eu: [
    'de',
    'fr',
    'es',
    'it',
    'at',
    'be',
    'bg',
    'hr',
    'cy',
    'cz',
    'dk',
    'ee',
    'fi',
    'gr',
    'hu',
    'ie',
    'lv',
    'lt',
    'lu',
    'mt',
    'nl',
    'pl',
    'pt',
    'ro',
    'sk',
    'si',
    'se',
    'uk',
  ],
  de: ['de', 'at'],
  gb: ['uk', 'ie'],
  sea: ['id', 'th', 'my', 'ph', 'sg', 'vn', 'hk'],
  oc: ['au', 'nz'],
};

export type StreamingCountry = string;
