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
  @Input() recommendations?: number;
  @Input() icon?: string;
  get bgClass() {
    switch (this.status) {
      case 'dropped':
        return 'bg-danger';
      case 'completed':
        return 'bg-success';
      case 'on_hold':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }
}
