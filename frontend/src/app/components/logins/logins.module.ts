import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';

import { AnilistLoginComponent } from './anilist-login/anilist-login.component';
import { AnisearchLoginComponent } from './anisearch-login/anisearch-login.component';
import { AnnictLoginComponent } from './annict-login/annict-login.component';
import { BakaLoginComponent } from './baka-login/baka-login.component';
import { KitsuLoginComponent } from './kitsu-login/kitsu-login.component';
import { LivechartLoginComponent } from './livechart-login/livechart-login.component';
import { LoginsComponent } from './logins.component';
import { MalLoginComponent } from './mal-login/mal-login.component';
import { ShikimoriLoginComponent } from './shikimori-login/shikimori-login.component';
import { SimklLoginComponent } from './simkl-login/simkl-login.component';
import { TraktLoginComponent } from './trakt-login/trakt-login.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    LoginsComponent,
    MalLoginComponent,
    AnilistLoginComponent,
    AnisearchLoginComponent,
    KitsuLoginComponent,
    ShikimoriLoginComponent,
    TraktLoginComponent,
    SimklLoginComponent,
    AnnictLoginComponent,
    BakaLoginComponent,
    LivechartLoginComponent,
  ],
  imports: [CommonModule, FormsModule, IconModule, ComponentsModule],
  exports: [LoginsComponent],
})
export class LoginsModule {}
