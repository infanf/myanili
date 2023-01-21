import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectivesModule } from '@app/directives/directives.module';
import { RelatedModule } from '@app/related/related.module';
import { ComponentsModule } from '@components/components.module';
import { IconModule } from '@icon/icon.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { InViewportModule } from 'ng-in-viewport';

import { BookshelfComponent, BookshelfWrapperComponent } from './bookshelf/bookshelf.component';
import { MangaCharactersComponent } from './details/characters/characters.component';
import { MangaDetailsComponent } from './details/details.component';
import { MangaRecommendationsComponent } from './details/recommendations/recommendations.component';
import { MangaListGridComponent } from './list/grid/grid.component';
import { MangaListComponent } from './list/list.component';
import { MangaListListComponent } from './list/list/list.component';
import { MagazineComponent } from './magazine/magazine.component';
import { PlatformComponent } from './widget/platform/platform.component';

@NgModule({
  declarations: [
    BookshelfComponent,
    BookshelfWrapperComponent,
    MagazineComponent,
    MangaCharactersComponent,
    MangaDetailsComponent,
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
      class: 'align-text-top',
    }),
    RelatedModule,
    RouterModule.forChild([
      { path: 'list', component: MangaListComponent },
      { path: 'list/:status', component: MangaListComponent },
      { path: 'bookshelf', component: BookshelfWrapperComponent },
      { path: 'details/:id', component: MangaDetailsComponent },
      { path: 'magazine/:id', component: MagazineComponent },
      { path: '', redirectTo: 'bookshelf', pathMatch: 'full' },
    ]),
  ],
  exports: [
    BookshelfComponent,
    BookshelfWrapperComponent,
    MagazineComponent,
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
