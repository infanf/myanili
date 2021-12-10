import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {
    // initialize indexedDB
    const request = indexedDB.open('title-cache', 1);
    request.onupgradeneeded = () => {
      // initialize anime and manga stores if they don't exist
      const db = request.result;
      if (!db.objectStoreNames.contains('anime')) {
        db.createObjectStore('anime', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('manga')) {
        db.createObjectStore('manga', { keyPath: 'id' });
      }
    };
  }

  saveTitle(id: number, type: 'anime' | 'manga', title: string) {
    const request = indexedDB.open('title-cache', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(type, 'readwrite');
      const objectStore = transaction.objectStore(type);
      objectStore.put({ id, title });
    };
  }

  getTitle(id: number, type: 'anime' | 'manga'): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('title-cache', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(type, 'readonly');
        const objectStore = transaction.objectStore(type);
        const storeRequest = objectStore.get(id);
        storeRequest.onsuccess = () => {
          if (storeRequest.result) {
            resolve(storeRequest.result.title);
          } else {
            resolve('');
          }
        };
      };
    });
  }
}
