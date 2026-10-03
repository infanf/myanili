import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from '@app/directives/directives.module';
import { authGuard } from '@app/guards/auth.guard';
import { RelatedModule } from '@app/related/related.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InViewportModule } from 'ng-in-viewport';

import { BookshelfComponent, BookshelfWrapperComponent } from './bookshelf/bookshelf.component';
import { MangaCharactersComponent } from './details/characters/characters.component';
import { MangaDetailsComponent } from './details/details.component';
import { MangaEditComponent } from './details/edit/manga-edit.component';
import { MangaRecommendationsComponent } from './details/recommendations/recommendations.component';
import { MangaListGridComponent } from './list/grid/grid.component';
import { MangaListComponent } from './list/list.component';
import { MangaListListComponent } from './list/list/list.component';
import { PlatformComponent } from './widget/platform/platform.component';

@NgModule({
  declarations: [
    BookshelfComponent,
    BookshelfWrapperComponent,
    MangaCharactersComponent,
    MangaDetailsComponent,
    MangaEditComponent,
    MangaListComponent,
    MangaListGridComponent,
    MangaListListComponent,
    MangaRecommendationsComponent,
    PlatformComponent,
  ],
  imports: [
    AngularSvgIconModule.forRoot(),
    IconModule,
    InViewportModule,
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    FormsModule,
    NgbModule,
    RelatedModule,
    RouterModule.forChild([
      {
        path: 'list',
        canActivate: [authGuard],
        component: MangaListComponent,
        data: { reuse: 'volatile' },
      },
      {
        path: 'list/:status',
        canActivate: [authGuard],
        component: MangaListComponent,
        data: { reuse: 'volatile' },
      },
      {
        path: 'bookshelf',
        canActivate: [authGuard],
        component: BookshelfWrapperComponent,
        data: { reuse: 'volatile' },
      },
      { path: 'details/:id', component: MangaDetailsComponent, data: { reuse: 'volatile' } },
      { path: '', redirectTo: 'bookshelf', pathMatch: 'full' },
    ]),
  ],
  exports: [
    BookshelfComponent,
    BookshelfWrapperComponent,
    MangaCharactersComponent,
    MangaDetailsComponent,
    MangaListComponent,
    MangaListGridComponent,
    MangaListListComponent,
    MangaRecommendationsComponent,
    PlatformComponent,
  ],
})
export class MangaModule {}
