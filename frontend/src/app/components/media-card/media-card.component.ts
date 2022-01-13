import { Component, Input } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { ReadStatus } from '@models/manga';

@Component({
  selector: 'myanili-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss'],
})
export class MediaCardComponent {
  @Input() poster?: string;
  @Input() title = '';
  @Input() mediaType?: string;
  @Input() status?: ReadStatus | WatchStatus;
  @Input() progress?: number;
  @Input() parts?: number;
}
