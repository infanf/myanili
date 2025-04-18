import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class SpotifyIconComponent extends IconComponent {
  name = 'spotify';
}
