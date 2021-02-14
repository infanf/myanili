import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private isBusySubject = new BehaviorSubject<boolean>(true);
  private loadingPercentSubject = new BehaviorSubject<number>(0);
  private darkModeSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.darkModeSubject.next(e.matches);
    });
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
    this.isBusySubject.next(true);
    this.loadingPercentSubject.next(number);
  }

  notbusy() {
    this.isBusySubject.next(false);
    this.loadingPercentSubject.next(0);
  }
}
