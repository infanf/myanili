import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-mangadex',
  templateUrl: './mangadex.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class MangadexIconComponent extends IconComponent {
  name = 'mangadex';
}
