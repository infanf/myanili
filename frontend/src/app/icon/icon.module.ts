import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnilistIconComponent } from './anilist/anilist.component';
import { AnisearchIconComponent } from './anisearch/anisearch.component';
import { AnnictIconComponent } from './annict/annict.component';
import { BakamangaIconComponent } from './bakamanga/bakamanga.component';
import { FandomIconComponent } from './fandom/fandom.component';
import { IconComponent } from './icon.component';
import { KitsuIconComponent } from './kitsu/kitsu.component';
import { LivechartIconComponent } from './livechart/livechart.component';
import { MalIconComponent } from './mal/mal.component';
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
  ],
  imports: [CommonModule],
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
  ],
})
export class IconModule {}
