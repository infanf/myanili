import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import { GlobalService } from './global.service';
import { CachedRouteReuseStrategy } from './route-reuse.strategy';

/**
 * Puts every navigation at a sensible scroll position: a view restored from the
 * route cache keeps the position and title it was left with, a freshly built
 * view starts at the top instead of inheriting the previous view's position.
 */
@Injectable({
  providedIn: 'root',
})
export class RouteScrollService {
  constructor(
    private router: Router,
    private strategy: CachedRouteReuseStrategy,
    private glob: GlobalService,
  ) {}

  start() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Drop anything a previously aborted navigation may have left behind.
        this.strategy.takeRestoredView();
      } else if (event instanceof NavigationEnd) {
        const restored = this.strategy.takeRestoredView();
        if (restored) this.glob.setTitle(restored.title);
        // Wait for the activated view to be rendered, otherwise the document is
        // still too short to scroll back to a restored position.
        setTimeout(() => this.glob.scrollTo(restored?.scrollPosition ?? 0));
      }
    });
  }
}
