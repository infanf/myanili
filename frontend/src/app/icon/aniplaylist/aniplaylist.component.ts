import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-aniplaylist',
  templateUrl: './aniplaylist.component.html',
  styleUrls: ['../icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AniplaylistIconComponent extends IconComponent {
  name = 'aniplaylist';
}
