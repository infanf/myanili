import { Injectable } from '@angular/core';
import { Anime } from '@models/anime';
import { Manga } from '@models/manga';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  dbVersion = 3;
  constructor() {
    // initialize indexedDB
    const request = indexedDB.open('mal-cache', this.dbVersion);
    request.onupgradeneeded = () => {
      // initialize anime and manga stores if they don't exist
      const db = request.result;
      if (!db.objectStoreNames.contains('anime')) {
        db.createObjectStore('anime', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('manga')) {
        db.createObjectStore('manga', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('fetch')) {
        db.createObjectStore('fetch', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('fetchRaw')) {
        db.createObjectStore('fetchRaw', { keyPath: 'url' });
      }
    };
  }

  saveTitle(id: number, type: 'anime' | 'manga', title: string) {
    this.saveValues(id, type, { title });
  }

  getTitle(id: number, type: 'anime' | 'manga'): Promise<string> {
    return this.getValue<string>(id, type, 'title')
      .then(title => `${title}` || '')
      .catch(() => '');
  }

  async saveValues(
    id: number,
    type: 'anime' | 'manga',
    values: Partial<Anime | Manga>,
    overwrite = false,
  ) {
    if (!overwrite) {
      try {
        await this.getValues<Anime | Manga>(id, type);
      } catch (e) {
        overwrite = true;
      }
    }
    if (overwrite) {
      const request = indexedDB.open('mal-cache', this.dbVersion);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(type, 'readwrite');
        const objectStore = transaction.objectStore(type);
        objectStore.put({ id, ...values });
      };
    }
  }

  getValues<T>(id: number, type: 'anime' | 'manga'): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mal-cache', this.dbVersion);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(type, 'readonly');
        const objectStore = transaction.objectStore(type);
        const storeRequest = objectStore.get(id);
        storeRequest.onsuccess = () => {
          const result = storeRequest.result;
          if (result) {
            resolve(result);
          } else {
            reject();
          }
        };
        storeRequest.onerror = () => reject();
      };
    });
  }

  getValue<T>(id: number, type: 'anime' | 'manga', key: string): Promise<T | undefined> {
    interface S {
      [key: string]: T;
    }
    return this.getValues<S>(id, type)
      .then(values => values?.[key])
      .catch(() => undefined);
  }

  private fetchFromStore<T>(url: string, store = 'fetch'): Promise<T | undefined> {
    return new Promise(resolve => {
      const request = indexedDB.open('mal-cache', this.dbVersion);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(store, 'readwrite');
        const objectStore = transaction.objectStore(store);
        const storeRequest = objectStore.get(url);
        storeRequest.onsuccess = () => {
          const result = storeRequest.result;
          if (result?.data && result.expires > Date.now()) {
            resolve(result?.data as T);
          } else {
            resolve(undefined);
          }
        };
        storeRequest.onerror = () => resolve(undefined);
      };
      request.onerror = () => resolve(undefined);
    });
  }

  // tslint:disable-next-line: no-any
  private fetchToStore(url: string, data: any, ttl = 3600, store = 'fetch') {
    const request = indexedDB.open('mal-cache', this.dbVersion);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      objectStore.put({ url, data, expires: ttl * 1000 + Date.now() });
    };
  }

  async fetchRaw(url: string, ttl = 3600): Promise<string> {
    const value = await this.fetchFromStore<string>(url, 'fetchRaw');
    if (value) return value;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.text();
    this.fetchToStore(url, data, ttl, 'fetchRaw');
    return data;
  }

  async fetch<T>(url: string, ttl = 3600): Promise<T> {
    const value = await this.fetchFromStore<T>(url);
    if (value) return value as T;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    this.fetchToStore(url, data, ttl);
    return data;
  }
}
