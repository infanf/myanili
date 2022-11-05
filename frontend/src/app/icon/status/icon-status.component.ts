import { Component, Input, OnInit } from '@angular/core';
import { WatchStatus } from '@models/anime';
import { ReadStatus } from '@models/manga';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-status',
  templateUrl: './icon-status.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class IconStatusComponent extends IconComponent implements OnInit {
  @Input() status?: WatchStatus | ReadStatus;

  ngOnInit() {
    switch (this.status) {
      case 'watching':
      case 'reading':
        this.name = 'eye';
        break;
      case 'on_hold':
        this.name = 'hourglass';
        break;
      case 'dropped':
        this.name = 'trash';
        break;
      case 'completed':
        this.name = 'check2';
        break;
      case 'plan_to_watch':
      case 'plan_to_read':
        this.name = 'clock';
        break;
      default:
        this.name = 'question';
    }
  }
}
