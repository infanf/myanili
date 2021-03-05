import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-kitsu',
  templateUrl: './kitsu.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class KitsuIconComponent extends IconComponent {
  name = 'kitsu';
}
