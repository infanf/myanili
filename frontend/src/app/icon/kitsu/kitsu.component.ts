import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-kitsu',
  templateUrl: './kitsu.component.html',
  styleUrls: ['../icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class KitsuIconComponent extends IconComponent {
  name = 'kitsu';
}
