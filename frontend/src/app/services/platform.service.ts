import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'android' | 'ios';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private _platform: Platform;

  constructor() {
    this._platform = this.detectPlatform();
  }

  private detectPlatform(): Platform {
    const platform = Capacitor.getPlatform();

    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
    return 'web';
  }

  get platform(): Platform {
    return this._platform;
  }

  get isWeb(): boolean {
    return this._platform === 'web';
  }

  get isMobile(): boolean {
    return this._platform === 'android' || this._platform === 'ios';
  }

  get isAndroid(): boolean {
    return this._platform === 'android';
  }

  get isIOS(): boolean {
    return this._platform === 'ios';
  }
}
