import { Injectable } from '@angular/core';
import { Season, SeasonNumber } from '@models/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private season$ = new BehaviorSubject<Season>({
    year: new Date().getFullYear(),
    season: Math.floor(new Date().getMonth() / 3) as SeasonNumber,
  });
  private language$ = new BehaviorSubject<Language>('default');
  private inList$ = new BehaviorSubject<boolean>(false);
  private layout$ = new BehaviorSubject<string>('list');
  private nsfw$ = new BehaviorSubject<boolean>(false);
  private autoFilter$ = new BehaviorSubject<boolean>(false);

  constructor(private glob: GlobalService, private modalService: NgbModal) {
    try {
      const list = Boolean(JSON.parse(localStorage.getItem('inList') || 'false'));
      this.setInList(list);
      const layout = String(localStorage.getItem('layout') || 'list');
      this.setLayout(layout);
      const lang = String(localStorage.getItem('lang'));
      this.setLanguage(['default', 'en', 'jp'].includes(lang) ? (lang as Language) : 'default');
      const savedSeason = JSON.parse(String(localStorage.getItem('season')));
      if (savedSeason) {
        this.setSeason(savedSeason.year as number, savedSeason.season as SeasonNumber);
      }
      const autoFilter = Boolean(JSON.parse(localStorage.getItem('autoFilter') || 'false'));
      this.setAutoFilter(autoFilter);
      const nsfw = Boolean(JSON.parse(localStorage.getItem('nsfw') || 'false'));
      this.setNsfw(nsfw);
      const knownVersion = String(localStorage.getItem('myaniliVersion')) || '0.0.0';
      if (this.glob.version !== knownVersion) {
        const changeNotes = this.glob.changelog.changes.filter(c =>
          c.version.startsWith(this.glob.version.replace(/\.\d+$/, '')),
        );
        if (changeNotes) {
          localStorage.setItem('myaniliVersion', this.glob.version);
          import('../settings/new-version/new-version.component').then(
            ({ NewVersionComponent }) => {
              const changelogModal = this.modalService.open(NewVersionComponent);
              changelogModal.componentInstance.changelog = {
                version: this.glob.version,
                changes: [...changeNotes],
              };
            },
          );
        }
      }
    } catch (e) {}
  }

  get season() {
    return this.season$.asObservable();
  }

  setSeason(year: number, season: SeasonNumber) {
    const newSeason = { year, season };
    this.season$.next(newSeason);
    localStorage.setItem('season', JSON.stringify(newSeason));
  }

  resetSeason() {
    this.season$.next({
      year: new Date().getFullYear(),
      season: Math.floor(new Date().getMonth() / 3) as SeasonNumber,
    });
    localStorage.removeItem('season');
  }

  get language() {
    return this.language$.asObservable();
  }

  setLanguage(lang: Language) {
    this.language$.next(lang);
    localStorage.setItem('lang', lang);
  }

  get inList() {
    return this.inList$.asObservable();
  }

  setInList(list: boolean) {
    this.inList$.next(list);
    localStorage.setItem('inList', JSON.stringify(list));
  }

  get autoFilter() {
    return this.autoFilter$.asObservable();
  }

  setAutoFilter(autoFilter: boolean) {
    this.autoFilter$.next(autoFilter);
    localStorage.setItem('autoFilter', JSON.stringify(autoFilter));
  }

  get layout() {
    return this.layout$.asObservable();
  }

  setLayout(layout: string) {
    this.layout$.next(layout);
    localStorage.setItem('layout', layout);
  }

  get nsfw() {
    return this.nsfw$.asObservable();
  }

  setNsfw(nsfw: boolean) {
    this.nsfw$.next(nsfw);
    localStorage.setItem('nsfw', JSON.stringify(nsfw));
  }
}

export type Language = 'default' | 'en' | 'jp';
