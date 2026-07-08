import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-bakamanga',
  templateUrl: './bakamanga.component.html',
  styleUrls: ['../icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class BakamangaIconComponent extends IconComponent {
  name = 'bakamanga';
}
