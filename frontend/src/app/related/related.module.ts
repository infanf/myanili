import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';

import { AnimeRelatedComponent } from './anime/anime.component';
import { LiveactionRelatedComponent } from './liveaction/liveaction.component';
import { MangaRelatedComponent } from './manga/manga.component';

@NgModule({
  declarations: [AnimeRelatedComponent, LiveactionRelatedComponent, MangaRelatedComponent],
  imports: [CommonModule, ComponentsModule, RouterModule],
  exports: [AnimeRelatedComponent, LiveactionRelatedComponent, MangaRelatedComponent],
})
export class RelatedModule {}
