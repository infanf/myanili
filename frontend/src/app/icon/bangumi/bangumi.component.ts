import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-bangumi',
  templateUrl: './bangumi.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class BangumiIconComponent extends IconComponent {
  name = 'bangumi';
}
