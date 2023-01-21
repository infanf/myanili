import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { PersonAnimeComponent } from './anime/anime.component';
import { PersonMangaComponent } from './manga/manga.component';
import { PersonComponent } from './person.component';
import { PersonStaffComponent } from './staff/staff.component';

@NgModule({
  declarations: [PersonAnimeComponent, PersonComponent, PersonMangaComponent, PersonStaffComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    IconModule,
    NgbNavModule,
    RouterModule.forChild([{ path: ':id', component: PersonComponent }]),
  ],
  exports: [PersonAnimeComponent, PersonComponent, PersonMangaComponent, PersonStaffComponent],
})
export class PersonModule {}
