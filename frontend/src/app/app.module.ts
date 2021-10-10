import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
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
import { TraktComponent } from './anime/trakt/trakt.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { StreamingComponent } from './anime/widget/streaming/streaming.component';
import { AnisearchComponent } from './anisearch/anisearch.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharacterComponent } from './character/character.component';
import { DayPipe } from './day.pipe';
import { FlagPipe } from './flag.pipe';
import { GraphQLModule } from './graphql/graphql.module';
import { IconModule } from './icon/icon.module';
import { LinkPipe } from './link.pipe';
import { MalPipe } from './mal.pipe';
import { MalComponent } from './mal/mal.component';
import { MangaCharactersComponent } from './manga/details/characters/characters.component';
import { MangaDetailsComponent } from './manga/details/details.component';
import { MangaRecommendationsComponent } from './manga/details/recommendations/recommendations.component';
import { MangaRelatedComponent } from './manga/details/related/related.component';
import { MangaListComponent } from './manga/list/list.component';
import { MagazineComponent } from './manga/magazine/magazine.component';
import { ReadlistComponent, ReadlistWrapperComponent } from './manga/readlist/readlist.component';
import { PlatformComponent } from './manga/widget/platform/platform.component';
import { NavbarComponent } from './navbar/navbar.component';
import { QuickaddComponent } from './navbar/quickadd/quickadd.component';
import { Nl2brPipe } from './nl2br.pipe';
import { PersonComponent } from './person/person.component';
import { PlatformPipe } from './platform.pipe';
import { SettingsComponent } from './settings/settings.component';
import { WidgetSeasonComponent } from './settings/widget-season/widget-season.component';
import { StreamPipe } from './stream.pipe';
import { TimePipe } from './time.pipe';
import { ExternalRatingComponent } from './widget/external-rating/external-rating.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AnimeListComponent,
    AnimeDetailsComponent,
    WatchlistComponent,
    FlagPipe,
    MalPipe,
    TimePipe,
    DayPipe,
    LinkPipe,
    StreamPipe,
    PlatformPipe,
    ScheduleComponent,
    SeasonComponent,
    SettingsComponent,
    WidgetSeasonComponent,
    StreamingComponent,
    TraktComponent,
    MangaDetailsComponent,
    MangaListComponent,
    MalComponent,
    Nl2brPipe,
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
    ReadlistComponent,
    ReadlistWrapperComponent,
    AnimeListGridComponent,
    AnimeListListComponent,
    PlatformComponent,
    QuickaddComponent,
    ExternalRatingComponent,
    SeasonGridComponent,
    SeasonListComponent,
    AnisearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgCircleProgressModule.forRoot({
      radius: 5,
      outerStrokeWidth: 2,
      innerStrokeWidth: 2,
      space: -2,
      showBackground: false,
      showTitle: false,
      showUnits: false,
      showSubtitle: false,
      outerStrokeColor: 'currentColor',
      innerStrokeColor: 'rgba(0,0,0,0.15)',
      animation: false,
      backgroundPadding: 0,
      outerStrokeLinecap: 'butt',
    }),
    AngularSvgIconModule.forRoot(),
    GraphQLModule,
    IconModule,
  ],
  providers: [TimePipe, StreamPipe, PlatformPipe, Title, DayPipe],

  bootstrap: [AppComponent],
})
export class AppModule {}
