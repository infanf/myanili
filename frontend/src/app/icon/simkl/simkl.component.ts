import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-simkl',
  templateUrl: './simkl.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class SimklIconComponent extends IconComponent {
  name = 'simkl';
}
