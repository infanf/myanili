import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-aniplaylist',
  templateUrl: './aniplaylist.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class AniplaylistIconComponent extends IconComponent {
  name = 'aniplaylist';
}
