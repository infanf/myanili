import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-livechart',
  templateUrl: './livechart.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class LivechartIconComponent extends IconComponent {
  name = 'annict';
}
