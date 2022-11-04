import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  moduleSubject = new BehaviorSubject<'anime' | 'manga' | undefined>(undefined);

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects;
        this.setModule(path);
      }
    });
  }

  setModule(path: string) {
    if (path.includes('anime')) {
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
