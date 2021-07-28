import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-fandom',
  templateUrl: './fandom.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class FandomIconComponent extends IconComponent {
  name = 'fandom';
}
