import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-annict',
  templateUrl: './annict.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class AnnictIconComponent extends IconComponent {
  name = 'annict';
}
