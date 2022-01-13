import { Component, Input } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { ReadStatus } from '@models/manga';

@Component({
  selector: 'myanili-status-badge',
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  @Input() status?: ReadStatus | WatchStatus;
  @Input() progress?: number;
  @Input() parts?: number;
}
