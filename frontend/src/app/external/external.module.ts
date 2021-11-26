import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '@icon/icon.module';

import { DirectivesModule } from '../directives/directives.module';

import { AnisearchComponent } from './anisearch/anisearch.component';
import { AnnictComponent } from './annict/annict.component';
import { BakamangaComponent } from './bakamanga/bakamanga.component';
import { ExternalComponent } from './external.component';
import { TraktComponent } from './trakt/trakt.component';

@NgModule({
  declarations: [
    ExternalComponent,
    TraktComponent,
    AnisearchComponent,
    BakamangaComponent,
    AnnictComponent,
  ],
  imports: [FormsModule, CommonModule, IconModule, DirectivesModule],
  exports: [],
})
export class ExternalModule {}
