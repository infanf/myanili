import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

import { GlobalService } from './global.service';
import { MalService } from './mal.service';

/**
 * Marker on a route's `data` to opt it into view caching.
 * `true` keeps the view until it is evicted, `'volatile'` additionally drops it
 * as soon as list data has been changed somewhere else in the app.
 */
export type RouteReuse = true | 'volatile';

interface CachedRoute {
  handle: DetachedRouteHandle;
  volatile: boolean;
  title: string;
  scrollPosition: number;
}

/** State of a restored view that has to be reapplied once the navigation finished. */
export interface RestoredView {
  title: string;
  scrollPosition: number;
}

@Injectable({
  providedIn: 'root',
})
export class CachedRouteReuseStrategy implements RouteReuseStrategy {
  /** Number of detached views kept around, oldest ones are destroyed first. */
  private readonly maxSize = 10;
  private readonly cache = new Map<string, CachedRoute>();
  private restored?: RestoredView;

  constructor(
    private glob: GlobalService,
    private mal: MalService,
  ) {
    this.mal.changed.subscribe(() => this.invalidateVolatile());
    this.mal.loggedIn.subscribe(() => this.clear());
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return Boolean(route.routeConfig && route.data['reuse']);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null) {
    const key = this.key(route);
    if (!key) return;
    if (!handle) {
      // The router clears the entry right before it reattaches the view, so the
      // handle is about to be used again – only drop the reference to it here,
      // destroying it would hand back a dead view without bindings or styles.
      this.cache.delete(key);
      return;
    }
    this.destroy(key);
    this.cache.set(key, {
      handle,
      volatile: route.data['reuse'] === 'volatile',
      // The component is not constructed again on the way back, so title and
      // scroll position have to be restored from here.
      title: this.glob.getTitle(),
      scrollPosition: window.scrollY,
    });
    while (this.cache.size > this.maxSize) {
      const oldest = this.cache.keys().next();
      if (oldest.done) break;
      this.destroy(oldest.value);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.cache.has(this.key(route));
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const cached = this.cache.get(this.key(route));
    if (!cached) return null;
    this.restored = { title: cached.title, scrollPosition: cached.scrollPosition };
    return cached.handle;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * State of the view restored during the current navigation, or `undefined`
   * when the view was built from scratch. Consumed by {@link RouteScrollService}
   * once the navigation ended, so an aborted navigation leaves nothing behind.
   */
  takeRestoredView(): RestoredView | undefined {
    const restored = this.restored;
    this.restored = undefined;
    return restored;
  }

  /** Drops all cached views, e.g. after logging in or out. */
  clear() {
    for (const key of [...this.cache.keys()]) this.destroy(key);
  }

  /** Drops the views that show list data, so they are rebuilt with fresh data. */
  private invalidateVolatile() {
    for (const [key, cached] of [...this.cache]) {
      if (cached.volatile) this.destroy(key);
    }
  }

  private destroy(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return;
    this.cache.delete(key);
    // tslint:disable-next-line:no-any
    (cached.handle as any)?.componentRef?.destroy();
  }

  private key(route: ActivatedRouteSnapshot): string {
    const path = route.pathFromRoot
      .map(part => part.url.map(segment => segment.toString()).join('/'))
      .filter(Boolean)
      .join('/');
    const query = Object.entries(route.queryParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}=${value}`)
      .join('&');
    return query ? `${path}?${query}` : path;
  }
}
