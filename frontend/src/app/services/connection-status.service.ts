import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

export type ConnectionId =
  | 'anilist'
  | 'kitsu'
  | 'anisearch'
  | 'shikimori'
  | 'trakt'
  | 'simkl'
  | 'annict'
  | 'baka'
  | 'mangabaka'
  | 'bangumi'
  | 'livechart';

/**
 * Central registry for failed service connections. Services report here instead of
 * logging the user off, so a session only ends when the user disconnects manually.
 */
@Injectable({
  providedIn: 'root',
})
export class ConnectionStatusService {
  private errorsSubject = new BehaviorSubject<Partial<Record<ConnectionId, string>>>({});
  readonly errors$ = this.errorsSubject.asObservable();
  readonly hasErrors$ = this.errors$.pipe(map(errors => Object.keys(errors).length > 0));

  reportError(service: ConnectionId, message: string) {
    this.errorsSubject.next({ ...this.errorsSubject.value, [service]: message });
  }

  clearError(service: ConnectionId) {
    if (!(service in this.errorsSubject.value)) return;
    const errors = { ...this.errorsSubject.value };
    delete errors[service];
    this.errorsSubject.next(errors);
  }

  error$(service: ConnectionId): Observable<string | undefined> {
    return this.errors$.pipe(map(errors => errors[service]));
  }
}
