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
import { CharacterAnimeComponent } from './character/anime/anime.component';
import { CharacterComponent } from './character/character.component';
import { CharacterMangaComponent } from './character/manga/manga.component';
import { CharacterVoicesComponent } from './character/voices/voices.component';
import { DirectivesModule } from './directives/directives.module';
import {
  BookshelfComponent,
  BookshelfWrapperComponent,
} from './manga/bookshelf/bookshelf.component';
import { MangaCharactersComponent } from './manga/details/characters/characters.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaRecommendationsComponent } from './manga/details/recommendations/recommendations.component';
import { MangaListGridComponent } from './manga/list/grid/grid.component';
import { MangaListComponent } from './manga/list/list.component';
import { MangaListListComponent } from './manga/list/list/list.component';
import { MagazineComponent } from './manga/magazine/magazine.component';
import { PlatformComponent } from './manga/widget/platform/platform.component';
import { NavbarBottomComponent } from './navbar/bottom/bottom.component';
import { NotificationsComponent } from './navbar/notifications/notifications.component';
import { NavbarTopComponent } from './navbar/top/top.component';
import { PersonAnimeComponent } from './person/anime/anime.component';
import { PersonMangaComponent } from './person/manga/manga.component';
import { PersonComponent } from './person/person.component';
import { PersonStaffComponent } from './person/staff/staff.component';
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
  { path: 'manga/list', component: MangaListComponent },
  { path: 'manga/list/:status', component: MangaListComponent },
  { path: 'manga/bookshelf', component: BookshelfWrapperComponent },
  { path: 'manga/details/:id', component: MangaDetailsComponent },
  { path: 'manga/magazine/:id', component: MagazineComponent },
  { path: 'manga', redirectTo: '/manga/bookshelf', pathMatch: 'full' },
  { path: 'search', redirectTo: '/anime/search', pathMatch: 'full' },
  { path: 'character/:id', component: CharacterComponent },
  { path: 'person/:id', component: PersonComponent },
  { path: '', redirectTo: '/anime/watchlist', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    BookshelfComponent,
    BookshelfWrapperComponent,
    ChangelogComponent,
    CharacterAnimeComponent,
    CharacterComponent,
    CharacterMangaComponent,
    CharacterVoicesComponent,
    MagazineComponent,
    MangaCharactersComponent,
    MangaDetailsComponent,
    MangaListComponent,
    MangaListGridComponent,
    MangaListListComponent,
    MangaRecommendationsComponent,
    MigrateBakaComponent,
    NavbarBottomComponent,
    NavbarTopComponent,
    NewVersionComponent,
    NotificationsComponent,
    PersonAnimeComponent,
    PersonComponent,
    PersonMangaComponent,
    PersonStaffComponent,
    PlatformComponent,
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
    RelatedModule,
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  providers: [Title],

  bootstrap: [AppComponent],
})
export class AppModule {}
