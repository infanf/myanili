import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ComponentsModule } from '@components/components.module';
import { ExternalModule } from '@external/external.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgCircleProgressModule } from 'ng-circle-progress';
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
import { DirectivesModule } from './directives/directives.module';
import { GraphQLModule } from './graphql/graphql.module';
import { MalComponent } from './mal/mal.component';
import {
  BookshelfComponent,
  BookshelfWrapperComponent,
} from './manga/bookshelf/bookshelf.component';
import { MangaCharactersComponent } from './manga/details/characters/characters.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaRecommendationsComponent } from './manga/details/recommendations/recommendations.component';
import { MangaRelatedComponent } from './manga/details/related/related.component';
import { MangaListComponent } from './manga/list/list.component';
import { MagazineComponent } from './manga/magazine/magazine.component';
import { PlatformComponent } from './manga/widget/platform/platform.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QuickaddComponent } from './navbar/quickadd/quickadd.component';
import { PersonComponent } from './person/person.component';
import { ChangelogComponent } from './settings/changelog/changelog.component';
import { SettingsComponent } from './settings/settings.component';
import { WidgetSeasonComponent } from './settings/widget-season/widget-season.component';
import { ExternalRatingComponent } from './widget/external-rating/external-rating.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AnimeListComponent,
    AnimeDetailsComponent,
    WatchlistComponent,
    ScheduleComponent,
    SeasonComponent,
    SettingsComponent,
    WidgetSeasonComponent,
    StreamingComponent,
    MangaDetailsComponent,
    MangaListComponent,
    MalComponent,
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
    QuickaddComponent,
    ExternalRatingComponent,
    SeasonGridComponent,
    SeasonListComponent,
    ChangelogComponent,
    CharacterAnimeComponent,
    CharacterMangaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
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
  ],
  providers: [Title],

  bootstrap: [AppComponent],
})
export class AppModule {}
