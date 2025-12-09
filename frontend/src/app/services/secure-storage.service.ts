import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  constructor(private platformService: PlatformService) {}

  async set(key: string, value: string): Promise<void> {
    if (this.platformService.isMobile) {
      // Use Capacitor Preferences (backed by Keystore on Android)
      await Preferences.set({ key, value });
    } else {
      // Use localStorage for web
      localStorage.setItem(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.platformService.isMobile) {
      const result = await Preferences.get({ key });
      return result.value;
    } else {
      return localStorage.getItem(key);
    }
  }

  async remove(key: string): Promise<void> {
    if (this.platformService.isMobile) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.platformService.isMobile) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }

  async keys(): Promise<string[]> {
    if (this.platformService.isMobile) {
      const result = await Preferences.keys();
      return result.keys;
    } else {
      return Object.keys(localStorage);
    }
  }
}
