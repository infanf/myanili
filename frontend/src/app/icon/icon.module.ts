import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AnidbComponent } from './anidb/anidb.component';
import { AnilistIconComponent } from './anilist/anilist.component';
import { AniplaylistIconComponent } from './aniplaylist/aniplaylist.component';
import { AnisearchIconComponent } from './anisearch/anisearch.component';
import { AnnComponent } from './ann/ann.component';
import { AnnictIconComponent } from './annict/annict.component';
import { ApComponent } from './ap/ap.component';
import { BakamangaIconComponent } from './bakamanga/bakamanga.component';
import { FandomIconComponent } from './fandom/fandom.component';
import { IconComponent } from './icon.component';
import { KitsuIconComponent } from './kitsu/kitsu.component';
import { LivechartIconComponent } from './livechart/livechart.component';
import { LoadingIconComponent } from './loading/loading.component';
import { MalIconComponent } from './mal/mal.component';
import { MangaPassionComponent } from './manga-passion/manga-passion.component';
import { MangadexIconComponent } from './mangadex/mangadex.component';
import { ProgressIconComponent } from './progress/progress.component';
import { ShikimoriIconComponent } from './shikimori/shikimori.component';
import { SimklIconComponent } from './simkl/simkl.component';
import { SpotifyIconComponent } from './spotify/spotify.component';
import { IconStatusComponent } from './status/icon-status.component';
import { TraktIconComponent } from './trakt/trakt.component';

@NgModule({
  declarations: [
    IconComponent,
    AnidbComponent,
    AnilistIconComponent,
    AniplaylistIconComponent,
    AnnComponent,
    AnnictIconComponent,
    BakamangaIconComponent,
    FandomIconComponent,
    KitsuIconComponent,
    LivechartIconComponent,
    MalIconComponent,
    MangadexIconComponent,
    SimklIconComponent,
    SpotifyIconComponent,
    IconStatusComponent,
    TraktIconComponent,
    AnisearchIconComponent,
    ProgressIconComponent,
    LoadingIconComponent,
    MangaPassionComponent,
    ApComponent,
    ShikimoriIconComponent,
  ],
  exports: [
    IconComponent,
    AnidbComponent,
    AnilistIconComponent,
    AniplaylistIconComponent,
    AnnComponent,
    AnnictIconComponent,
    ApComponent,
    BakamangaIconComponent,
    FandomIconComponent,
    KitsuIconComponent,
    LivechartIconComponent,
    MalIconComponent,
    MangadexIconComponent,
    MangaPassionComponent,
    ShikimoriIconComponent,
    SimklIconComponent,
    SpotifyIconComponent,
    IconStatusComponent,
    TraktIconComponent,
    AnisearchIconComponent,
    ProgressIconComponent,
    LoadingIconComponent,
    NgCircleProgressModule,
  ],
  imports: [
    CommonModule,
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
    }),
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class IconModule {}
