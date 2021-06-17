import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private isBusySubject = new BehaviorSubject<boolean>(true);
  private loadingPercentSubject = new BehaviorSubject<number>(0);
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  private readonly titlePostfix = ' – MyAniLi';
  private lastTitle = '';

  constructor(private titleService: Title) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        this.darkModeSubject.next(e.matches);
      });
    } catch (e) {
      console.error("Apparently you are using an Apple Product. Please don't");
    }
  }

  setTitle(title: string) {
    const newTitle = `${title}${this.titlePostfix}`;
    this.titleService.setTitle(newTitle);
  }

  getTitle(): string {
    return this.titleService.getTitle().replace(this.titlePostfix, '');
  }

  get isBusy() {
    return this.isBusySubject.asObservable();
  }

  get loadingPercent() {
    return this.loadingPercentSubject.asObservable();
  }

  get darkMode() {
    return this.darkModeSubject.asObservable();
  }

  busy(number = 0) {
    this.lastTitle = this.getTitle();
    this.setTitle('Loading…');
    this.isBusySubject.next(true);
    this.loadingPercentSubject.next(number);
  }

  notbusy() {
    if (this.getTitle() === 'Loading…' && this.lastTitle) {
      this.setTitle(this.lastTitle);
      this.lastTitle = '';
    }
    this.isBusySubject.next(false);
    this.loadingPercentSubject.next(0);
  }
}
