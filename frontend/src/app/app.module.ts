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
import { NgCircleProgressModule } from 'ng-circle-progress';
import { InViewportModule } from 'ng-in-viewport';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { DirectivesModule } from './directives/directives.module';
import { NavbarModule } from './navbar/navbar.module';
import { RelatedModule } from './related/related.module';
import { SearchComponent } from './search/search.component';
import { AboutComponent } from './settings/about/about.component';
import { ChangelogComponent } from './settings/changelog/changelog.component';
import { MigrateBakaComponent } from './settings/migrate-baka/migrate-baka.component';
import { NewVersionComponent } from './settings/new-version/new-version.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: ':type/search', component: SearchComponent },
  { path: 'anime', loadChildren: () => import('@anime/anime.module').then(m => m.AnimeModule) },
  { path: 'manga', loadChildren: () => import('@manga/manga.module').then(m => m.MangaModule) },
  { path: 'search', redirectTo: '/anime/search', pathMatch: 'full' },
  {
    path: 'character',
    loadChildren: () => import('./character/character.module').then(m => m.CharacterModule),
  },
  {
    path: 'person',
    loadChildren: () => import('./person/person.module').then(m => m.PersonModule),
  },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    ChangelogComponent,
    MigrateBakaComponent,
    NewVersionComponent,
    SearchComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgCircleProgressModule.forRoot({
      radius: 7,
      outerStrokeWidth: 1,
      innerStrokeWidth: 1,
      space: -1,
      showBackground: false,
      showTitle: false,
      showUnits: false,
      showSubtitle: false,
      outerStrokeColor: 'currentColor',
      innerStrokeColor: '#88888818',
      animation: false,
      backgroundPadding: 0,
      outerStrokeLinecap: 'butt',
      class: 'align-text-top',
    }),
    AngularSvgIconModule.forRoot(),
    IconModule,
    ExternalModule,
    DirectivesModule,
    ComponentsModule,
    InViewportModule,
    NavbarModule,
    RelatedModule,
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  providers: [Title],

  bootstrap: [AppComponent],
})
export class AppModule {}
