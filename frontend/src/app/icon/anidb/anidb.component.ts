import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-anidb',
  templateUrl: './anidb.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class AnidbComponent extends IconComponent {
  name = 'anidb';
}
