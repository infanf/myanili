import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch(err => console.error(err));

if (window.location.search) {
  const params = new URLSearchParams(window.location.search);
  for (const key of ['url', 'text', 'title']) {
    if (params.has(key)) {
      const query = params.get(key);
      if (query) {
        window.location.hash = `/search/anime/${encodeURIComponent(query)}`;
        break;
      }
    }
  }
}
