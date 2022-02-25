import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  dbVersion = 2;
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
    };
  }

  saveTitle(id: number, type: 'anime' | 'manga', title: string) {
    this.saveValues(id, type, { title });
  }

  getTitle(id: number, type: 'anime' | 'manga'): Promise<string> {
    return this.getValues(id, type).then(values => (values?.title ? `${values.title}` : ''));
  }

  saveValues(
    id: number,
    type: 'anime' | 'manga',
    values: { [key: string]: string | number | undefined },
  ) {
    const request = indexedDB.open('mal-cache', this.dbVersion);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(type, 'readwrite');
      const objectStore = transaction.objectStore(type);
      objectStore.put({ id, ...values });
    };
  }

  getValues(
    id: number,
    type: 'anime' | 'manga',
  ): Promise<{ [key: string]: string | number | undefined }> {
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

  getValue(id: number, type: 'anime' | 'manga', key: string): Promise<string | number | undefined> {
    return this.getValues(id, type)
      .then(values => values?.[key])
      .catch(() => undefined);
  }

  async fetch<T>(url: string, ttl = 3600): Promise<T> {
    const value = await new Promise(resolve => {
      const request = indexedDB.open('mal-cache', this.dbVersion);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('fetch', 'readwrite');
        const objectStore = transaction.objectStore('fetch');
        const storeRequest = objectStore.get(url);
        storeRequest.onsuccess = () => {
          const result = storeRequest.result;
          if (result?.data && result.expires > Date.now()) {
            resolve(result?.data);
          } else {
            resolve(undefined);
          }
        };
        storeRequest.onerror = () => resolve(undefined);
      };
      request.onerror = () => resolve(undefined);
    });
    if (value) return value as T;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    const request2 = indexedDB.open('mal-cache', this.dbVersion);
    request2.onsuccess = () => {
      const db = request2.result;
      const transaction = db.transaction('fetch', 'readwrite');
      const objectStore = transaction.objectStore('fetch');
      objectStore.put({ url, data, expires: ttl * 1000 + Date.now() });
    };
    return data;
  }
}
