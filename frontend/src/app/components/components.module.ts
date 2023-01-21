import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconModule } from '@icon/icon.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { DateAgoPipe } from './date-ago.pipe';
import { DayPipe } from './day.pipe';
import { DialogueComponent } from './dialogue/dialogue.component';
import { RatingComponent } from './dialogue/rating/rating.component';
import { DoubleCardComponent } from './double-card/double-card.component';
import { ExternalRatingComponent } from './external-rating/external-rating.component';
import { FlagPipe } from './flag.pipe';
import { HeaderComponent } from './header/header.component';
import { MalPipe } from './mal.pipe';
import { MediaCardComponent } from './media-card/media-card.component';
import { StatusBadgeComponent } from './media-card/status-badge/status-badge.component';
import { Nl2brPipe } from './nl2br.pipe';
import { PlatformPipe } from './platform.pipe';
import { PosterRatingComponent } from './poster-rating/poster-rating.component';
import { StreamPipe } from './stream.pipe';
import { MySvgIconComponent } from './svg-icon/svg-icon.component';
import { TimePipe } from './time.pipe';
import { ToasterComponent } from './toaster/toaster.component';
import { ValuePairArrayComponent } from './value-pair-array/value-pair-array.component';
import { ValuePairComponent } from './value-pair/value-pair.component';
import { WidgetSeasonComponent } from './widget-season/widget-season.component';

@NgModule({
  declarations: [
    ValuePairComponent,
    ValuePairArrayComponent,
    MediaCardComponent,
    MalPipe,
    StatusBadgeComponent,
    FlagPipe,
    TimePipe,
    DayPipe,
    StreamPipe,
    PlatformPipe,
    Nl2brPipe,
    DialogueComponent,
    RatingComponent,
    DoubleCardComponent,
    ExternalRatingComponent,
    PosterRatingComponent,
    MySvgIconComponent,
    HeaderComponent,
    WidgetSeasonComponent,
    ToasterComponent,
    DateAgoPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    NgbModalModule,
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
    AngularSvgIconModule.forRoot(),
    RouterModule,
  ],
  exports: [
    ValuePairComponent,
    ValuePairArrayComponent,
    MediaCardComponent,
    DoubleCardComponent,
    StatusBadgeComponent,
    ExternalRatingComponent,
    PosterRatingComponent,
    MySvgIconComponent,
    HeaderComponent,
    WidgetSeasonComponent,
    ToasterComponent,
    MalPipe,
    FlagPipe,
    TimePipe,
    DayPipe,
    StreamPipe,
    PlatformPipe,
    Nl2brPipe,
    DateAgoPipe,
  ],
  providers: [TimePipe, StreamPipe, PlatformPipe, DayPipe],
})
export class ComponentsModule {}
