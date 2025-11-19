import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ComponentsModule } from '@components/components.module';
import { ExternalModule } from '@external/external.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { DirectivesModule } from './directives/directives.module';
import { NavbarModule } from './navbar/navbar.module';
import { SettingsModule } from './settings/settings.module';

const routes: Routes = [
  { path: 'anime/search', redirectTo: 'search/anime', pathMatch: 'full' },
  { path: 'anime', loadChildren: () => import('@anime/anime.module').then(m => m.AnimeModule) },
  { path: 'manga/search', redirectTo: 'search/manga', pathMatch: 'full' },
  { path: 'manga', loadChildren: () => import('@manga/manga.module').then(m => m.MangaModule) },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
  },
  {
    path: 'character',
    loadChildren: () => import('./character/character.module').then(m => m.CharacterModule),
  },
  {
    path: 'person',
    loadChildren: () => import('./person/person.module').then(m => m.PersonModule),
  },
  {
    path: 'feed',
    loadChildren: () => import('./feed/feed.module').then(m => m.FeedModule),
  },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularSvgIconModule.forRoot(),
    IconModule,
    DirectivesModule,
    ExternalModule,
    ComponentsModule,
    NavbarModule,
    RouterModule.forRoot(routes, { useHash: true }),
    SettingsModule,
  ],
  providers: [Title],

  bootstrap: [AppComponent],
})
export class AppModule {}
