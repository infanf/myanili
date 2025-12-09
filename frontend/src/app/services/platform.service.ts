import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export type Platform = 'web' | 'mobile';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private _platform: Platform;

  constructor() {
    this._platform = environment.platform;
    console.log('[PlatformService] Platform from environment:', this._platform);
  }

  get platform(): Platform {
    return this._platform;
  }

  get isWeb(): boolean {
    return this._platform === 'web';
  }

  get isMobile(): boolean {
    return this._platform === 'mobile';
  }
}
