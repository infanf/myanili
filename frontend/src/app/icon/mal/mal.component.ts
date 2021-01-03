import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-mal',
  templateUrl: './mal.component.html',
  styleUrls: ['./mal.component.scss', '../icon.component.scss'],
})
export class MalIconComponent extends IconComponent {
  name = 'mal';
}
