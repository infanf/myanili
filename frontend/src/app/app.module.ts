import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ComponentsModule } from '@components/components.module';
import { ExternalModule } from '@external/external.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ApolloModule } from 'apollo-angular';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { InViewportModule } from 'ng-in-viewport';
import { environment } from 'src/environments/environment';

import { AnimeCharactersComponent } from './anime/details/characters/characters.component';
import { AnimeDetailsComponent } from './anime/details/details.component';
import { AnimeRecommendationsComponent } from './anime/details/recommendations/recommendations.component';
import { AnimeRelatedComponent } from './anime/details/related/related.component';
import { AnimeSongsComponent } from './anime/details/songs/songs.component';
import { StaffComponent } from './anime/details/staff/staff.component';
import { AnimeListGridComponent } from './anime/list/grid/grid.component';
import { AnimeListComponent } from './anime/list/list.component';
import { AnimeListListComponent } from './anime/list/list/list.component';
import { ProducerComponent } from './anime/producer/producer.component';
import { ScheduleComponent } from './anime/schedule/schedule.component';
import { SeasonGridComponent } from './anime/season/grid/grid.component';
import { SeasonListComponent } from './anime/season/list/list.component';
import { SeasonComponent } from './anime/season/season.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { StreamingComponent } from './anime/widget/streaming/streaming.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharacterAnimeComponent } from './character/anime/anime.component';
import { CharacterComponent } from './character/character.component';
import { CharacterMangaComponent } from './character/manga/manga.component';
import { CharacterVoicesComponent } from './character/voices/voices.component';
import { DirectivesModule } from './directives/directives.module';
import { GraphQLModule } from './graphql/graphql.module';
import { LiveactionRelatedComponent } from './liveaction/related/related.component';
import {
  BookshelfComponent,
  BookshelfWrapperComponent,
} from './manga/bookshelf/bookshelf.component';
import { MangaCharactersComponent } from './manga/details/characters/characters.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaRecommendationsComponent } from './manga/details/recommendations/recommendations.component';
import { MangaRelatedComponent } from './manga/details/related/related.component';
import { MangaListGridComponent } from './manga/list/grid/grid.component';
import { MangaListComponent } from './manga/list/list.component';
import { MangaListListComponent } from './manga/list/list/list.component';
import { MagazineComponent } from './manga/magazine/magazine.component';
import { PlatformComponent } from './manga/widget/platform/platform.component';
import { NavbarBottomComponent } from './navbar/bottom/bottom.component';
import { NavbarTopComponent } from './navbar/top/top.component';
import { PersonAnimeComponent } from './person/anime/anime.component';
import { PersonMangaComponent } from './person/manga/manga.component';
import { PersonComponent } from './person/person.component';
import { PersonStaffComponent } from './person/staff/staff.component';
import { SearchComponent } from './search/search.component';
import { AboutComponent } from './settings/about/about.component';
import { ChangelogComponent } from './settings/changelog/changelog.component';
import { MigrateBakaComponent } from './settings/migrate-baka/migrate-baka.component';
import { NewVersionComponent } from './settings/new-version/new-version.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarTopComponent,
    AnimeListComponent,
    AnimeDetailsComponent,
    WatchlistComponent,
    ScheduleComponent,
    SeasonComponent,
    SettingsComponent,
    StreamingComponent,
    MangaDetailsComponent,
    MangaListComponent,
    SearchComponent,
    AnimeCharactersComponent,
    AnimeRecommendationsComponent,
    AnimeRelatedComponent,
    MangaRelatedComponent,
    AnimeSongsComponent,
    MangaRecommendationsComponent,
    MangaCharactersComponent,
    CharacterComponent,
    PersonComponent,
    ProducerComponent,
    MagazineComponent,
    StaffComponent,
    BookshelfComponent,
    BookshelfWrapperComponent,
    AnimeListGridComponent,
    AnimeListListComponent,
    PlatformComponent,
    SeasonGridComponent,
    SeasonListComponent,
    ChangelogComponent,
    CharacterAnimeComponent,
    CharacterMangaComponent,
    CharacterVoicesComponent,
    PersonAnimeComponent,
    PersonMangaComponent,
    PersonStaffComponent,
    AboutComponent,
    NewVersionComponent,
    MigrateBakaComponent,
    MangaListListComponent,
    MangaListGridComponent,
    LiveactionRelatedComponent,
    NavbarBottomComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    GraphQLModule,
    IconModule,
    ExternalModule,
    DirectivesModule,
    ComponentsModule,
    ApolloModule,
    InViewportModule,
  ],
  providers: [Title],

  bootstrap: [AppComponent],
})
export class AppModule {}
