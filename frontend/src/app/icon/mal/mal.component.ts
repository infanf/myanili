import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-mal',
  templateUrl: './mal.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class MalIconComponent extends IconComponent {
  name = 'mal';
}
