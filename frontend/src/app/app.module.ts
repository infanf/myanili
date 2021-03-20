import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IvyGalleryModule } from 'angular-gallery';
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
import { SeasonComponent } from './anime/season/season.component';
import { TraktComponent } from './anime/trakt/trakt.component';
import { WatchlistComponent } from './anime/watchlist/watchlist.component';
import { StreamingComponent } from './anime/widget/streaming/streaming.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharacterComponent } from './character/character.component';
import { FlagPipe } from './flag.pipe';
import { GraphQLModule } from './graphql/graphql.module';
import { IconStatusComponent } from './icon-status/icon-status.component';
import { AnilistIconComponent } from './icon/anilist/anilist.component';
import { AnnictIconComponent } from './icon/annict/annict.component';
import { IconComponent } from './icon/icon.component';
import { KitsuIconComponent } from './icon/kitsu/kitsu.component';
import { MalIconComponent } from './icon/mal/mal.component';
import { SimklIconComponent } from './icon/simkl/simkl.component';
import { SpotifyIconComponent } from './icon/spotify/spotify.component';
import { TraktIconComponent } from './icon/trakt/trakt.component';
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
    IconComponent,
    WatchlistComponent,
    FlagPipe,
    MalPipe,
    TimePipe,
    StreamPipe,
    PlatformPipe,
    ScheduleComponent,
    SeasonComponent,
    SettingsComponent,
    IconStatusComponent,
    WidgetSeasonComponent,
    StreamingComponent,
    TraktComponent,
    MangaDetailsComponent,
    MangaListComponent,
    SpotifyIconComponent,
    MalIconComponent,
    TraktIconComponent,
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
    AnilistIconComponent,
    KitsuIconComponent,
    QuickaddComponent,
    SimklIconComponent,
    AnnictIconComponent,
    ExternalRatingComponent,
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
      outerStrokeColor: '#2c3e50',
      innerStrokeColor: 'rgba(0,0,0,0.15)',
      animation: false,
      backgroundPadding: 0,
      outerStrokeLinecap: 'butt',
    }),
    IvyGalleryModule,
    AngularSvgIconModule.forRoot(),
    GraphQLModule,
  ],
  providers: [TimePipe, StreamPipe, PlatformPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
