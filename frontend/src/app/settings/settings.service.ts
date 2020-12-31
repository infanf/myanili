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
  private languageSubject = new BehaviorSubject<'default' | 'en' | 'ja'>('default');

  constructor() {
    try {
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

  get language() {
    return this.languageSubject.asObservable();
  }
}
