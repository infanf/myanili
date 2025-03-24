import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-trakt',
  templateUrl: './trakt.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class TraktIconComponent extends IconComponent {
  name = 'trakt';
}
