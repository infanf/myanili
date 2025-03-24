import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-livechart',
  templateUrl: './livechart.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class LivechartIconComponent extends IconComponent {
  name = 'annict';
}
