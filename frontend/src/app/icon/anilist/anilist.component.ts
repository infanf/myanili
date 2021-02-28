import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-anilist',
  templateUrl: './anilist.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class AnilistIconComponent extends IconComponent {
  name = 'anilist';
}
