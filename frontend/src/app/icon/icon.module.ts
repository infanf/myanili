import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AnilistIconComponent } from './anilist/anilist.component';
import { AnisearchIconComponent } from './anisearch/anisearch.component';
import { AnnictIconComponent } from './annict/annict.component';
import { BakamangaIconComponent } from './bakamanga/bakamanga.component';
import { FandomIconComponent } from './fandom/fandom.component';
import { IconComponent } from './icon.component';
import { KitsuIconComponent } from './kitsu/kitsu.component';
import { LivechartIconComponent } from './livechart/livechart.component';
import { LoadingIconComponent } from './loading/loading.component';
import { MalIconComponent } from './mal/mal.component';
import { ProgressIconComponent } from './progress/progress.component';
import { SimklIconComponent } from './simkl/simkl.component';
import { SpotifyIconComponent } from './spotify/spotify.component';
import { IconStatusComponent } from './status/icon-status.component';
import { TraktIconComponent } from './trakt/trakt.component';

@NgModule({
  declarations: [
    IconComponent,
    AnilistIconComponent,
    AnnictIconComponent,
    BakamangaIconComponent,
    FandomIconComponent,
    KitsuIconComponent,
    LivechartIconComponent,
    MalIconComponent,
    SimklIconComponent,
    SpotifyIconComponent,
    IconStatusComponent,
    TraktIconComponent,
    AnisearchIconComponent,
    ProgressIconComponent,
    LoadingIconComponent,
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
  exports: [
    IconComponent,
    AnilistIconComponent,
    AnnictIconComponent,
    BakamangaIconComponent,
    FandomIconComponent,
    KitsuIconComponent,
    LivechartIconComponent,
    MalIconComponent,
    SimklIconComponent,
    SpotifyIconComponent,
    IconStatusComponent,
    TraktIconComponent,
    AnisearchIconComponent,
    ProgressIconComponent,
    LoadingIconComponent,
  ],
})
export class IconModule {}
