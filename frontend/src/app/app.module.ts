import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IvyGalleryModule } from 'angular-gallery';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { environment } from 'src/environments/environment';

import { AnimeCharactersComponent } from './anime/details/characters/characters.component';
import { AnimeDetailsComponent } from './anime/details/details.component';
import { AnimeRecommendationsComponent } from './anime/details/recommendations/recommendations.component';
import { AnimeRelatedComponent } from './anime/details/related/related.component';
import { AnimeSongsComponent } from './anime/details/songs/songs.component';
import { StaffComponent } from './anime/details/staff/staff.component';
import { AnimeListComponent } from './anime/list/list.component';
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
import { IconStatusComponent } from './icon-status/icon-status.component';
import { IconComponent } from './icon/icon.component';
import { MalIconComponent } from './icon/mal/mal.component';
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
import { ReadlistComponent } from './manga/readlist/readlist.component';
import { NavbarComponent } from './navbar/navbar.component';
import { Nl2brPipe } from './nl2br.pipe';
import { PersonComponent } from './person/person.component';
import { SettingsComponent } from './settings/settings.component';
import { WidgetSeasonComponent } from './settings/widget-season/widget-season.component';
import { StreamPipe } from './stream.pipe';
import { TimePipe } from './time.pipe';

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
  ],
  providers: [TimePipe, StreamPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
