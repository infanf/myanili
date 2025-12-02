import { ApplicationRef, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DateTimeFrom } from '@components/luxon-helper';
import { WeekdayNumbers } from 'luxon';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

import packageJson from '../../../package.json';
import { changelog } from '../../changelog';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private isBusySubject = new BehaviorSubject<boolean>(true);
  private loadingPercentSubject = new BehaviorSubject<number>(0);
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  private readonly titlePostfix = ' – MyAniLi';
  private lastTitle = '';
  version = packageJson.version;
  lastPosition = 0;
  scrollTimeout = false;
  private hideNavbarSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private titleService: Title,
    private ref: ApplicationRef,
  ) {
    if (window.matchMedia) {
      const darkModeOn = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (darkModeOn) {
        this.darkModeSubject.next(true);
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        this.darkModeSubject.next(e.matches);
        this.ref.tick();
      });
    }

    window.document.onscroll = () => {
      if (this.scrollTimeout) {
        return;
      }
      this.scrollTimeout = true;
      window.setTimeout(() => {
        this.scrollTimeout = false;
      }, 100);
      const currentPositon = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = window.document.body.scrollHeight;
      this.hideNavbarSubject.next(
        currentPositon > 60 &&
          currentPositon > this.lastPosition &&
          viewportHeight + currentPositon < documentHeight,
      );
      this.lastPosition = currentPositon;
    };
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

  get hideNavbar() {
    return this.hideNavbarSubject.asObservable();
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

  get changelog() {
    return changelog;
  }

  async sleep(t: number) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  toWeekday(day: number): WeekdayNumbers {
    const rounded = Math.round(day);
    return (rounded % 7 || 7) as WeekdayNumbers;
  }

  /**
   * Checks if the backend is available with retry logic.
   * Retries up to maxRetries times with delay between attempts.
   * @param maxRetries Maximum number of retry attempts (default: 5)
   * @param retryDelay Delay in milliseconds between retries (default: 1000)
   * @returns Promise that resolves to true if backend is available, false otherwise
   */
  async checkBackendAvailability(maxRetries = 5, retryDelay = 1000): Promise<boolean> {
    const backendUrl = environment.backend;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try to fetch the backend root to check if it's available
        // Using GET request with credentials and no-cache
        const response = await fetch(backendUrl, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache',
        });

        // If we get any response (even error status), backend is reachable
        if (response.status >= 200 && response.status < 600) {
          return true;
        }
      } catch (error) {
        // If fetch fails (network error, timeout, etc.), backend is not reachable
        // Continue to retry unless this was the last attempt
        if (attempt < maxRetries) {
          await this.sleep(retryDelay);
          continue;
        }
      }
    }

    return false;
  }
}

export function getLastXoClock(hour = 8) {
  const now = DateTimeFrom();
  const eightAm = DateTimeFrom().set({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  return now.diff(eightAm).milliseconds > 0 ? eightAm : eightAm.minus({ days: 1 });
}

export function cleanupObject<T extends object>(obj: T): Partial<T> {
  for (const key of Object.keys(obj)) {
    // tslint:disable-next-line no-any
    if ((obj as any)[key] === undefined) {
      // tslint:disable-next-line no-any
      delete (obj as any)[key];
    }
  }
  return obj as Partial<T>;
}
