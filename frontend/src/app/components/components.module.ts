import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from '@icon/icon.module';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { DayPipe } from './day.pipe';
import { DialogueComponent } from './dialogue/dialogue.component';
import { RatingComponent } from './dialogue/rating/rating.component';
import { FlagPipe } from './flag.pipe';
import { MalPipe } from './mal.pipe';
import { MediaCardComponent } from './media-card/media-card.component';
import { StatusBadgeComponent } from './media-card/status-badge/status-badge.component';
import { Nl2brPipe } from './nl2br.pipe';
import { PlatformPipe } from './platform.pipe';
import { StreamPipe } from './stream.pipe';
import { TimePipe } from './time.pipe';
import { ValuePairArrayComponent } from './value-pair-array/value-pair-array.component';
import { ValuePairComponent } from './value-pair/value-pair.component';

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
  ],
  exports: [
    ValuePairComponent,
    ValuePairArrayComponent,
    MediaCardComponent,
    StatusBadgeComponent,
    MalPipe,
    FlagPipe,
    TimePipe,
    DayPipe,
    StreamPipe,
    PlatformPipe,
    Nl2brPipe,
  ],
  providers: [TimePipe, StreamPipe, PlatformPipe, DayPipe],
})
export class ComponentsModule {}
