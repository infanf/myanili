import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-anisearch',
  templateUrl: './anisearch.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnisearchIconComponent extends IconComponent {
  name = 'anisearch';
}
