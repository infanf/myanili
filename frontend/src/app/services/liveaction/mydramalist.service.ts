import { Injectable } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { LiveactionUpdate } from '@models/liveaction';

/** MyDramaList list statuses */
export type MydramalistStatus =
  | 'watching'
  | 'completed'
  | 'plan_to_watch'
  | 'on_hold'
  | 'dropped'
  | 'not_interested';

/**
 * MyDramaList integration, prepared for when MDL reopens its API.
 *
 * Until then only the mapping is available: the backend resolves the MDL
 * slug ("705723-strange-lawyer-woo-young-woo") via SIMKL or a manual mapping,
 * which is used for links. Syncing is wired into the live action fan-out but
 * does nothing while `available` is false.
 *
 * TODO once the API is available:
 * - OAuth login (backend route + login component, like Bangumi)
 * - implement updateEntry/deleteEntry and getRating
 */
@Injectable({
  providedIn: 'root',
})
export class MydramalistService {
  readonly baseUrl = 'https://mydramalist.com/';
  readonly available = false;

  /** Numeric MDL ID from a slug */
  getId(slug?: string | null): number | undefined {
    const id = Number(slug?.split('-')[0]);
    return id || undefined;
  }

  getUrl(slug?: string | null): string | undefined {
    return slug ? `${this.baseUrl}${slug}` : undefined;
  }

  async updateEntry(slug: string | null | undefined, data: LiveactionUpdate): Promise<void> {
    if (!this.available || !this.getId(slug)) return;
    // Not implemented until MDL offers a public API again
    void this.statusFromMal(data.status);
  }

  async deleteEntry(slug: string | null | undefined): Promise<void> {
    if (!this.available || !this.getId(slug)) return;
  }

  statusFromMal(status: WatchStatus): MydramalistStatus {
    return status;
  }
}
