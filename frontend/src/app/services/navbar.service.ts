import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export type NavbarModule = 'anime' | 'manga' | 'liveaction';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  moduleSubject = new BehaviorSubject<NavbarModule | undefined>(undefined);

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects;
        this.setModule(path);
      }
    });
  }

  setModule(path: string) {
    if (path.startsWith('/liveaction') || path.startsWith('/search/liveaction')) {
      this.moduleSubject.next('liveaction');
    } else if (path.includes('anime')) {
      this.moduleSubject.next('anime');
    } else if (path.includes('manga')) {
      this.moduleSubject.next('manga');
    } else {
      this.moduleSubject.next(undefined);
    }
  }

  get module() {
    return this.moduleSubject.asObservable();
  }
}
