import { Injectable } from '@angular/core';
import { Season, SeasonNumber } from '@models/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  season$ = new BehaviorSubject<Season>({
    year: new Date().getFullYear(),
    season: Math.floor(new Date().getMonth() / 3) as SeasonNumber,
  });
  language$ = new BehaviorSubject<Language>('default');
  inList$ = new BehaviorSubject<boolean>(false);
  layout$ = new BehaviorSubject<string>('list');
  nsfw$ = new BehaviorSubject<boolean>(false);
  autoFilter$ = new BehaviorSubject<boolean>(false);
  scoreDisplay$ = new BehaviorSubject<ScoreDisplay>('default');

  constructor(private glob: GlobalService, private modalService: NgbModal) {
    try {
      const list = Boolean(JSON.parse(localStorage.getItem('inList') || 'false'));
      this.inList = list;
      const layout = String(localStorage.getItem('layout') || 'list');
      this.layout = layout;
      const lang = String(localStorage.getItem('lang'));
      this.language = ['default', 'en', 'jp'].includes(lang) ? (lang as Language) : 'default';
      const savedSeason = JSON.parse(String(localStorage.getItem('season')) || '{}');
      if (savedSeason) {
        this.season = savedSeason as Season;
      }
      const autoFilter = Boolean(JSON.parse(localStorage.getItem('autoFilter') || 'false'));
      this.autoFilter = autoFilter;
      const scoreDisplay = String(localStorage.getItem('scoreDisplay') || 'default');
      this.scoreDisplay$.next(scoreDisplay as ScoreDisplay);
      const nsfw = Boolean(JSON.parse(localStorage.getItem('nsfw') || 'false'));
      this.nsfw = nsfw;
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

  set season(newSeason: { year: number; season: SeasonNumber }) {
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

  set language(lang: Language) {
    this.language$.next(lang);
    localStorage.setItem('lang', lang);
  }

  set inList(list: boolean) {
    this.inList$.next(list);
    localStorage.setItem('inList', JSON.stringify(list));
  }

  set autoFilter(autoFilter: boolean) {
    this.autoFilter$.next(autoFilter);
    localStorage.setItem('autoFilter', JSON.stringify(autoFilter));
  }

  set layout(layout: string) {
    this.layout$.next(layout);
    localStorage.setItem('layout', layout);
  }

  set nsfw(nsfw: boolean) {
    this.nsfw$.next(nsfw);
    localStorage.setItem('nsfw', JSON.stringify(nsfw));
  }

  set scoreDisplay(scoreDisplay: ScoreDisplay) {
    this.scoreDisplay$.next(scoreDisplay);
    localStorage.setItem('scoreDisplay', scoreDisplay);
  }
}

export type Language = 'default' | 'en' | 'jp';
export type ScoreDisplay = 'default' | '10' | '5' | '100';
