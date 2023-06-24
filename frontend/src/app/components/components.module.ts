import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconModule } from '@icon/icon.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { AnnNewsComponent } from './ann-news/ann-news.component';
import { DateAgoPipe } from './date-ago.pipe';
import { DayPipe } from './day.pipe';
import { DialogueComponent } from './dialogue/dialogue.component';
import { RatingDialogueComponent } from './dialogue/rating/rating.component';
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
import { RatingComponent } from './rating/rating.component';
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
    RatingDialogueComponent,
    RatingComponent,
    DoubleCardComponent,
    ExternalRatingComponent,
    PosterRatingComponent,
    MySvgIconComponent,
    HeaderComponent,
    WidgetSeasonComponent,
    ToasterComponent,
    DateAgoPipe,
    AnnNewsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconModule,
    NgbModalModule,
    AngularSvgIconModule.forRoot(),
    RouterModule,
  ],
  exports: [
    AnnNewsComponent,
    ValuePairComponent,
    ValuePairArrayComponent,
    MediaCardComponent,
    DoubleCardComponent,
    StatusBadgeComponent,
    ExternalRatingComponent,
    PosterRatingComponent,
    RatingComponent,
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
