import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-anilist',
  templateUrl: './anilist.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class AnilistIconComponent extends IconComponent {
  name = 'anilist';
}
