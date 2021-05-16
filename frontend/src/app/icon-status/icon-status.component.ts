import { Component, Input, OnInit } from '@angular/core';
import { WatchStatus } from '@models/mal-anime';
import { ReadStatus } from '@models/mal-manga';
import { PersonalStatus } from '@models/media';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-icon-status',
  templateUrl: './icon-status.component.html',
  styleUrls: ['./icon-status.component.scss'],
})
export class IconStatusComponent extends IconComponent implements OnInit {
  @Input() status?: PersonalStatus | WatchStatus | ReadStatus;

  ngOnInit() {
    switch (this.status) {
      case 'watching':
      case 'reading':
      case 'current':
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
      case 'planning':
        this.name = 'clock';
        break;
      default:
        this.name = 'question';
    }
  }
}
