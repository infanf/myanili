import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-animeschedule',
  templateUrl: './animeschedule.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class AnimescheduleIconComponent extends IconComponent {
  name = 'animeschedule';
}
