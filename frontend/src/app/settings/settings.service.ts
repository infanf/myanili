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
}

export type Language = 'default' | 'en' | 'jp';
