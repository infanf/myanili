import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { CharacterAnimeComponent } from './anime/anime.component';
import { CharacterComponent } from './character.component';
import { CharacterMangaComponent } from './manga/manga.component';
import { CharacterVoicesComponent } from './voices/voices.component';

@NgModule({
  declarations: [
    CharacterAnimeComponent,
    CharacterComponent,
    CharacterMangaComponent,
    CharacterVoicesComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    IconModule,
    NgbNavModule,
    RouterModule.forChild([{ path: ':id', component: CharacterComponent }]),
  ],
  exports: [
    CharacterAnimeComponent,
    CharacterComponent,
    CharacterMangaComponent,
    CharacterVoicesComponent,
  ],
})
export class CharacterModule {}
