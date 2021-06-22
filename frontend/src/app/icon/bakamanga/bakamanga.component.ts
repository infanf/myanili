import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-bakamanga',
  templateUrl: './bakamanga.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class BakamangaIconComponent extends IconComponent {
  name = 'bakamanga';
}
