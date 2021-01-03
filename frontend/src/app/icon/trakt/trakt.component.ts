import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-trakt',
  templateUrl: './trakt.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class TraktIconComponent extends IconComponent {
  name = 'trakt';
}
