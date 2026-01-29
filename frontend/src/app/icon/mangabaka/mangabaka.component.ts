import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-mangabaka',
  templateUrl: './mangabaka.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class MangabakaIconComponent extends IconComponent {
  name = 'mangabaka';
}
