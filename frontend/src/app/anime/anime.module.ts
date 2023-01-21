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

import { AnimeCharactersComponent } from './details/characters/characters.component';
import { AnimeDetailsComponent } from './details/details.component';
import { AnimeRecommendationsComponent } from './details/recommendations/recommendations.component';
import { AnimeSongsComponent } from './details/songs/songs.component';
import { StaffComponent } from './details/staff/staff.component';
import { AnimeListGridComponent } from './list/grid/grid.component';
import { AnimeListComponent } from './list/list.component';
import { AnimeListListComponent } from './list/list/list.component';
import { ProducerComponent } from './producer/producer.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SeasonGridComponent } from './season/grid/grid.component';
import { SeasonListComponent } from './season/list/list.component';
import { SeasonComponent } from './season/season.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { StreamingComponent } from './widget/streaming/streaming.component';

@NgModule({
  declarations: [
    AnimeCharactersComponent,
    AnimeDetailsComponent,
    AnimeListComponent,
    AnimeListGridComponent,
    AnimeListListComponent,
    AnimeRecommendationsComponent,
    AnimeRecommendationsComponent,
    AnimeSongsComponent,
    ProducerComponent,
    ScheduleComponent,
    SeasonComponent,
    SeasonGridComponent,
    SeasonListComponent,
    StaffComponent,
    StreamingComponent,
    WatchlistComponent,
  ],
  imports: [
    AngularSvgIconModule.forRoot(),
    CommonModule,
    ComponentsModule,
    DirectivesModule,
    FormsModule,
    IconModule,
    InViewportModule,
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
      { path: 'list', component: AnimeListComponent },
      { path: 'list', component: AnimeListComponent },
      { path: 'list/:status', component: AnimeListComponent },
      { path: 'watchlist', component: WatchlistComponent },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'season', component: SeasonComponent },
      { path: 'details/:id', component: AnimeDetailsComponent },
      { path: 'producer/:id', component: ProducerComponent },
      { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
    ]),
  ],
  exports: [
    AnimeCharactersComponent,
    AnimeDetailsComponent,
    AnimeListComponent,
    AnimeListGridComponent,
    AnimeListListComponent,
    AnimeRecommendationsComponent,
    AnimeRecommendationsComponent,
    AnimeSongsComponent,
    ProducerComponent,
    ScheduleComponent,
    SeasonComponent,
    SeasonGridComponent,
    SeasonListComponent,
    StaffComponent,
    StreamingComponent,
    WatchlistComponent,
  ],
})
export class AnimeModule {}
