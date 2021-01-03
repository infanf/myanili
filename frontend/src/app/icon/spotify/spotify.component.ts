import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-spotify',
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.scss', '../icon.component.scss'],
})
export class SpotifyIconComponent extends IconComponent {
  name = 'spotify';
}
